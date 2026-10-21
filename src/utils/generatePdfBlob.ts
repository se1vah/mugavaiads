import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

/**
 * Generates an A4 PDF from the invoice element with guaranteed identical
 * tablet dimensions, formatting, and layout across all devices (mobile, tablet, desktop).
 */
export async function generateInvoicePdf(
  invoiceElement: HTMLElement,
  billNumber: string
): Promise<GeneratePdfResult> {
  const cleanFileName = `Mugavai-Ads-${(billNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // Render canvas with html2canvas-pro
  // We use onclone to ensure that even on narrow mobile viewports,
  // the captured invoice is rendered with exact fixed tablet dimensions (740px)
  // and 2-column layouts without any mobile responsive collapse.
  const canvas = await html2canvas(invoiceElement, {
    scale: 2.5,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1024,
    windowHeight: 1400,
    onclone: (clonedDoc) => {
      const clonedInvoice = clonedDoc.getElementById('invoice');
      if (clonedInvoice) {
        // Enforce exact tablet/desktop container dimensions
        clonedInvoice.style.width = '720px';
        clonedInvoice.style.minWidth = '720px';
        clonedInvoice.style.maxWidth = '720px';
        clonedInvoice.style.padding = '24px';
        clonedInvoice.style.boxSizing = 'border-box';

        // Enforce 2-column grid for customer details block
        const customerGrid = clonedInvoice.querySelector('.customer-grid') as HTMLElement | null;
        if (customerGrid) {
          customerGrid.style.display = 'grid';
          customerGrid.style.gridTemplateColumns = '1fr 1fr';
          customerGrid.style.columnGap = '16px';
          customerGrid.style.rowGap = '4px';
        }

        // Enforce horizontal row for total and QR summary
        const totalRow = clonedInvoice.querySelector('.total-row') as HTMLElement | null;
        if (totalRow) {
          totalRow.style.display = 'flex';
          totalRow.style.flexDirection = 'row';
          totalRow.style.alignItems = 'center';
          totalRow.style.justifyContent = 'space-between';
        }

        // Enforce horizontal row for header
        const headerRow = clonedInvoice.querySelector('.invoice-header') as HTMLElement | null;
        if (headerRow) {
          headerRow.style.display = 'flex';
          headerRow.style.flexDirection = 'row';
          headerRow.style.alignItems = 'flex-start';
          headerRow.style.justifyContent = 'space-between';
        }
      }
    },
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

  // Compute exact scale ratio
  const widthRatio = printableWidth / canvas.width;
  const heightRatio = printableHeight / canvas.height;
  const ratio = Math.min(widthRatio, heightRatio);

  const finalWidth = canvas.width * ratio;
  const finalHeight = canvas.height * ratio;

  // Center horizontally
  const xOffset = margin + (printableWidth - finalWidth) / 2;
  const yOffset = margin;

  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

  const blob = pdf.output('blob');
  return { pdf, blob, fileName: cleanFileName };
}
