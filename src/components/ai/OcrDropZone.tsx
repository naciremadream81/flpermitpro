import { useCallback, useState } from 'react';
import { FileImage, Loader, AlertCircle, RotateCcw } from 'lucide-react';
import { OcrResultCard } from './OcrResultCard';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { extractDocumentData } from '@/services/ai/ocrService';
import { DOCUMENT_TYPES } from '@/config/constants';
import type { DocumentType, OcrResult } from '@/types';

interface OcrDropZoneProps {
  onFileSelected: (file: File, documentType: DocumentType) => void;
  loading?: boolean;
}

export function OcrDropZone({ onFileSelected, loading = false }: OcrDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('other');
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const isBusy = loading || scanning;

  const runOcr = useCallback(async (file: File, type: DocumentType) => {
    if (!['deed', 'data-plate', 'noc'].includes(type)) return;

    setScanning(true);
    setOcrError(null);
    setOcrResult(null);

    try {
      const result = await extractDocumentData(file, type);
      setOcrResult(result);
    } catch (err) {
      setOcrError(
        err instanceof Error ? err.message : 'OCR extraction failed. Please try again.',
      );
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setLastFile(file);
    setOcrResult(null);
    setOcrError(null);
    onFileSelected(file, docType);
    runOcr(file, docType);
  }, [docType, onFileSelected, runOcr]);

  const handleRetry = useCallback(() => {
    if (lastFile) {
      runOcr(lastFile, docType);
    }
  }, [lastFile, docType, runOcr]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-3">
      <Select
        label="Document Type"
        options={DOCUMENT_TYPES.map(t => ({ value: t.value, label: t.label }))}
        value={docType}
        onChange={(e) => setDocType(e.target.value as DocumentType)}
      />

      <label
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
        } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleInput} disabled={isBusy} />
        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
          {isBusy ? (
            <Loader size={32} className="animate-spin text-blue-500" />
          ) : (
            <FileImage size={32} />
          )}
          <p className="text-sm font-medium">
            {scanning ? 'Running OCR extraction…' : loading ? 'Scanning document…' : 'Drop document here or click to browse'}
          </p>
          <p className="text-xs">Images (JPG, PNG) or PDF</p>
        </div>
      </label>

      {/* OCR scanning indicator (standalone, when parent isn't controlling loading) */}
      {scanning && !loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Loader size={14} className="animate-spin" />
          Extracting document data with AI…
        </div>
      )}

      {/* OCR error with retry */}
      {ocrError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
          <span className="flex-1 text-sm text-red-700 dark:text-red-400">{ocrError}</span>
          <Button variant="ghost" size="sm" onClick={handleRetry}>
            <RotateCcw size={14} className="mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* OCR result card */}
      {ocrResult && (
        <OcrResultCard result={ocrResult} documentType={docType} />
      )}
    </div>
  );
}
