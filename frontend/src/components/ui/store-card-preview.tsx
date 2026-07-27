import { useState } from 'react';
import { Building2, MapPin, Download, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StoreCardPreviewProps {
  name?: string;
  address?: string;
  phone?: string;
  gstin?: string;
  openingTime?: string;
  closingTime?: string;
  radiusKm?: number | string | null;
  lat?: number | string | null;
  long?: number | string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  posEnabled?: boolean;
  deliveryEnabled?: boolean;
  clickCollectEnabled?: boolean;
  showDownloadButton?: boolean;
  className?: string;
}

type CardThemeKey = 'emerald' | 'sapphire' | 'gold' | 'ruby' | 'violet' | 'silver' | 'pearl';

interface CardTheme {
  id: CardThemeKey;
  label: string;
  cardGradient: string;
  borderColor: string;
  glowColor: string;
  brandGradient: string;
  swatchBg: string;
  pdfGradient: string;
  pdfBorder: string;
  isLight?: boolean;
}

const CARD_THEMES: CardTheme[] = [
  {
    id: 'emerald',
    label: 'Titanium Emerald',
    cardGradient: 'from-slate-950 via-slate-900 to-emerald-950 text-white',
    borderColor: 'border-amber-500/30',
    glowColor: 'bg-emerald-500/20',
    brandGradient: 'from-emerald-400 via-teal-200 to-cyan-400',
    swatchBg: 'bg-gradient-to-tr from-emerald-600 to-teal-400',
    pdfGradient: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #064e3b 80%, #022c22 100%)',
    pdfBorder: '2px solid rgba(251, 191, 36, 0.5)',
  },
  {
    id: 'sapphire',
    label: 'Midnight Sapphire',
    cardGradient: 'from-slate-950 via-slate-900 to-blue-950 text-white',
    borderColor: 'border-cyan-400/40',
    glowColor: 'bg-blue-500/20',
    brandGradient: 'from-cyan-400 via-sky-200 to-indigo-400',
    swatchBg: 'bg-gradient-to-tr from-blue-600 to-cyan-400',
    pdfGradient: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e3a8a 80%, #172554 100%)',
    pdfBorder: '2px solid rgba(56, 189, 248, 0.5)',
  },
  {
    id: 'gold',
    label: 'Obsidian Gold',
    cardGradient: 'from-black via-zinc-950 to-amber-950 text-white',
    borderColor: 'border-amber-400/60',
    glowColor: 'bg-amber-500/20',
    brandGradient: 'from-amber-300 via-yellow-200 to-orange-400',
    swatchBg: 'bg-gradient-to-tr from-amber-500 to-yellow-300',
    pdfGradient: 'linear-gradient(135deg, #000000 0%, #18181b 40%, #451a03 80%, #292524 100%)',
    pdfBorder: '2px solid rgba(251, 191, 36, 0.7)',
  },
  {
    id: 'ruby',
    label: 'Ruby Quartz',
    cardGradient: 'from-slate-950 via-slate-900 to-rose-950 text-white',
    borderColor: 'border-rose-400/40',
    glowColor: 'bg-rose-500/20',
    brandGradient: 'from-rose-400 via-pink-200 to-purple-400',
    swatchBg: 'bg-gradient-to-tr from-rose-600 to-pink-400',
    pdfGradient: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #881337 80%, #4c0519 100%)',
    pdfBorder: '2px solid rgba(251, 113, 133, 0.5)',
  },
  {
    id: 'violet',
    label: 'Violet Dusk',
    cardGradient: 'from-slate-950 via-slate-900 to-purple-950 text-white',
    borderColor: 'border-violet-400/40',
    glowColor: 'bg-purple-500/20',
    brandGradient: 'from-purple-400 via-fuchsia-200 to-indigo-400',
    swatchBg: 'bg-gradient-to-tr from-purple-600 to-fuchsia-400',
    pdfGradient: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #581c87 80%, #3b0764 100%)',
    pdfBorder: '2px solid rgba(192, 132, 252, 0.5)',
  },
  {
    id: 'silver',
    label: 'Silver Titanium',
    cardGradient: 'from-slate-100 via-slate-200 to-slate-300 text-slate-900',
    borderColor: 'border-slate-400/80',
    glowColor: 'bg-primary-500/10',
    brandGradient: 'from-slate-900 via-slate-800 to-primary-700',
    swatchBg: 'bg-gradient-to-tr from-slate-400 to-slate-200',
    pdfGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    pdfBorder: '2px solid rgba(100, 116, 139, 0.6)',
    isLight: true,
  },
  {
    id: 'pearl',
    label: 'Gold Pearl',
    cardGradient: 'from-amber-50 via-yellow-100 to-amber-200 text-amber-950',
    borderColor: 'border-amber-400/80',
    glowColor: 'bg-amber-400/20',
    brandGradient: 'from-amber-900 via-amber-800 to-yellow-800',
    swatchBg: 'bg-gradient-to-tr from-yellow-400 to-amber-200',
    pdfGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
    pdfBorder: '2px solid rgba(245, 158, 11, 0.7)',
    isLight: true,
  },
];

export function StoreCardPreview({
  name,
  address,
  phone,
  openingTime = '08:00',
  closingTime = '22:00',
  radiusKm = 0,
  managerName,
  posEnabled = true,
  deliveryEnabled = false,
  clickCollectEnabled = false,
  showDownloadButton = true,
  className = '',
}: StoreCardPreviewProps) {
  const [activeThemeId, setActiveThemeId] = useState<CardThemeKey>('emerald');

  const currentTheme = CARD_THEMES.find((t) => t.id === activeThemeId) || CARD_THEMES[0];

  // PDF Generator for Store ATM/Visa Style Card
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${name || 'Store Card Preview'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #090d16 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-wrapper {
              width: 100vw;
              height: 100vh;
              background-color: #090d16 !important;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            .atm-card {
              width: 171.2mm;
              height: 107.96mm;
              border-radius: 20px;
              background: ${currentTheme.pdfGradient} !important;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.9);
              border: ${currentTheme.pdfBorder};
              padding: 24px 28px;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .shine {
              position: absolute;
              inset: 0;
              background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 80%);
              pointer-events: none;
            }
            .top-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .chip-group {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .emv-chip {
              width: 52px;
              height: 36px;
              border-radius: 8px;
              background: linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%) !important;
              border: 1.5px solid #fde047;
              position: relative;
            }
            .chip-line {
              position: absolute;
              background: rgba(0,0,0,0.3);
            }
            .brand-visa {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 3px;
              background: linear-gradient(90deg, #34d399, #a7f3d0, #38bdf8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-transform: uppercase;
            }
            .store-name {
              font-family: 'Courier New', Courier, monospace;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 2px;
              margin-top: 16px;
              text-transform: uppercase;
              color: #ffffff;
              text-shadow: 0 2px 6px rgba(0,0,0,0.9);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .store-address {
              font-size: 13px;
              color: #cbd5e1;
              margin-top: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .bottom-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 14px;
              border-top: 1px solid rgba(255,255,255,0.15);
              padding-top: 10px;
            }
            .meta-label {
              font-size: 9px;
              color: #fbbf24;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
            }
            .meta-val {
              font-size: 13px;
              font-weight: 700;
              color: #f8fafc;
              margin-top: 2px;
            }
            .chip-pill {
              font-size: 10px;
              font-weight: 800;
              padding: 4px 8px;
              border-radius: 6px;
              background: rgba(16, 185, 129, 0.25) !important;
              color: #34d399;
              border: 1px solid rgba(16, 185, 129, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="page-wrapper">
            <div class="atm-card">
              <div class="shine"></div>
              <div class="top-row">
                <div class="chip-group">
                  <div class="emv-chip">
                    <div class="chip-line" style="top:50%;left:0;right:0;height:1px;"></div>
                    <div class="chip-line" style="left:50%;top:0;bottom:0;width:1px;"></div>
                  </div>
                  <span style="font-size:16px;color:#fde047;opacity:0.9;">📡</span>
                </div>
                <div style="text-align:right">
                  <div class="brand-visa">GROCERYMART</div>
                  <span style="display:block;font-size:9px;letter-spacing:2px;color:#94a3b8;font-weight:800;margin-top:-2px">FRANCHISE CARD</span>
                </div>
              </div>
              <div>
                <div class="store-name">${name || 'NEW FRANCHISE STORE'}</div>
                <div class="store-address">📍 ${address || 'Address pending entry'} (${phone || 'No phone'})</div>
              </div>
              <div class="bottom-row">
                <div>
                  <div class="meta-label">STORE MANAGER</div>
                  <div class="meta-val">${(managerName || 'UNASSIGNED').toUpperCase()}</div>
                </div>
                <div>
                  <div class="meta-label">HOURS & RADIUS</div>
                  <div class="meta-val">${openingTime} - ${closingTime} | ${radiusKm || 0}KM</div>
                </div>
                <div style="display:flex;gap:5px">
                  ${posEnabled ? '<span class="chip-pill">POS</span>' : ''}
                  ${deliveryEnabled ? '<span class="chip-pill">DELIVERY</span>' : ''}
                  ${clickCollectEnabled ? '<span class="chip-pill">PICKUP</span>' : ''}
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Title and Theme Swatch Controls */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-primary-500" />
          Store Card Live Preview
        </span>
        
        {/* Color Theme Selector Swatches */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-full border border-slate-300/50 dark:border-slate-700/50">
          <Palette className="w-3 h-3 text-slate-500 ml-1 mr-0.5 shrink-0" />
          {CARD_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setActiveThemeId(theme.id)}
              title={`Card Theme: ${theme.label}`}
              className={`w-4 h-4 rounded-full ${theme.swatchBg} transition-all cursor-pointer ${
                activeThemeId === theme.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Colored ATM Card Container */}
      <div
        className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${currentTheme.cardGradient} p-4 sm:p-5 shadow-2xl border ${currentTheme.borderColor} relative overflow-hidden flex flex-col justify-between group transition-all duration-500`}
      >
        {/* Diagonal Holographic Gloss Sheen Line */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-40 transform -skew-x-12" />
        <div className={`absolute -right-10 -top-10 w-32 h-32 ${currentTheme.glowColor} rounded-full blur-3xl pointer-events-none`} />

        {/* Top Row: EMV Gold Chip + Contactless & GROCERYMART VISA Brand */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Metallic EMV Gold Smart Chip */}
            <div className="w-9 h-6 sm:w-10 sm:h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300 shadow-sm relative overflow-hidden flex items-center justify-center p-[2px]">
              <div className="w-full h-[1px] bg-slate-900/40 absolute top-1/2 -translate-y-1/2 left-0 right-0" />
              <div className="h-full w-[1px] bg-slate-900/40 absolute left-1/2 -translate-x-1/2 top-0 bottom-0" />
              <div className="w-3 h-2 rounded-[2px] border border-slate-900/30 bg-amber-300/40" />
            </div>
            {/* Contactless Wifi Icon */}
            <div className="text-amber-500 font-bold text-xs flex items-center">
              📡
            </div>
          </div>

          {/* GROCERYMART Logo in Metallic Visa Style */}
          <div className="text-right">
            <span
              className={`font-extrabold text-sm sm:text-base tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.brandGradient} drop-shadow-md`}
            >
              GROCERYMART
            </span>
            <span className={`block text-[7px] tracking-widest uppercase font-bold -mt-0.5 ${currentTheme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              FRANCHISE CARD
            </span>
          </div>
        </div>

        {/* Middle Row: Store Name & Address */}
        <div className="my-auto relative z-10 space-y-0.5">
          <h3 className={`font-mono tracking-widest text-sm sm:text-base font-bold uppercase drop-shadow-md truncate ${currentTheme.isLight ? 'text-slate-900' : 'text-white'}`}>
            {name || 'NEW FRANCHISE STORE'}
          </h3>
          <p className={`text-[10px] font-medium truncate flex items-center gap-1 ${currentTheme.isLight ? 'text-slate-700' : 'text-slate-300/90'}`}>
            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
            {address || 'Address pending entry...'}
          </p>
        </div>

        {/* Bottom Row: Metadata & Active Modules */}
        <div className={`pt-2 border-t flex items-end justify-between relative z-10 text-[9px] ${currentTheme.isLight ? 'border-slate-400/30' : 'border-white/10'}`}>
          <div>
            <span className={`text-[7px] font-extrabold tracking-widest uppercase block ${currentTheme.isLight ? 'text-amber-700' : 'text-amber-400/90'}`}>
              STORE MANAGER
            </span>
            <span className={`font-bold uppercase truncate max-w-[100px] block ${currentTheme.isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {managerName || 'UNASSIGNED'}
            </span>
          </div>

          <div>
            <span className={`text-[7px] font-extrabold tracking-widest uppercase block ${currentTheme.isLight ? 'text-amber-700' : 'text-amber-400/90'}`}>
              HOURS & RADIUS
            </span>
            <span className={`font-bold ${currentTheme.isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {openingTime}-{closingTime} | {radiusKm || 0}KM
            </span>
          </div>

          <div className="flex items-center gap-1">
            {posEnabled && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-[7px] tracking-wider">
                POS
              </span>
            )}
            {deliveryEnabled && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold text-[7px] tracking-wider">
                DELIVERY
              </span>
            )}
            {clickCollectEnabled && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold text-[7px] tracking-wider">
                PICKUP
              </span>
            )}
          </div>
        </div>
      </div>

      {showDownloadButton && (
        <Button
          type="button"
          onClick={handleDownloadPDF}
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-xl border border-slate-700/60 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Download Card PDF ({currentTheme.label})
        </Button>
      )}
    </div>
  );
}
