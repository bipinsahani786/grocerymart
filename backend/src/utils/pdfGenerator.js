import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';

// Register Handlebars helpers
handlebars.registerHelper('increment', function (value) {
  return parseInt(value, 10) + 1;
});

handlebars.registerHelper('toFixed', function (number, decimals) {
  const num = parseFloat(number) || 0;
  return num.toFixed(decimals || 2);
});

export async function generateInvoicePdf(orderData) {
  try {
    // 1. Prepare Invoice Data
    const items = (orderData.items || []).map((item) => {
      const qty = item.qty || item.quantity || 1;
      const price = item.priceAtOrder || item.price || 0;
      return {
        name: item.product?.name || item.name || 'Item',
        sku: item.product?.sku || item.product?.barcode || '',
        qty,
        unit: item.unit || item.product?.unit || 'pcs',
        priceAtOrder: price,
        taxRate: item.taxRate || 0,
        lineTotal: qty * price,
      };
    });

    const taxAmount = Number(orderData.taxAmount || 0);
    const invoiceContext = {
      orderNumber: orderData.orderNumber || `POS-${orderData.id.slice(-6)}`,
      invoiceDate: new Date(orderData.createdAt || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      storeName: orderData.store?.name || 'GROCERY MART STORE',
      storeAddress: orderData.store?.address || 'Main Commercial Market',
      storeGstin: orderData.store?.gstin || '07AAAAA0000A1Z5',
      storeFssai: '10021011000123',
      paymentMethod: orderData.payment?.method || orderData.paymentMethod || 'CASH',
      cashierName: orderData.staff?.name || 'Store Cashier',
      customerName: orderData.customer?.name || 'Walk-in Customer',
      customerPhone: orderData.customer?.phone || '',
      items,
      subtotal: Number(orderData.subtotal || 0),
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      discount: Number(orderData.discount || orderData.discountAmount || 0),
      totalAmount: Number(orderData.totalAmount || 0),
    };

    // 2. Load & Compile Handlebars Template (invoice.hbs -> HTML)
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'invoice.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateHtml);
    const htmlString = compiledTemplate(invoiceContext);

    // 3. Launch Puppeteer (HTML -> PDF)
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium-browser') ? '/usr/bin/chromium-browser' : undefined);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      executablePath,
    });

    const page = await browser.newPage();
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });

    // Generate PDF Buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
    });

    await browser.close();

    // 4. Save PDF to public/uploads/invoices directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `invoice-${orderData.orderNumber || orderData.id}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

    const relativeUrl = `/uploads/invoices/${filename}`;
    return { pdfBuffer, filename, filePath, relativeUrl };
  } catch (error) {
    console.error('Failed to generate PDF via Puppeteer:', error);
    throw error;
  }
}
