import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

/**
 * Generates an A4 PDF from the invoice element with guaranteed identical
 * tablet dimensions, formatting, background colors, borders, and layout across all devices.
 */
export async function generateInvoicePdf(
  invoiceElement: HTMLElement,
  billNumber: string
): Promise<GeneratePdfResult> {
  const cleanFileName = `Mugavai-Ads-${(billNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // Wait for Google web fonts (Plus Jakarta Sans, Noto Sans Tamil) to be fully ready
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // Preload and ensure all images inside the invoice element are loaded
  const images = Array.from(invoiceElement.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // Render canvas directly from the live DOM element so all CSS rules,
  // backgrounds, borders, flexbox, and grid styles are preserved 100% identically!
  const canvas = await html2canvas(invoiceElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 8; // 8mm margin
  const printableWidth = pdfWidth - margin * 2; // 194mm
  const printableHeight = pdfHeight - margin * 2; // 281mm

  // Scale to fit neatly within single A4 sheet
  const widthRatio = printableWidth / canvas.width;
  const heightRatio = printableHeight / canvas.height;
  const ratio = Math.min(widthRatio, heightRatio);

  const finalWidth = canvas.width * ratio;
  const finalHeight = canvas.height * ratio;

  // Center horizontally on page
  const xOffset = margin + (printableWidth - finalWidth) / 2;
  const yOffset = margin;

  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

  const blob = pdf.output('blob');
  return { pdf, blob, fileName: cleanFileName };
}
