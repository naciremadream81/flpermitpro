import { Document, Page } from 'react-pdf';

interface PdfThumbnailStripProps {
  url: string;
  numPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

export function PdfThumbnailStrip({ url, numPages, currentPage, onPageSelect }: PdfThumbnailStripProps) {
  return (
    <div className="w-24 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 flex flex-col gap-2 p-2">
      <Document file={url} loading="">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageSelect(page)}
            className={`w-full rounded border-2 overflow-hidden transition-colors ${page === currentPage ? 'border-blue-500' : 'border-transparent hover:border-gray-400'}`}
          >
            <Page pageNumber={page} width={80} loading="" />
            <p className={`text-center text-xs py-0.5 ${page === currentPage ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              {page}
            </p>
          </button>
        ))}
      </Document>
    </div>
  );
}
