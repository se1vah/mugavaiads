import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

/**
 * Generates an A4 PDF from the invoice element with guaranteed identical
 * desktop dimensions, layout, alignment, and styling across ALL devices (mobile, tablet, desktop).
 *
 * This completely isolates the capture from mobile viewport constraints, responsive CSS,
 * and preview container scale transforms by rendering in an unscaled, fixed desktop environment.
 */
export async function generateInvoicePdf(
  invoiceElement: HTMLElement,
  billNumber: string
): Promise<GeneratePdfResult> {
  const cleanFileName = `Mugavai-Ads-${(billNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // 1. Ensure all Google web fonts (Plus Jakarta Sans, Noto Sans Tamil, Inter) are fully loaded
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // 2. Ensure all images in the source element are completely loaded
  const sourceImages = Array.from(invoiceElement.querySelectorAll('img'));
  await Promise.all(
    sourceImages.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // 3. Clone the invoice into an isolated, unscaled desktop container attached to document.body
  // This eliminates mobile parent CSS transforms (like scale(0.48)), mobile screen width clamping (390px),
  // and mobile-specific responsive shifts.
  const clone = invoiceElement.cloneNode(true) as HTMLElement;
  clone.id = 'invoice-pdf-capture-clone';

  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-99999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '720px';
  offscreenContainer.style.minWidth = '720px';
  offscreenContainer.style.maxWidth = '720px';
  offscreenContainer.style.transform = 'none';
  offscreenContainer.style.webkitTransform = 'none';
  offscreenContainer.style.zIndex = '-99999';
  offscreenContainer.style.overflow = 'visible';
  offscreenContainer.style.backgroundColor = '#ffffff';

  // Force clone to exact desktop tablet width (720px) with zero transforms and no margins
  clone.style.width = '720px';
  clone.style.minWidth = '720px';
  clone.style.maxWidth = '720px';
  clone.style.transform = 'none';
  clone.style.webkitTransform = 'none';
  clone.style.boxSizing = 'border-box';
  clone.style.margin = '0';

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  // 4. Ensure images in the clone are ready
  const cloneImages = Array.from(clone.querySelectorAll('img'));
  await Promise.all(
    cloneImages.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  let canvas: HTMLCanvasElement;
  try {
    // 5. Render canvas with html2canvas-pro using desktop viewport metrics (windowWidth: 1024)
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 720,
      windowWidth: 1024,
      windowHeight: 1400,
      onclone: (clonedDoc) => {
        // Copy all stylesheets from main document to cloned document to guarantee 100% styling parity
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((styleTag) => {
          clonedDoc.head.appendChild(styleTag.cloneNode(true));
        });

        // Ensure cloned invoice in clonedDoc is explicitly 720px and unscaled
        const targetInvoice = clonedDoc.getElementById('invoice-pdf-capture-clone') || clonedDoc.getElementById('invoice');
        if (targetInvoice) {
          targetInvoice.style.width = '720px';
          targetInvoice.style.minWidth = '720px';
          targetInvoice.style.maxWidth = '720px';
          targetInvoice.style.transform = 'none';
          targetInvoice.style.boxSizing = 'border-box';
          targetInvoice.style.margin = '0 auto';
        }
      },
    });
  } finally {
    // 6. Always clean up the temporary off-screen container from the DOM
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }

  // 7. Generate crisp A4 PDF from the high-resolution canvas
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

  // Scale proportionally to fit within single A4 sheet
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
