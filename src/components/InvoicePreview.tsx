import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BillData, BusinessProfile, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { formatMoney, formatDateDisplay } from '../constants/defaults';
import { LogoGraphic } from './LogoGraphic';
import { Printer, Download, Share2, Copy, Check, ZoomIn, ZoomOut, QrCode, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

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
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showUpiQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [zoomFit, setZoomFit] = useState(true);

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

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const clientPhone = bill.customer.contact.replace(/\D/g, '');
    const platformsList = Array.from(new Set(bill.items.flatMap((i) => i.platforms))).join(', ');

    const text =
      language === 'ta'
        ? `வணக்கம் ${bill.customer.name},\n\n*முகவை விளம்பரம் (Mugavai Ads)* விலைப்பட்டியல்:\n📄 *பில் எண்:* ${bill.billNumber}\n📅 *தேதி:* ${formatDateDisplay(bill.billDate)}\n📱 *விளம்பரத் தளம்:* ${platformsList || 'Social Media'}\n💰 *மொத்தத் தொகை:* ${formatMoney(total)}\n\n💳 *UPI மூலம் செலுத்த:* ${business.upiId}\n\nநன்றி!\n${business.nameTa} - ${business.contactTa}`
        : `Hello ${bill.customer.name},\n\n*Mugavai Ads* Invoice Summary:\n📄 *Invoice No:* ${bill.billNumber}\n📅 *Date:* ${formatDateDisplay(bill.billDate)}\n📱 *Platforms:* ${platformsList || 'Social Media'}\n💰 *Total Amount:* ${formatMoney(total)}\n\n💳 *Pay via UPI:* ${business.upiId}\n\nThank you for choosing Mugavai Ads!\n${business.nameEn} - ${business.contact}`;

    const url =
      clientPhone.length >= 10
        ? `https://wa.me/91${clientPhone.slice(-10)}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  // Copy text summary
  const handleCopySummary = async () => {
    const text = `Mugavai Ads Invoice: #${bill.billNumber} | Date: ${formatDateDisplay(bill.billDate)} | Client: ${bill.customer.name} | Total: ${formatMoney(total)} | UPI: ${business.upiId}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Print invoice
  const handlePrint = () => {
    if (onSaveToHistory) onSaveToHistory();
    window.print();
  };

  // Download PDF ensuring exact single A4 sheet fit
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    if (onSaveToHistory) onSaveToHistory();
    setDownloading(true);

    try {
      const invoiceElement = invoiceRef.current;
      const cleanFileName = `Mugavai-Ads-${(bill.billNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      // Render high-res canvas with html2canvas-pro
      const canvas = await html2canvas(invoiceElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // A4 page dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8; // 8mm margin for crisp single page presentation
      const printableWidth = pdfWidth - margin * 2; // 194mm
      const printableHeight = pdfHeight - margin * 2; // 281mm

      // Calculate scale ratio to ensure it fits BOTH width and height on a single A4 page
      const widthRatio = printableWidth / canvas.width;
      const heightRatio = printableHeight / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);

      const finalWidth = canvas.width * ratio;
      const finalHeight = canvas.height * ratio;

      // Horizontally center on the sheet
      const xOffset = margin + (printableWidth - finalWidth) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(cleanFileName);
    } catch (e) {
      console.error('PDF generation error, falling back to print dialog', e);
      window.print();
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

  return (
    <div className="space-y-4 pb-20">
      {/* Mobile Top Controls Bar */}
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

        {/* Action Buttons: WhatsApp, PDF, Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[40px]"
            title={t.shareWhatsApp}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold shadow-xs transition-colors min-h-[40px] disabled:opacity-60"
            title={t.download}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'PDF...' : 'PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#d7e2df] bg-white hover:bg-slate-50 text-[#183b36] text-xs font-bold shadow-xs transition-colors min-h-[40px]"
            title={t.print}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.print}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 rounded-lg border border-[#d7e2df] bg-white hover:bg-slate-50 text-slate-700 text-xs min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            title={t.copySummary}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className={`bg-white rounded-xl shadow-lg border border-[#d7e2df] overflow-x-auto p-3 sm:p-5 invoice-container transition-all ${
          zoomFit ? 'w-full' : 'overflow-x-scroll'
        }`}
      >
        <div
          ref={invoiceRef}
          id="invoice"
          className="bg-white text-[#182b27] mx-auto p-5 sm:p-6 border border-[#e4eae8] rounded-md font-sans text-[10px] leading-snug max-w-[700px] w-full"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Invoice Header */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-[#176b5b] pb-2.5 mb-2.5">
            <div className="flex-1 min-w-0">
              <h2 className={`text-lg sm:text-xl font-black text-[#183b36] tracking-tight mb-0.5 ${language === 'ta' ? 'tamil-font' : ''}`}>
                {businessName}
              </h2>
              <p className="text-[10px] text-slate-600 leading-tight">{businessStreet}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{businessPlace}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{businessState}</p>
              <p className="text-[10px] font-semibold text-slate-700 mt-0.5">{businessContact}</p>
              <p className="text-[9px] text-slate-500 leading-tight">{businessEmail}</p>
              <p className="text-[9px] text-slate-500 leading-tight">{businessInstagram}</p>
            </div>
            <div className="shrink-0">
              <LogoGraphic url={business.logoUrl} size={64} />
            </div>
          </div>

          {/* Invoice Title & Meta */}
          <div className="flex items-center justify-between gap-3 my-2 pb-1.5 border-b border-slate-100">
            <div>
              <h3 className={`text-base sm:text-lg font-black text-[#183b36] tracking-wide ${language === 'ta' ? 'tamil-font' : ''}`}>
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
          <div className="customer-block border border-[#d7e2df] bg-[#f9fbfa] rounded-lg p-2.5 mb-2.5">
            <h4 className={`text-[10px] font-bold text-[#176b5b] uppercase tracking-wider mb-1 ${language === 'ta' ? 'tamil-font' : ''}`}>
              {t.customerTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
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
          <div className="mb-2.5 overflow-x-auto">
            <table className="w-full border-collapse text-[10px] leading-tight">
              <thead>
                <tr className="bg-[#edf6f3] text-[#183b36] border-y border-[#bacbc5]">
                  <th className="py-1.5 px-2 text-center w-[7%] border-r border-[#bacbc5] font-bold">
                    {t.sno}
                  </th>
                  <th className="py-1.5 px-2 text-left w-[36%] border-r border-[#bacbc5] font-bold">
                    {t.description}
                  </th>
                  <th className="py-1.5 px-2 text-left w-[20%] border-r border-[#bacbc5] font-bold">
                    {t.platform}
                  </th>
                  <th className="py-1.5 px-1.5 text-center w-[12%] border-r border-[#bacbc5] font-bold">
                    {t.fromDate}
                  </th>
                  <th className="py-1.5 px-1.5 text-center w-[12%] border-r border-[#bacbc5] font-bold">
                    {t.toDate}
                  </th>
                  <th className="py-1.5 px-2 text-right w-[13%] font-bold">
                    {t.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-[#e1e9e6]">
                    <td className="py-1.5 px-2 text-center border-r border-[#e1e9e6] font-semibold text-[#176b5b]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 border-r border-[#e1e9e6] font-medium text-slate-900 break-words">
                      {item.description || '—'}
                    </td>
                    <td className="py-1.5 px-2 border-r border-[#e1e9e6] text-slate-700">
                      {item.platforms.join(', ') || '—'}
                    </td>
                    <td className="py-1.5 px-1.5 text-center border-r border-[#e1e9e6] text-slate-700 whitespace-nowrap">
                      {formatDateDisplay(item.fromDate)}
                    </td>
                    <td className="py-1.5 px-1.5 text-center border-r border-[#e1e9e6] text-slate-700 whitespace-nowrap">
                      {formatDateDisplay(item.toDate)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                      {formatMoney(item.amount)}
                    </td>
                  </tr>
                ))}
                {bill.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-slate-400">
                      — No items added —
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary: UPI QR & Total Box */}
          <div className="total-row flex flex-col sm:flex-row items-center justify-between gap-3 mt-2.5 pt-1">
            {/* UPI QR Payment Block */}
            {business.upiId && showUpiQr && qrDataUrl && (
              <div className="flex items-center gap-2.5 p-1.5 bg-[#f4f8f7] border border-[#d7e2df] rounded-lg">
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
            )}

            {/* Total Box */}
            <div className="min-w-[190px] ml-auto border border-[#176b5b] bg-[#edf6f3] p-2.5 rounded-lg text-right">
              <div className="text-[9px] font-bold text-[#183b36] uppercase tracking-wider">
                {t.totalLabel}
              </div>
              <div className="text-xl font-black text-[#176b5b] mt-0.5 tabular-nums font-mono">
                {formatMoney(total)}
              </div>
              <div className="text-[8px] text-slate-500 mt-0.5">
                {language === 'ta' ? 'வரி விலக்கு அளிக்கப்பட்டது (GST இல்லை)' : 'Exempt / No GST Included'}
              </div>
            </div>
          </div>

          {/* Authorized Signature */}
          <div className="signature flex justify-end mt-6 mb-2">
            <div className="w-40 text-center border-t border-slate-400 pt-1">
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
  );
};
