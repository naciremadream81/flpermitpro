import { PDFDocument } from 'pdf-lib';

/**
 * Embeds a PNG signature onto a PDF page at a position derived from normalized
 * click coordinates (0–1, top-left origin) relative to the page viewport.
 */
export async function stampSignatureOnPdf(
  pdfBuffer: ArrayBuffer,
  signaturePngBytes: Uint8Array,
  pageIndexZeroBased: number,
  clickXNormFromLeft: number,
  clickYNormFromTop: number,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  if (pageIndexZeroBased < 0 || pageIndexZeroBased >= pages.length) {
    throw new Error('Invalid page index for signature placement');
  }

  const page = pages[pageIndexZeroBased];
  const { width: w, height: h } = page.getSize();
  const png = await pdfDoc.embedPng(signaturePngBytes);

  const sigW = Math.min(140, w * 0.38);
  const aspect = png.height / png.width;
  const sigH = sigW * aspect;

  const nx = Math.min(1, Math.max(0, clickXNormFromLeft));
  const ny = Math.min(1, Math.max(0, clickYNormFromTop));

  const centerX = nx * w;
  const centerYFromTop = ny * h;
  const x = centerX - sigW / 2;
  const y = h - centerYFromTop - sigH / 2;

  const clampedX = Math.max(0, Math.min(x, w - sigW));
  const clampedY = Math.max(0, Math.min(y, h - sigH));

  page.drawImage(png, { x: clampedX, y: clampedY, width: sigW, height: sigH });

  return pdfDoc.save();
}
