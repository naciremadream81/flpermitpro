import { useState, useCallback } from 'react';
import { Upload, FileCheck, Loader, AlertCircle } from 'lucide-react';
import { OcrDropZone } from './OcrDropZone';
import { OcrResultCard } from './OcrResultCard';
import { Button } from '@/components/shared/Button';
import { uploadDocument } from '@/services/firestore/storage';
import { extractDocumentData } from '@/services/ai/ocrService';
import type { DocumentType, OcrResult, PermitDocument } from '@/types';

interface DocumentUploadZoneProps {
  userId: string;
  permitId: string;
  onUploadComplete: (doc: PermitDocument) => void;
}

type UploadPhase = 'idle' | 'uploading' | 'scanning' | 'done' | 'error';

export function DocumentUploadZone({ userId, permitId, onUploadComplete }: DocumentUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('other');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelected = useCallback((file: File, docType: DocumentType) => {
    setSelectedFile(file);
    setSelectedType(docType);
    setOcrResult(null);
    setPhase('idle');
    setUploadProgress(0);
    setErrorMessage('');
  }, []);

  const handleConfirm = async () => {
    if (!selectedFile) return;

    try {
      // Phase 1: Upload to Firebase Storage
      setPhase('uploading');
      setUploadProgress(0);

      // Animate progress while the upload runs. uploadDocument doesn't
      // expose byte-level progress, so we animate to 90% and jump to
      // 100% on completion.
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const { storagePath, downloadUrl } = await uploadDocument(userId, permitId, selectedFile, selectedType);
      clearInterval(progressTimer);
      setUploadProgress(100);

      // Phase 2: Auto-OCR for supported document types
      let finalOcrResult: OcrResult | null = null;
      if (['deed', 'data-plate', 'noc'].includes(selectedType)) {
        setPhase('scanning');
        try {
          finalOcrResult = await extractDocumentData(selectedFile, selectedType);
          setOcrResult(finalOcrResult);
        } catch {
          // OCR failure is non-blocking — the file is already stored
        }
      }

      // Phase 3: Build the PermitDocument and notify the parent
      const newDoc: PermitDocument = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        fileType: selectedType,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        ocrResult: finalOcrResult,
      };

      setPhase('done');
      onUploadComplete(newDoc);
    } catch (err) {
      setPhase('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Upload failed. Please try again.',
      );
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setPhase('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  const isProcessing = phase === 'uploading' || phase === 'scanning';

  return (
    <div className="space-y-4">
      <OcrDropZone onFileSelected={handleFileSelected} loading={isProcessing} />

      {/* Upload progress bar */}
      {phase === 'uploading' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader size={14} className="animate-spin" />
            Uploading to secure storage…
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* OCR scanning indicator */}
      {phase === 'scanning' && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Loader size={14} className="animate-spin" />
          Running OCR extraction…
        </div>
      )}

      {/* Error state */}
      {phase === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Dismiss
          </Button>
        </div>
      )}

      {/* OCR results */}
      {ocrResult && <OcrResultCard result={ocrResult} documentType={selectedType} />}

      {/* File confirmation bar */}
      {selectedFile && !isProcessing && phase !== 'done' && phase !== 'error' && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-sm">
            <FileCheck size={16} className="text-green-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
              {selectedFile.name}
            </span>
          </div>
          <Button size="sm" onClick={handleConfirm}>
            <Upload size={14} className="mr-1" />
            Upload &amp; Add to Folder
          </Button>
        </div>
      )}

      {/* Success state — allow adding another */}
      {phase === 'done' && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <FileCheck size={16} />
            Document uploaded successfully.
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Add Another
          </Button>
        </div>
      )}
    </div>
  );
}
