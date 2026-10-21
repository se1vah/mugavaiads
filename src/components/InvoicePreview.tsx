import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BillData, BusinessProfile, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { formatMoney, formatDateDisplay } from '../constants/defaults';
import { LogoGraphic } from './LogoGraphic';
import { generateInvoicePdf } from '../utils/generatePdfBlob';
import { Download, ZoomIn, ZoomOut, QrCode, ArrowLeft } from 'lucide-react';

interface InvoicePreviewProps {
  bill: BillData;
  business: BusinessProfile;
  language: Language;
  onBackToEdit?: () => void;
  onSaveToHistory?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  bill,
  business,
  language,
  onBackToEdit,
  onSaveToHistory,
}) => {
  const t = translations[language];
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [downloading, setDownloading] = useState(false);
  const [showUpiQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [zoomFit, setZoomFit] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(720);

  // Measure container width for responsive scaling on mobile
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Compute total
  const total = bill.items.reduce((sum, item) => {
    const val = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;
    return sum + val;
  }, 0);

  // Generate UPI QR code
  useEffect(() => {
    if (!business.upiId || total <= 0) return;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(
      business.nameEn
    )}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${bill.billNumber}`)}`;

    QRCode.toDataURL(upiUrl, { width: 120, margin: 1, color: { dark: '#183b36', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [business.upiId, business.nameEn, total, bill.billNumber]);

  // Download PDF ensuring exact tablet dimensions on all devices
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    if (onSaveToHistory) onSaveToHistory();
    setDownloading(true);

    try {
      const { pdf, fileName } = await generateInvoicePdf(invoiceRef.current, bill.billNumber);
      pdf.save(fileName);
    } catch (e) {
      console.error('PDF generation error', e);
    } finally {
      setDownloading(false);
    }
  };

  const businessName = language === 'ta' ? business.nameTa : business.nameEn;
  const businessStreet = language === 'ta' ? business.streetTa : business.streetEn;
  const businessPlace = language === 'ta' ? business.placeTa : business.placeEn;
  const businessState = language === 'ta' ? business.stateTa : business.stateEn;
  const businessContact = language === 'ta' ? `மொபைல்: ${business.contactTa || business.contact}` : `Contact: ${business.contact}`;
  const businessEmail = `Email: ${business.email}`;
  const businessInstagram = `Instagram: ${business.instagram}`;
  const signatureText = language === 'ta' ? business.signatureTitleTa : business.signatureTitleEn;
  const footerText = language === 'ta' ? business.footerTa : business.footerEn;

  // Exact fixed tablet width (720px)
  const TABLET_WIDTH = 720;
  // Calculate scale factor for mobile screens when zoomFit is active
  const availableWidth = Math.max(300, containerWidth - 32);
  const scale = zoomFit && availableWidth < TABLET_WIDTH ? availableWidth / TABLET_WIDTH : 1;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-[#d7e2df] p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5 no-print">
        {onBackToEdit && (
          <button
            type="button"
            onClick={onBackToEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[38px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.tabCreate}</span>
          </button>
        )}

        {/* View Scaling Toggle on mobile */}
        <div className="flex items-center gap-1 bg-[#edf6f3] p-0.5 rounded-lg text-xs font-semibold text-[#183b36]">
          <button
            type="button"
            onClick={() => setZoomFit(true)}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
              zoomFit ? 'bg-white text-[#183b36] shadow-xs' : 'text-slate-600'
            }`}
            title={t.fitWidth}
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.fitWidth}</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomFit(false)}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
              !zoomFit ? 'bg-white text-[#183b36] shadow-xs' : 'text-slate-600'
            }`}
            title={t.actualSize}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.actualSize}</span>
          </button>
        </div>

        {/* Primary Action Button: Download PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold shadow-xs transition-colors min-h-[40px] disabled:opacity-60"
            title={t.download}
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? (language === 'ta' ? 'பதிவிறக்கம் செய்கிறது...' : 'Generating PDF...') : t.download}</span>
          </button>
        </div>
      </div>

      {/* Preview Container: renders with guaranteed tablet dimensions across all devices */}
      <div
        ref={containerRef}
        className="bg-white rounded-xl shadow-lg border border-[#d7e2df] p-3 sm:p-5 invoice-container overflow-x-auto flex justify-center"
      >
        <div
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
            width: `${TABLET_WIDTH}px`,
            marginBottom: scale < 1 ? `-${Math.round((1 - scale) * 780)}px` : undefined,
          }}
          className="transition-transform duration-150 shrink-0"
        >
          <div
            ref={invoiceRef}
            id="invoice"
            className="bg-white text-[#182b27] p-6 border border-[#e4eae8] rounded-md font-sans text-[10px] leading-snug"
            style={{
              width: `${TABLET_WIDTH}px`,
              minWidth: `${TABLET_WIDTH}px`,
              maxWidth: `${TABLET_WIDTH}px`,
              boxSizing: 'border-box',
            }}
          >
            {/* Invoice Header */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-[#176b5b] pb-3 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-black text-[#183b36] tracking-tight mb-1 ${language === 'ta' ? 'tamil-font' : ''}`}>
                  {businessName}
                </h2>
                <p className="text-[10px] text-slate-600 leading-tight">{businessStreet}</p>
                <p className="text-[10px] text-slate-600 leading-tight">{businessPlace}</p>
                <p className="text-[10px] text-slate-600 leading-tight">{businessState}</p>
                <p className="text-[10px] font-semibold text-slate-700 mt-1">{businessContact}</p>
                <p className="text-[9px] text-slate-500 leading-tight">{businessEmail}</p>
                <p className="text-[9px] text-slate-500 leading-tight">{businessInstagram}</p>
              </div>
              <div className="shrink-0">
                <LogoGraphic url={business.logoUrl} size={64} />
              </div>
            </div>

            {/* Invoice Title & Meta */}
            <div className="flex items-center justify-between gap-4 my-2.5 pb-2 border-b border-slate-100">
              <div>
                <h3 className={`text-lg font-black text-[#183b36] tracking-wide ${language === 'ta' ? 'tamil-font' : ''}`}>
                  {t.invoice}
                </h3>
                <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
                  Original Client Copy
                </span>
              </div>
              <div className="text-right text-[10px] space-y-0.5">
                <div>
                  <strong className="text-[#183b36]">{t.billNumberLabel}</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{bill.billNumber || '—'}</span>
                </div>
                <div>
                  <strong className="text-[#183b36]">{t.billDateLabel}</strong>{' '}
                  <span className="font-semibold text-slate-800">{formatDateDisplay(bill.billDate)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details Block */}
            <div className="customer-block border border-[#d7e2df] bg-[#f9fbfa] rounded-lg p-3 mb-3">
              <h4 className={`text-[10px] font-bold text-[#176b5b] uppercase tracking-wider mb-1.5 ${language === 'ta' ? 'tamil-font' : ''}`}>
                {t.customerTitle}
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px]">
                <div>
                  <strong className="text-slate-700">{t.name}:</strong>{' '}
                  <span className="font-semibold text-slate-900">{bill.customer.name || '—'}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{t.contactLabel}:</strong>{' '}
                  <span className="font-mono font-medium text-slate-900">{bill.customer.contact || '—'}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{t.streetLabel}:</strong>{' '}
                  <span className="text-slate-800">{bill.customer.street || '—'}</span>
                </div>
                {bill.customer.email && (
                  <div>
                    <strong className="text-slate-700">{t.emailLabel}:</strong>{' '}
                    <span className="text-slate-800">{bill.customer.email}</span>
                  </div>
                )}
                <div>
                  <strong className="text-slate-700">{t.placeLabel}:</strong>{' '}
                  <span className="text-slate-800">{bill.customer.place || '—'}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{t.districtLabel}:</strong>{' '}
                  <span className="text-slate-800">{bill.customer.district || '—'}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{t.stateLabel}:</strong>{' '}
                  <span className="text-slate-800">{bill.customer.state || 'Tamil Nadu'}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{t.pinLabel}:</strong>{' '}
                  <span className="font-mono text-slate-800">{bill.customer.pincode || '—'}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-3">
              <table className="w-full border-collapse text-[10px] leading-tight">
                <thead>
                  <tr className="bg-[#edf6f3] text-[#183b36] border-y border-[#bacbc5]">
                    <th className="py-2 px-2 text-center w-[7%] border-r border-[#bacbc5] font-bold">
                      {t.sno}
                    </th>
                    <th className="py-2 px-3 text-left w-[36%] border-r border-[#bacbc5] font-bold">
                      {t.description}
                    </th>
                    <th className="py-2 px-2 text-left w-[20%] border-r border-[#bacbc5] font-bold">
                      {t.platform}
                    </th>
                    <th className="py-2 px-2 text-center w-[12%] border-r border-[#bacbc5] font-bold">
                      {t.fromDate}
                    </th>
                    <th className="py-2 px-2 text-center w-[12%] border-r border-[#bacbc5] font-bold">
                      {t.toDate}
                    </th>
                    <th className="py-2 px-3 text-right w-[13%] font-bold">
                      {t.amount}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-[#e1e9e6]">
                      <td className="py-2 px-2 text-center border-r border-[#e1e9e6] font-semibold text-[#176b5b]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-[#e1e9e6] font-medium text-slate-900 break-words">
                        {item.description || '—'}
                      </td>
                      <td className="py-2 px-2 border-r border-[#e1e9e6] text-slate-700">
                        {item.platforms.join(', ') || '—'}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-[#e1e9e6] text-slate-700 whitespace-nowrap">
                        {formatDateDisplay(item.fromDate)}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-[#e1e9e6] text-slate-700 whitespace-nowrap">
                        {formatDateDisplay(item.toDate)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {bill.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        — No items added —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary: UPI QR & Total Box */}
            <div className="total-row flex items-center justify-between gap-4 mt-3 pt-1">
              {/* UPI QR Payment Block */}
              {business.upiId && showUpiQr && qrDataUrl ? (
                <div className="flex items-center gap-3 p-2 bg-[#f4f8f7] border border-[#d7e2df] rounded-lg">
                  <img src={qrDataUrl} alt="UPI Payment QR" className="w-14 h-14 rounded bg-white p-0.5 border border-slate-200 shrink-0" />
                  <div className="text-[9px] space-y-0.5">
                    <div className="font-bold text-[#183b36] flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-[#176b5b]" />
                      <span>Instant UPI Payment</span>
                    </div>
                    <div className="text-slate-600 font-mono text-[9px]">{business.upiId}</div>
                    <div className="text-[8px] text-emerald-700 font-medium">GPay • PhonePe • Paytm</div>
                  </div>
                </div>
              ) : <div />}

              {/* Total Box */}
              <div className="min-w-[200px] border border-[#176b5b] bg-[#edf6f3] p-3 rounded-lg text-right">
                <div className="text-[9px] font-bold text-[#183b36] uppercase tracking-wider">
                  {t.totalLabel}
                </div>
                <div className="text-2xl font-black text-[#176b5b] mt-0.5 tabular-nums font-mono">
                  {formatMoney(total)}
                </div>
                <div className="text-[8px] text-slate-500 mt-0.5">
                  {language === 'ta' ? 'வரி விலக்கு அளிக்கப்பட்டது (GST இல்லை)' : 'Exempt / No GST Included'}
                </div>
              </div>
            </div>

            {/* Authorized Signature */}
            <div className="signature flex justify-end mt-7 mb-2">
              <div className="w-44 text-center border-t border-slate-400 pt-1.5">
                <span className={`text-[10px] font-bold text-slate-800 ${language === 'ta' ? 'tamil-font' : ''}`}>
                  {signatureText}
                </span>
                <div className="text-[8px] text-slate-500 font-medium">Mugavai Ads</div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-[#e0e8e5] pt-2 text-center text-slate-500 text-[9px]">
              <p className={language === 'ta' ? 'tamil-font font-medium' : ''}>{footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
