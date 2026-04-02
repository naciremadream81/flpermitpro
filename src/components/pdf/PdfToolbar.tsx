import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, FileText, PenLine } from 'lucide-react';

interface PdfToolbarProps {
  fileName?: string;
  currentPage: number;
  numPages: number;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  enableSigning?: boolean;
  signingOpen?: boolean;
  placingSignature?: boolean;
  onSignClick?: () => void;
}

export function PdfToolbar({
  fileName, currentPage, numPages, scale,
  onZoomIn, onZoomOut, onRotate, onPrevPage, onNextPage, onPageChange,
  enableSigning,
  signingOpen,
  placingSignature,
  onSignClick,
}: PdfToolbarProps) {
  const btnClass = 'rounded-lg p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
      {fileName && (
        <div className="flex items-center gap-2 mr-2 min-w-0">
          <FileText size={16} className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{fileName}</span>
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button className={btnClass} onClick={onPrevPage} disabled={currentPage <= 1}>
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="number" min={1} max={numPages} value={currentPage}
            onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= numPages) onPageChange(p); }}
            className="w-10 rounded border border-gray-300 bg-white px-1 py-0.5 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <span>/ {numPages}</span>
        </div>
        <button className={btnClass} onClick={onNextPage} disabled={currentPage >= numPages}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button className={btnClass} onClick={onZoomOut} disabled={scale <= 0.5}>
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400 w-14 text-center">{Math.round(scale * 100)}%</span>
        <button className={btnClass} onClick={onZoomIn} disabled={scale >= 3.0}>
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Rotate */}
      <button className={btnClass} onClick={onRotate} title="Rotate 90°">
        <RotateCw size={16} />
      </button>

      {enableSigning && onSignClick && (
        <>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            className={`${btnClass} ${signingOpen || placingSignature ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : ''}`}
            onClick={onSignClick}
            title="Sign PDF"
          >
            <PenLine size={16} />
          </button>
        </>
      )}
    </div>
  );
}
