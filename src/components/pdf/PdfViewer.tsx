import { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PdfToolbar } from './PdfToolbar';
import { PdfThumbnailStrip } from './PdfThumbnailStrip';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { SignaturePad } from './SignaturePad';
import { signaturePadToPngDataUrl } from './signaturePadUtils';
import { stampSignatureOnPdf } from '@/services/pdf/stampSignature';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  url: string;
  fileName?: string;
  enableSigning?: boolean;
  onSignedPdfReady?: (blob: Blob, pageNumber: number) => void;
}

async function dataUrlToUint8(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

export function PdfViewer({ url, fileName, enableSigning, onSignedPdfReady }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [placingSignature, setPlacingSignature] = useState(false);
  const [stamping, setStamping] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setCurrentPage(1);
    setLoading(false);
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3.0));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, numPages));

  const handleSignToolbarClick = () => {
    if (placingSignature) {
      setPlacingSignature(false);
      return;
    }
    if (signModalOpen) {
      setSignModalOpen(false);
      return;
    }
    setSignModalOpen(true);
  };

  const handleApplySignatureFromModal = () => {
    const dataUrl = signaturePadToPngDataUrl(signatureCanvasRef.current);
    if (!dataUrl) {
      return;
    }
    setSignModalOpen(false);
    setPlacingSignature(true);
  };

  const handlePlacementClick = async (e: React.MouseEvent<HTMLElement>) => {
    if (!placingSignature || !onSignedPdfReady || !pageWrapRef.current) return;

    const dataUrl = signaturePadToPngDataUrl(signatureCanvasRef.current);
    if (!dataUrl) {
      setPlacingSignature(false);
      return;
    }

    const rect = pageWrapRef.current.getBoundingClientRect();
    const xNorm = (e.clientX - rect.left) / rect.width;
    const yNorm = (e.clientY - rect.top) / rect.height;

    setStamping(true);
    try {
      const pdfRes = await fetch(url);
      if (!pdfRes.ok) throw new Error('Could not download PDF for signing');
      const pdfBuf = await pdfRes.arrayBuffer();
      const pngBytes = await dataUrlToUint8(dataUrl);
      const outBytes = await stampSignatureOnPdf(
        pdfBuf,
        pngBytes,
        currentPage - 1,
        xNorm,
        yNorm,
      );
      const copy = new Uint8Array(outBytes);
      const blob = new Blob([copy], { type: 'application/pdf' });
      onSignedPdfReady(blob, currentPage);
      setPlacingSignature(false);
    } catch {
      setPlacingSignature(false);
    } finally {
      setStamping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <PdfToolbar
        fileName={fileName}
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onPageChange={setCurrentPage}
        enableSigning={Boolean(enableSigning && onSignedPdfReady)}
        signingOpen={signModalOpen}
        placingSignature={placingSignature}
        onSignClick={enableSigning && onSignedPdfReady ? handleSignToolbarClick : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        {numPages > 1 && (
          <PdfThumbnailStrip
            url={url}
            numPages={numPages}
            currentPage={currentPage}
            onPageSelect={setCurrentPage}
          />
        )}

        <div className="flex-1 overflow-auto flex flex-col items-center justify-start p-4 gap-2">
          {placingSignature && (
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Click on the page where the signature should appear
            </p>
          )}
          {stamping && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Applying signature…</p>
          )}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading=""
            className="flex flex-col items-center gap-4"
          >
            <div ref={pageWrapRef} className="relative shadow-lg">
              <Page
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                loading=""
              />
              {placingSignature && !stamping && (
                <button
                  type="button"
                  className="absolute inset-0 z-10 cursor-crosshair bg-blue-500/5 hover:bg-blue-500/10"
                  aria-label="Place signature on PDF"
                  onClick={handlePlacementClick}
                />
              )}
            </div>
          </Document>
        </div>
      </div>

      <Modal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        title="Draw your signature"
        size="md"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Sign in the box, then place it on the PDF page you are viewing.
        </p>
        <SignaturePad canvasRef={signatureCanvasRef} />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setSignModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleApplySignatureFromModal}>
            Next: place on PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
