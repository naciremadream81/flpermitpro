import { useState, useEffect, useMemo } from 'react';
import { FileText, Upload } from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { Button } from '@/components/shared/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DOCUMENT_TYPES } from '@/config/constants';
import { getDocumentUrl } from '@/services/firestore/storage';
import type { PermitDocument } from '@/types';
import { formatDate } from '@/utils/formatters';

function isPdfDocument(doc: PermitDocument): boolean {
  return doc.fileName.toLowerCase().endsWith('.pdf');
}

interface PermitFolderProps {
  documents: PermitDocument[];
  onUpload?: () => void;
  /** When set, PDFs show a sign flow that returns a stamped PDF blob for upload. */
  onSignedPdfReady?: (sourceDoc: PermitDocument, blob: Blob, pageNumber: number) => void;
}

export function PermitFolder({ documents, onUpload, onSignedPdfReady }: PermitFolderProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null,
  );
  /** Resolved legacy URL keyed by `storagePath` so switching docs never shows a stale PDF. */
  const [legacyFetch, setLegacyFetch] = useState<{
    path: string;
    url: string | null;
    pending: boolean;
  } | null>(null);

  const selectedDoc = documents.find(d => d.id === selectedDocId);
  const getDocLabel = (type: PermitDocument['fileType']) =>
    DOCUMENT_TYPES.find(t => t.value === type)?.label ?? type;

  /** Sync path: no doc → null; modern docs use `downloadUrl` directly. */
  const displayUrl = useMemo(() => {
    if (!selectedDoc) return null;
    if (selectedDoc.downloadUrl) return selectedDoc.downloadUrl;
    if (!legacyFetch || legacyFetch.path !== selectedDoc.storagePath) return null;
    return legacyFetch.url;
  }, [selectedDoc, legacyFetch]);

  /** Spinner while a legacy doc is loading or its path does not match resolved state yet. */
  const showResolving = Boolean(
    selectedDoc &&
      !selectedDoc.downloadUrl &&
      (!legacyFetch ||
        legacyFetch.path !== selectedDoc.storagePath ||
        legacyFetch.pending),
  );

  /**
   * Async path only: legacy documents have `storagePath` and need
   * getDocumentUrl. Sync cases are handled by useMemo above.
   */
  useEffect(() => {
    if (!selectedDoc || selectedDoc.downloadUrl) {
      return;
    }

    const path = selectedDoc.storagePath;
    let cancelled = false;
    // Defer setState so the effect body does not trigger a synchronous cascade
    // (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (cancelled) return;
      setLegacyFetch({ path, url: null, pending: true });
    });

    getDocumentUrl(path)
      .then(url => {
        if (!cancelled) setLegacyFetch({ path, url, pending: false });
      })
      .catch(() => {
        if (!cancelled) setLegacyFetch({ path, url: null, pending: false });
      });

    return () => { cancelled = true; };
  }, [selectedDoc]);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={40} />}
        title="No documents uploaded"
        description="Upload site plans, blocking charts, deeds, and other permit documents."
        action={onUpload && <Button onClick={onUpload}><Upload size={16} className="mr-2" />Upload Document</Button>}
      />
    );
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Document list */}
      <div className="w-56 shrink-0 overflow-y-auto space-y-1">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocId(doc.id)}
            className={`w-full flex items-start gap-2 rounded-lg p-2.5 text-left text-sm transition-colors ${doc.id === selectedDocId ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <FileText size={14} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-medium">{doc.fileName}</p>
              <p className="text-xs opacity-70">{getDocLabel(doc.fileType)}</p>
              <p className="text-xs opacity-50">{formatDate(doc.uploadedAt)}</p>
            </div>
          </button>
        ))}
        {onUpload && (
          <button onClick={onUpload}
            className="w-full flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 dark:border-gray-700">
            <Upload size={14} />
            Upload Doc
          </button>
        )}
      </div>

      {/* PDF viewer — uses the resolved HTTP download URL */}
      {selectedDoc && showResolving && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {selectedDoc && displayUrl && !showResolving && (
        <div className="flex-1 min-w-0">
          <PdfViewer
            url={displayUrl}
            fileName={selectedDoc.fileName}
            enableSigning={isPdfDocument(selectedDoc) && Boolean(onSignedPdfReady)}
            onSignedPdfReady={
              onSignedPdfReady && isPdfDocument(selectedDoc)
                ? (blob, pageNum) => { onSignedPdfReady(selectedDoc, blob, pageNum); }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
