/**
 * DocumentViewer — Split-panel document management with inline preview.
 *
 * Left panel: scrollable document list with approval status indicators.
 * Right panel: inline iframe/image viewer + Approve / Reject / Download actions.
 *
 * Drop this in as a replacement for the PermitFolder section on PermitDetailPage:
 *   <DocumentViewer
 *     documents={permit.documents}
 *     onApprove={(id, notes) => { ... patch permit ... }}
 *     onReject={(id, notes) => { ... patch permit ... }}
 *   />
 */

import { useState } from 'react';
import {
  FileText, Image, CheckCircle, XCircle, Clock, Download,
  ThumbsUp, ThumbsDown, Eye, ChevronRight, AlertCircle, FileWarning,
} from 'lucide-react';
import type { PermitDocument, DocumentApprovalStatus } from '@/types';
import { DOCUMENT_TYPES } from '@/config/constants';

interface DocumentViewerProps {
  documents: PermitDocument[];
  onApprove?: (docId: string, notes?: string) => void;
  onReject?: (docId: string, notes?: string) => void;
  currentUserId?: string;
}

function getDocLabel(fileType: PermitDocument['fileType']): string {
  return DOCUMENT_TYPES.find(t => t.value === fileType)?.label ?? fileType;
}

function isImage(fileName: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName);
}

function isPdf(fileName: string): boolean {
  return /\.pdf$/i.test(fileName);
}

const APPROVAL_CONFIG: Record<DocumentApprovalStatus, {
  color: string; bg: string; border: string; icon: typeof CheckCircle; label: string;
}> = {
  approved: {
    color: '#0ECC89', bg: 'rgb(14 204 137 / 0.10)', border: 'rgb(14 204 137 / 0.25)',
    icon: CheckCircle, label: 'Approved',
  },
  pending: {
    color: '#F4D03F', bg: 'rgb(244 208 63 / 0.10)', border: 'rgb(244 208 63 / 0.25)',
    icon: Clock, label: 'Pending Review',
  },
  rejected: {
    color: '#FF4B5B', bg: 'rgb(255 75 91 / 0.10)', border: 'rgb(255 75 91 / 0.25)',
    icon: XCircle, label: 'Rejected',
  },
};

