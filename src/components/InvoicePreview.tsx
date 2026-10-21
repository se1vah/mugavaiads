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

  // Generate UPI QR code as Data URL
  useEffect(() => {
    if (!business.upiId || total <= 0) return;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(
      business.nameEn
    )}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${bill.billNumber}`)}`;

    QRCode.toDataURL(upiUrl, { width: 130, margin: 1, color: { dark: '#183b36', light: '#ffffff' } })
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
          {/* Main Invoice Document with Complete Explicit Inline Styles and Embedded CSS */}
          <div
            ref={invoiceRef}
            id="invoice"
            style={{
              width: `${TABLET_WIDTH}px`,
              minWidth: `${TABLET_WIDTH}px`,
              maxWidth: `${TABLET_WIDTH}px`,
              backgroundColor: '#ffffff',
              color: '#182b27',
              padding: '24px',
              border: '1px solid #e4eae8',
              borderRadius: '6px',
              fontFamily: "'Plus Jakarta Sans', 'Inter', 'Noto Sans Tamil', -apple-system, sans-serif",
              fontSize: '10px',
              lineHeight: 1.45,
              boxSizing: 'border-box',
            }}
          >
            {/* Scoped CSS guaranteeing styles are locked in even if captured or printed */}
            <style>{`
              #invoice {
                background: #ffffff !important;
                color: #182b27 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #invoice .inv-header {
                display: flex !important;
                align-items: flex-start !important;
                justify-content: space-between !important;
                gap: 16px !important;
                border-bottom: 2px solid #176b5b !important;
                padding-bottom: 12px !important;
                margin-bottom: 12px !important;
              }
              #invoice .inv-business-title {
                font-size: 20px !important;
                font-weight: 900 !important;
                color: #183b36 !important;
                line-height: 1.25 !important;
                margin: 0 0 4px 0 !important;
              }
              #invoice .inv-business-sub {
                font-size: 10px !important;
                color: #4e605b !important;
                line-height: 1.4 !important;
                margin: 2px 0 !important;
              }
              #invoice .inv-title-bar {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 16px !important;
                margin: 10px 0 !important;
                padding-bottom: 8px !important;
                border-bottom: 1px solid #f1f5f9 !important;
              }
              #invoice .inv-customer-box {
                border: 1px solid #d7e2df !important;
                background-color: #f9fbfa !important;
                border-radius: 6px !important;
                padding: 10px 14px !important;
                margin-bottom: 12px !important;
              }
              #invoice .inv-customer-heading {
                font-size: 10.5px !important;
                font-weight: 700 !important;
                color: #176b5b !important;
                text-transform: uppercase !important;
                letter-spacing: 0.04em !important;
                margin: 0 0 6px 0 !important;
              }
              #invoice .inv-customer-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                column-gap: 24px !important;
                row-gap: 4px !important;
                font-size: 10px !important;
                line-height: 1.45 !important;
              }
              #invoice .inv-table {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                font-size: 10px !important;
                margin-bottom: 12px !important;
              }
              #invoice .inv-table th {
                background-color: #edf6f3 !important;
                color: #183b36 !important;
                font-weight: 700 !important;
                border: 1px solid #bacbc5 !important;
                padding: 7px 6px !important;
                text-align: left !important;
              }
              #invoice .inv-table td {
                border: 1px solid #bacbc5 !important;
                padding: 7px 6px !important;
                text-align: left !important;
                background-color: #ffffff !important;
              }
              #invoice .inv-total-row {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 16px !important;
                margin-top: 12px !important;
              }
              #invoice .inv-upi-box {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 8px 12px !important;
                background-color: #f4f8f7 !important;
                border: 1px solid #d7e2df !important;
                border-radius: 8px !important;
              }
              #invoice .inv-total-box {
                min-width: 200px !important;
                margin-left: auto !important;
                border: 1px solid #176b5b !important;
                background-color: #edf6f3 !important;
                padding: 10px 14px !important;
                border-radius: 6px !important;
                text-align: right !important;
              }
              #invoice .inv-signature {
                display: flex !important;
                justify-content: flex-end !important;
                margin-top: 28px !important;
                margin-bottom: 8px !important;
              }
              #invoice .inv-sig-line {
                width: 175px !important;
                text-align: center !important;
                border-top: 1px solid #6d7e79 !important;
                padding-top: 6px !important;
                font-weight: 600 !important;
              }
              #invoice .inv-footer {
                border-top: 1px solid #e0e8e5 !important;
                margin-top: 16px !important;
                padding-top: 8px !important;
                color: #72817d !important;
                font-size: 9px !important;
                text-align: center !important;
              }
            `}</style>

            {/* 1. Invoice Header */}
            <div
              className="inv-header"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                borderBottom: '2px solid #176b5b',
                paddingBottom: '12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  className="inv-business-title"
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#183b36',
                    margin: '0 0 4px 0',
                    lineHeight: 1.25,
                  }}
                >
                  {businessName}
                </h2>
                <p className="inv-business-sub" style={{ fontSize: '10px', color: '#4e605b', margin: '2px 0', lineHeight: 1.4 }}>
                  {businessStreet}
                </p>
                <p className="inv-business-sub" style={{ fontSize: '10px', color: '#4e605b', margin: '2px 0', lineHeight: 1.4 }}>
                  {businessPlace}
                </p>
                <p className="inv-business-sub" style={{ fontSize: '10px', color: '#4e605b', margin: '2px 0', lineHeight: 1.4 }}>
                  {businessState}
                </p>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#1f2937', margin: '3px 0' }}>
                  {businessContact}
                </p>
                <p className="inv-business-sub" style={{ fontSize: '9px', color: '#64748b', margin: '1px 0' }}>
                  {businessEmail}
                </p>
                <p className="inv-business-sub" style={{ fontSize: '9px', color: '#64748b', margin: '1px 0' }}>
                  {businessInstagram}
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <LogoGraphic url={business.logoUrl} size={64} />
              </div>
            </div>

            {/* 2. Invoice Title & Meta */}
            <div
              className="inv-title-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                margin: '10px 0',
                paddingBottom: '8px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#183b36',
                    margin: 0,
                    letterSpacing: '0.04em',
                  }}
                >
                  {t.invoice}
                </h3>
                <span
                  style={{
                    fontSize: '9px',
                    color: '#94a3b8',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Original Client Copy
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: 1.5 }}>
                <div>
                  <strong style={{ color: '#183b36' }}>{t.billNumberLabel}</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {bill.billNumber || '—'}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#183b36' }}>{t.billDateLabel}</strong>{' '}
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    {formatDateDisplay(bill.billDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Customer Details Block */}
            <div
              className="inv-customer-box"
              style={{
                border: '1px solid #d7e2df',
                backgroundColor: '#f9fbfa',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '12px',
              }}
            >
              <h4
                className="inv-customer-heading"
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#176b5b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: '0 0 6px 0',
                }}
              >
                {t.customerTitle}
              </h4>
              <div
                className="inv-customer-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: '24px',
                  rowGap: '4px',
                  fontSize: '10px',
                  lineHeight: 1.45,
                }}
              >
                <div>
                  <strong style={{ color: '#40534e' }}>{t.name}:</strong>{' '}
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{bill.customer.name || '—'}</span>
                </div>
                <div>
                  <strong style={{ color: '#40534e' }}>{t.contactLabel}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{bill.customer.contact || '—'}</span>
                </div>
                <div>
                  <strong style={{ color: '#40534e' }}>{t.streetLabel}:</strong>{' '}
                  <span style={{ color: '#334155' }}>{bill.customer.street || '—'}</span>
                </div>
                {bill.customer.email && (
                  <div>
                    <strong style={{ color: '#40534e' }}>{t.emailLabel}:</strong>{' '}
                    <span style={{ color: '#334155' }}>{bill.customer.email}</span>
                  </div>
                )}
                <div>
                  <strong style={{ color: '#40534e' }}>{t.placeLabel}:</strong>{' '}
                  <span style={{ color: '#334155' }}>{bill.customer.place || '—'}</span>
                </div>
                <div>
                  <strong style={{ color: '#40534e' }}>{t.districtLabel}:</strong>{' '}
                  <span style={{ color: '#334155' }}>{bill.customer.district || '—'}</span>
                </div>
                <div>
                  <strong style={{ color: '#40534e' }}>{t.stateLabel}:</strong>{' '}
                  <span style={{ color: '#334155' }}>{bill.customer.state || 'Tamil Nadu'}</span>
                </div>
                <div>
                  <strong style={{ color: '#40534e' }}>{t.pinLabel}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', color: '#334155' }}>{bill.customer.pincode || '—'}</span>
                </div>
              </div>
            </div>

            {/* 4. Items Table */}
            <div style={{ marginBottom: '12px' }}>
              <table
                className="inv-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  fontSize: '10px',
                  marginBottom: '12px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#edf6f3', color: '#183b36', borderTop: '1px solid #bacbc5', borderBottom: '1px solid #bacbc5' }}>
                    <th style={{ padding: '7px 6px', textAlign: 'center', width: '7%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.sno}
                    </th>
                    <th style={{ padding: '7px 8px', textAlign: 'left', width: '36%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.description}
                    </th>
                    <th style={{ padding: '7px 6px', textAlign: 'left', width: '20%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.platform}
                    </th>
                    <th style={{ padding: '7px 6px', textAlign: 'center', width: '12%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.fromDate}
                    </th>
                    <th style={{ padding: '7px 6px', textAlign: 'center', width: '12%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.toDate}
                    </th>
                    <th style={{ padding: '7px 8px', textAlign: 'right', width: '13%', border: '1px solid #bacbc5', fontWeight: 700, backgroundColor: '#edf6f3' }}>
                      {t.amount}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #bacbc5' }}>
                      <td style={{ padding: '7px 6px', textAlign: 'center', border: '1px solid #bacbc5', fontWeight: 600, color: '#176b5b' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '7px 8px', border: '1px solid #bacbc5', fontWeight: 500, color: '#0f172a', wordBreak: 'break-word' }}>
                        {item.description || '—'}
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #bacbc5', color: '#334155' }}>
                        {item.platforms.join(', ') || '—'}
                      </td>
                      <td style={{ padding: '7px 6px', textAlign: 'center', border: '1px solid #bacbc5', color: '#334155', whiteSpace: 'nowrap' }}>
                        {formatDateDisplay(item.fromDate)}
                      </td>
                      <td style={{ padding: '7px 6px', textAlign: 'center', border: '1px solid #bacbc5', color: '#334155', whiteSpace: 'nowrap' }}>
                        {formatDateDisplay(item.toDate)}
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'right', border: '1px solid #bacbc5', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {bill.items.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', border: '1px solid #bacbc5' }}>
                        — No items added —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. Bottom Summary: UPI QR & Total Box */}
            <div
              className="inv-total-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '12px',
                paddingTop: '4px',
              }}
            >
              {/* UPI QR Payment Block */}
              {business.upiId && showUpiQr && qrDataUrl ? (
                <div
                  className="inv-upi-box"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#f4f8f7',
                    border: '1px solid #d7e2df',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={qrDataUrl}
                    alt="UPI Payment QR"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      padding: '2px',
                      border: '1px solid #cbd5e1',
                      display: 'block',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: '9px', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 700, color: '#183b36', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <QrCode style={{ width: '12px', height: '12px', color: '#176b5b' }} />
                      <span>Instant UPI Payment</span>
                    </div>
                    <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '9px' }}>{business.upiId}</div>
                    <div style={{ fontSize: '8.5px', color: '#047857', fontWeight: 600 }}>GPay • PhonePe • Paytm</div>
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* Total Box */}
              <div
                className="inv-total-box"
                style={{
                  minWidth: '200px',
                  marginLeft: 'auto',
                  border: '1px solid #176b5b',
                  backgroundColor: '#edf6f3',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#183b36',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t.totalLabel}
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#176b5b',
                    margin: '2px 0',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(total)}
                </div>
                <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px' }}>
                  {language === 'ta' ? 'வரி விலக்கு அளிக்கப்பட்டது (GST இல்லை)' : 'Exempt / No GST Included'}
                </div>
              </div>
            </div>

            {/* 6. Authorized Signature */}
            <div
              className="inv-signature"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '28px',
                marginBottom: '8px',
              }}
            >
              <div
                className="inv-sig-line"
                style={{
                  width: '175px',
                  textAlign: 'center',
                  borderTop: '1px solid #6d7e79',
                  paddingTop: '6px',
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#1f2937' }}>
                  {signatureText}
                </span>
                <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 500, marginTop: '1px' }}>Mugavai Ads</div>
              </div>
            </div>

            {/* 7. Footer Note */}
            <div
              className="inv-footer"
              style={{
                borderTop: '1px solid #e0e8e5',
                marginTop: '16px',
                paddingTop: '8px',
                color: '#72817d',
                fontSize: '9px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0 }}>{footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
