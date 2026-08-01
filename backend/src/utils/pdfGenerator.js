import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { uploadToCloudflare } from './cloudflare.js';

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

    // Format Date & Time accurately in Asia/Kolkata timezone
    const rawDate = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
    const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
    const formattedDate = validDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const storeName = orderData.store?.name || orderData.storeName || 'Store Invoice';
    const storeAddress = orderData.store?.address || orderData.storeAddress || '';
    const storeGstin = orderData.store?.gstin || '';
    const storeLogo = orderData.store?.logo || orderData.store?.logoUrl || orderData.store?.imageUrl || orderData.storeLogo || null;

    // Compute store initials / abbreviation (e.g., "Indiranagar Supermarket" -> "IS")
    const storeInitials = storeName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .substring(0, 3)
      .toUpperCase() || 'ST';

    const invoiceContext = {
      orderNumber: orderData.orderNumber || `POS-${orderData.id?.slice(-6) || '000000'}`,
      invoiceDate: formattedDate,
      storeName,
      storeLogo,
      storeInitials,
      storeAddress,
      storeGstin,
      storeFssai: orderData.store?.fssai || '10021011000123',
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

    // 4. Save PDF to Cloudflare R2 bucket (with local disk fallback for dev)
    const filename = `invoice-${orderData.orderNumber || orderData.id}.pdf`;
    const r2Key = `invoices/${filename}`;
    let relativeUrl = `/uploads/invoices/${filename}`;
    let filePath = null;

    try {
      if (process.env.R2_BUCKET_NAME && process.env.R2_ACCOUNT_ID) {
        relativeUrl = await uploadToCloudflare(pdfBuffer, 'application/pdf', filename, r2Key);
      } else {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, pdfBuffer);
        relativeUrl = `/uploads/invoices/${filename}`;
      }
    } catch (r2Err) {
      console.warn('Cloudflare R2 invoice upload failed, using local fallback:', r2Err.message);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, pdfBuffer);
      relativeUrl = `/uploads/invoices/${filename}`;
    }

    return { pdfBuffer, filename, filePath, relativeUrl };
  } catch (error) {
    console.error('Failed to generate PDF via Puppeteer:', error);
    throw error;
  }
}