export function DocumentViewer({ documents, onApprove, onReject, currentUserId }: DocumentViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    documents.length > 0 ? documents[0]!.id : null,
  );
  const [approvalNote, setApprovalNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState<'approve' | 'reject' | null>(null);
  const [viewError, setViewError] = useState(false);

  const selected = documents.find(d => d.id === selectedId);
  const approvalStatus = selected?.approvalStatus ?? 'pending';
  const approvalCfg = APPROVAL_CONFIG[approvalStatus];

  const handleApprove = () => {
    if (!selected || !onApprove) return;
    onApprove(selected.id, approvalNote.trim() || undefined);
    setApprovalNote('');
    setShowNoteForm(null);
  };

  const handleReject = () => {
    if (!selected || !onReject) return;
    onReject(selected.id, approvalNote.trim() || undefined);
    setApprovalNote('');
    setShowNoteForm(null);
  };

  const handleDownload = () => {
    if (!selected?.downloadUrl) return;
    const a = document.createElement('a');
    a.href = selected.downloadUrl;
    a.download = selected.fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (documents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-xl text-center"
        style={{ background: '#111928', border: '1px solid rgb(255 255 255 / 0.06)' }}
      >
        <FileText size={36} style={{ color: '#3A4558', marginBottom: 12 }} />
        <p style={{ fontFamily: "'Syne', sans-serif", color: '#8A95AA', fontSize: '14px', fontWeight: 600 }}>
          No documents uploaded
        </p>
        <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
          Upload documents using the upload zone above
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgb(255 255 255 / 0.06)', background: '#0F1624' }}
    >
      <div className="flex" style={{ minHeight: '480px' }}>
        {/* ── Left: document list ───────────────────────────── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            width: '260px',
            minWidth: '260px',
            borderRight: '1px solid rgb(255 255 255 / 0.06)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgb(255 255 255 / 0.06)' }}
          >
            <Eye size={13} style={{ color: '#4A5568' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#4A5568', letterSpacing: '0.1em' }}>
              DOCUMENTS ({documents.length})
            </span>
          </div>

          <div className="py-2 flex-1">
            {documents.map((doc) => {
              const status = doc.approvalStatus ?? 'pending';
              const cfg = APPROVAL_CONFIG[status];
              const StatusIcon = cfg.icon;
              const isSelected = doc.id === selectedId;

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => { setSelectedId(doc.id); setViewError(false); setShowNoteForm(null); }}
                  className="w-full flex items-start gap-2.5 px-3 py-3 text-left transition-all"
                  style={{
                    background: isSelected ? 'rgb(244 166 35 / 0.07)' : 'transparent',
                    borderLeft: isSelected ? '2px solid #F4A623' : '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 255 255 / 0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {/* File type icon */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md mt-0.5"
                    style={{
                      background: isImage(doc.fileName) ? 'rgb(167 139 250 / 0.10)' : 'rgb(91 155 255 / 0.10)',
                    }}
                  >
                    {isImage(doc.fileName)
                      ? <Image size={13} style={{ color: '#A78BFA' }} />
                      : <FileText size={13} style={{ color: '#5B9BFF' }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate text-xs font-medium leading-snug"
                      style={{ color: isSelected ? '#EBF0FA' : '#8A95AA' }}
                    >
                      {doc.fileName}
                    </p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: '#4A5568' }}>
                      {getDocLabel(doc.fileType)}
                    </p>
                    {/* Approval status */}
                    <div className="flex items-center gap-1 mt-1">
                      <StatusIcon size={9} style={{ color: cfg.color }} />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <ChevronRight size={12} style={{ color: '#F4A623', flexShrink: 0, marginTop: 4 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: viewer + action bar ───────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">
          {selected ? (
            <>
              {/* Viewer header */}
              <div
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid rgb(255 255 255 / 0.06)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: approvalCfg.color,
                      background: approvalCfg.bg,
                      border: `1px solid ${approvalCfg.border}`,
                    }}
                  >
                    {approvalCfg.label.toUpperCase()}
                  </span>
                  <span className="truncate text-xs font-medium" style={{ color: '#8A95AA' }}>
                    {selected.fileName}
                  </span>
                </div>
                <span
                  className="shrink-0 text-[10px]"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#3A4558' }}
                >
                  {getDocLabel(selected.fileType)}
                </span>
              </div>

              {/* Document preview */}
              <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ background: '#080C14', minHeight: '320px' }}>
                {selected.downloadUrl && !viewError ? (
                  isPdf(selected.fileName) ? (
                    <iframe
                      key={selected.id}
                      src={`${selected.downloadUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full"
                      style={{ minHeight: '360px', border: 'none' }}
                      title={selected.fileName}
                      onError={() => setViewError(true)}
                    />
                  ) : isImage(selected.fileName) ? (
                    <img
                      key={selected.id}
                      src={selected.downloadUrl}
                      alt={selected.fileName}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '420px', borderRadius: 4 }}
                      onError={() => setViewError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-8">
                      <FileWarning size={40} style={{ color: '#4A5568' }} />
                      <p className="text-sm" style={{ color: '#6B7E98' }}>
                        This file type cannot be previewed inline.
                      </p>
                      {selected.approvalStatus === 'approved' && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                          style={{ background: 'rgb(14 204 137 / 0.12)', color: '#0ECC89', border: '1px solid rgb(14 204 137 / 0.25)' }}
                        >
                          <Download size={14} /> Download File
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center p-8">
                    <AlertCircle size={36} style={{ color: '#4A5568' }} />
                    <p className="text-sm" style={{ color: '#6B7E98' }}>
                      {viewError ? 'Could not load document preview.' : 'No preview available.'}
                    </p>
                    <p className="text-xs" style={{ color: '#4A5568' }}>
                      Document may still need to finish processing.
                    </p>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid rgb(255 255 255 / 0.06)', background: '#0B1120' }}
              >
                {/* Note form */}
                {showNoteForm && (
                  <div className="mb-3 animate-pp-fade-in">
                    <textarea
                      value={approvalNote}
                      onChange={e => setApprovalNote(e.target.value)}
                      placeholder={showNoteForm === 'approve' ? 'Optional approval note…' : 'Reason for rejection (optional)…'}
                      rows={2}
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
                      style={{
                        background: 'rgb(255 255 255 / 0.04)',
                        border: showNoteForm === 'reject'
                          ? '1px solid rgb(255 75 91 / 0.30)'
                          : '1px solid rgb(244 166 35 / 0.25)',
                        color: '#EBF0FA',
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: '12px',
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Approve */}
                  {approvalStatus !== 'approved' && onApprove && (
                    showNoteForm === 'approve' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleApprove}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                          style={{ background: 'rgb(14 204 137 / 0.15)', color: '#0ECC89', border: '1px solid rgb(14 204 137 / 0.30)' }}
                        >
                          <CheckCircle size={13} /> Confirm Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNoteForm(null); setApprovalNote(''); }}
                          className="rounded-lg px-3 py-1.5 text-xs transition-all"
                          style={{ color: '#6B7E98', background: 'rgb(255 255 255 / 0.04)' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNoteForm('approve')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                        style={{ background: 'rgb(14 204 137 / 0.10)', color: '#0ECC89', border: '1px solid rgb(14 204 137 / 0.20)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(14 204 137 / 0.18)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(14 204 137 / 0.10)'; }}
                      >
                        <ThumbsUp size={13} /> Approve
                      </button>
                    )
                  )}

                  {/* Reject */}
                  {approvalStatus !== 'rejected' && onReject && (
                    showNoteForm === 'reject' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleReject}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                          style={{ background: 'rgb(255 75 91 / 0.15)', color: '#FF4B5B', border: '1px solid rgb(255 75 91 / 0.30)' }}
                        >
                          <XCircle size={13} /> Confirm Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNoteForm(null); setApprovalNote(''); }}
                          className="rounded-lg px-3 py-1.5 text-xs transition-all"
                          style={{ color: '#6B7E98', background: 'rgb(255 255 255 / 0.04)' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNoteForm('reject')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                        style={{ background: 'rgb(255 75 91 / 0.08)', color: '#FF4B5B', border: '1px solid rgb(255 75 91 / 0.18)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 75 91 / 0.15)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 75 91 / 0.08)'; }}
                      >
                        <ThumbsDown size={13} /> Reject
                      </button>
                    )
                  )}

                  {/* Approved badge */}
                  {approvalStatus === 'approved' && (
                    <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: 'rgb(14 204 137 / 0.08)', border: '1px solid rgb(14 204 137 / 0.20)' }}>
                      <CheckCircle size={13} style={{ color: '#0ECC89' }} />
                      <span className="text-xs font-medium" style={{ color: '#0ECC89' }}>Approved</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Download — only enabled when approved */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={approvalStatus !== 'approved'}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                    title={approvalStatus !== 'approved' ? 'Approve document before downloading' : `Download ${selected.fileName}`}
                    style={approvalStatus === 'approved' ? {
                      background: 'rgb(244 166 35 / 0.12)',
                      color: '#F4A623',
                      border: '1px solid rgb(244 166 35 / 0.28)',
                      cursor: 'pointer',
                    } : {
                      background: 'rgb(255 255 255 / 0.03)',
                      color: '#3A4558',
                      border: '1px solid rgb(255 255 255 / 0.06)',
                      cursor: 'not-allowed',
                    }}
                    onMouseEnter={e => {
                      if (approvalStatus === 'approved')
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgb(244 166 35 / 0.20)';
                    }}
                    onMouseLeave={e => {
                      if (approvalStatus === 'approved')
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgb(244 166 35 / 0.12)';
                    }}
                  >
                    <Download size={13} />
                    Download
                  </button>
                </div>

                {/* Approval note display */}
                {selected.approvalNotes && !showNoteForm && (
                  <p className="mt-2 text-xs px-1" style={{ color: '#4A5568', fontStyle: 'italic' }}>
                    Note: {selected.approvalNotes}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center flex-col gap-2" style={{ color: '#4A5568' }}>
              <Eye size={28} />
              <p className="text-sm">Select a document to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
