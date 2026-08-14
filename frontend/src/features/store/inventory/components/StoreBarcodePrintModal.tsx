import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarcodeRenderer } from './BarcodeRenderer';
import { Printer, Minus, Plus, Eye, Settings, Tag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface StoreBarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  storeName?: string;
}

type LabelSize = 'small' | 'medium' | 'large';

const sizeConfig = {
  small: {
    name: 'Small (32mm x 25mm / 1.25" x 1")',
    width: '32mm',
    height: '25mm',
    barcodeHeight: 32,
    barcodeWidth: 1.2,
    storeFontSize: '8px',
    nameFontSize: '8px',
    priceFontSize: '9px',
    barcodeFontSize: '8px',
  },
  medium: {
    name: 'Medium (50mm x 25mm / 2" x 1")',
    width: '50mm',
    height: '25mm',
    barcodeHeight: 38,
    barcodeWidth: 1.4,
    storeFontSize: '9px',
    nameFontSize: '9px',
    priceFontSize: '11px',
    barcodeFontSize: '9px',
  },
  large: {
    name: 'Large (75mm x 50mm / 3" x 2")',
    width: '75mm',
    height: '50mm',
    barcodeHeight: 65,
    barcodeWidth: 1.8,
    storeFontSize: '11px',
    nameFontSize: '12px',
    priceFontSize: '15px',
    barcodeFontSize: '11px',
  },
};

export function StoreBarcodePrintModal({
  isOpen,
  onClose,
  product,
  storeName = 'GROCERY MART',
}: StoreBarcodePrintModalProps) {
  const [copies, setCopies] = useState<number>(1);
  const [size, setSize] = useState<LabelSize>('medium');
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true);

  if (!product) return null;

  const barcodeValue = product.barcode || product.sku || 'N/A';
  const price = product.basePrice || product.sellingPrice || 0;
  const config = sizeConfig[size];

  const handlePrint = () => {
    if (!barcodeValue) {
      toast.error('Product has no barcode or SKU to print.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      toast.error('Failed to open print window. Please allow popups.');
      return;
    }

    const svgElement = document.getElementById('preview-barcode-svg');
    if (!svgElement) {
      toast.error('Failed to capture barcode preview SVG.');
      return;
    }

    // Capture the exact rendered SVG HTML
    const svgHtml = svgElement.outerHTML;

    // Create the labels HTML structure
    let labelsHtml = '';
    for (let i = 0; i < copies; i++) {
      labelsHtml += `
        <div class="label-sheet">
          ${showStoreName ? `<div class="store-name">${storeName}</div>` : ''}
          ${showProductName ? `<div class="product-name">${product.name}</div>` : ''}
          <div class="barcode-container">
            ${svgHtml}
          </div>
          ${showPrice ? `<div class="price">₹${price}</div>` : ''}
        </div>
      `;
    }

    // Write printable document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Labels - ${product.name}</title>
        <style>
          @page {
            size: ${config.width} ${config.height};
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: ${config.width};
            height: ${config.height};
            background: #fff;
            color: #000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .label-sheet {
            width: ${config.width};
            height: ${config.height};
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5mm;
            text-align: center;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
          }
          .store-name {
            font-size: ${config.storeFontSize};
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            margin-bottom: 1px;
          }
          .product-name {
            font-size: ${config.nameFontSize};
            font-weight: 600;
            line-height: 1.1;
            margin-bottom: 2px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            width: 100%;
          }
          .barcode-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1px 0;
          }
          .barcode-container svg {
            max-width: 95%;
            height: auto;
            max-height: ${config.barcodeHeight}px;
          }
          .price {
            font-size: ${config.priceFontSize};
            font-weight: 800;
            margin-top: 1px;
          }
        </style>
      </head>
      <body>
        ${labelsHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Printer className="h-5 w-5 text-primary-500" />
          <span>Print Product Barcode</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="flex gap-3 bg-primary-50 dark:bg-primary-950/30 p-3 rounded-lg border border-primary-100 dark:border-primary-900/50">
          <Tag className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-primary-900 dark:text-primary-300">
              {product.name}
            </h4>
            <p className="text-[10px] text-primary-700 dark:text-primary-400 mt-0.5">
              SKU: {product.sku || '-'} | Barcode: {barcodeValue} | Price: ₹{price}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Column */}
          <div className="space-y-5">
            <div>
              <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Print Settings
              </h5>

              {/* Copies */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Copies to Print</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    className="h-9 w-20 text-center font-bold"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setCopies((c) => Math.min(100, c + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Label Size */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Label Template Size</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['small', 'medium', 'large'] as LabelSize[]).map((sz) => (
                    <label
                      key={sz}
                      className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                        size === sz
                          ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="label-size"
                        checked={size === sz}
                        onChange={() => setSize(sz)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground capitalize">{sz} Label</p>
                        <p className="text-[10px] text-muted-foreground">{sizeConfig[sz].name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                Label Design Elements
              </h5>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={(e) => setShowStoreName(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-foreground">Include Store Name</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={(e) => setShowProductName(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-foreground">Include Product Name</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-foreground">Include Selling Price</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBarcodeText}
                  onChange={(e) => setShowBarcodeText(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-foreground">Show Barcode Text Value</span>
              </label>
            </div>
          </div>

          {/* Preview Column */}
          <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-border">
            <div>
              <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Sticker Preview
              </h5>

              {/* Physical Preview Container */}
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-950 p-6 rounded-lg flex items-center justify-center min-h-[220px]">
                {/* Sticker Mock */}
                <div
                  className="bg-white text-black p-3 shadow-md border border-slate-300 rounded flex flex-col justify-between items-center text-center overflow-hidden transition-all duration-200"
                  style={{
                    width: size === 'small' ? '140px' : size === 'medium' ? '180px' : '220px',
                    minHeight: size === 'small' ? '110px' : size === 'medium' ? '120px' : '160px',
                  }}
                >
                  {/* Store Name */}
                  {showStoreName && (
                    <div
                      className="font-bold uppercase tracking-wider text-slate-800 truncate w-full"
                      style={{ fontSize: config.storeFontSize }}
                    >
                      {storeName}
                    </div>
                  )}

                  {/* Product Title */}
                  {showProductName && (
                    <div
                      className="font-semibold text-slate-900 leading-tight my-1 truncate w-full"
                      style={{ fontSize: config.nameFontSize }}
                    >
                      {product.name}
                    </div>
                  )}

                  {/* Barcode Render */}
                  <div className="w-full flex items-center justify-center my-1" id="preview-barcode-svg-container">
                    {/* Rendered SVG gets queried by id inside print routine */}
                    <div id="preview-barcode-svg" className="w-full">
                      <BarcodeRenderer
                        value={barcodeValue}
                        format="CODE128"
                        height={config.barcodeHeight}
                        width={config.barcodeWidth}
                        displayValue={showBarcodeText}
                        fontSize={parseInt(config.barcodeFontSize)}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  {showPrice && (
                    <div className="font-extrabold text-slate-900 mt-1" style={{ fontSize: config.priceFontSize }}>
                      ₹{price}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Prints via standard system dialogue configured for thermal label media rolls.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" /> Print {copies} {copies === 1 ? 'Label' : 'Labels'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
