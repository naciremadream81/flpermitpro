import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ChevronDown, ExternalLink, Users, UserPlus, UserMinus } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WindZoneBadge } from '@/components/shared/WindZoneBadge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { EditableField } from '@/components/shared/EditableField';
import { Textarea } from '@/components/shared/Textarea';
import { Input } from '@/components/shared/Input';
import { DynamicChecklist } from '@/components/checklist/DynamicChecklist';
import { CompliancePanel } from '@/components/compliance/CompliancePanel';
import { PermitFolder } from '@/components/pdf/PermitFolder';
import { AiPreFlightReport, DocumentUploadZone, CameraCapture } from '@/components/ai';
import { usePermitStore } from '@/stores/permitStore';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { patchPermit, deletePermit } from '@/services/firestore/permits';
import { uploadDocument, uploadPdfBlob } from '@/services/firestore/storage';
import { extractDocumentData } from '@/services/ai/ocrService';
import { runComplianceChecks } from '@/services/compliance/engine';
import { PERMIT_STATUSES } from '@/config/constants';
import { formatDate } from '@/utils/formatters';
import type { MobileHome, ModularHome, PermitStatus, PermitDocument, PermitPacket, ComplianceCheck, DocumentType } from '@/types';

const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID ?? 'local';
const DELETE_PERMIT_MODAL = 'delete-permit';

export function PermitDetailPage() {
  const { permitId } = useParams<{ permitId: string }>();
  const { permits, updatePermit, removePermit } = usePermitStore();
  const { addToast, activeModal, openModal, closeModal } = useUiStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const userId = user?.id ?? 'local-user';
  const permit = permits.find(p => p.id === permitId);

  const [cameraDocType, setCameraDocType] = useState<PermitDocument['fileType']>('other');
  const [cameraUploading, setCameraUploading] = useState(false);
  const [notesValue, setNotesValue] = useState(permit?.notes ?? '');
  const [newCollaboratorUid, setNewCollaboratorUid] = useState('');
  const notesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Optimistic inline-save helper. Updates the local store immediately so the
   * UI feels instant, then persists to Firestore in the background. Shows a
   * success toast on save; shows an error toast if the network call fails.
   */
  const handleInlineSave = useCallback(async (changes: Partial<PermitPacket>) => {
    if (!permit) return;
    const patch = { ...changes, updatedAt: new Date() };
    updatePermit(permit.id, patch);
    addToast({ type: 'success', title: 'Field Updated', message: 'Change saved.' });

    try {
      await patchPermit(APP_ID, userId, permit.id, patch);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync change to cloud';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  }, [permit, userId, updatePermit, addToast]);

  /**
   * Auto-saves the notes field on blur with a short debounce so rapid
   * unfocus/refocus cycles don't fire multiple writes.
   */
  const handleNotesBlur = useCallback(() => {
    if (!permit) return;
    if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
    notesSaveTimer.current = setTimeout(async () => {
      if (notesValue === permit.notes) return;
      await handleInlineSave({ notes: notesValue });
    }, 300);
  }, [permit, notesValue, handleInlineSave]);

  /**
   * Called when DocumentUploadZone or CameraCapture delivers a fully
   * uploaded PermitDocument. We optimistically append it to the local
   * store and then persist the change to Firestore.
   */
  const handleDocumentUploaded = useCallback(async (doc: PermitDocument) => {
    if (!permit) return;
    const updatedDocs = [...permit.documents, doc];
    const changes = { documents: updatedDocs, updatedAt: new Date() };

    updatePermit(permit.id, changes);
    addToast({ type: 'success', title: 'Document Added', message: `${doc.fileName} added to the permit folder.` });

    try {
      await patchPermit(APP_ID, userId, permit.id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync document to cloud';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  }, [permit, userId, updatePermit, addToast]);

  /**
   * Handles a camera-captured photo: uploads to Firebase Storage, runs
   * OCR for supported document types, builds a PermitDocument, and
   * adds it to the permit folder through the same pipeline as drag-and-drop.
   */
  const handleCameraCapture = useCallback(async (file: File, docType: DocumentType) => {
    if (!permit) return;
    setCameraUploading(true);

    try {
      const { storagePath, downloadUrl } = await uploadDocument(userId, permit.id, file, docType);

      let ocrResult = null;
      if (['deed', 'data-plate', 'noc'].includes(docType)) {
        try {
          ocrResult = await extractDocumentData(file, docType);
        } catch {
          // OCR failure is non-blocking — the file is already in storage
        }
      }

      const newDoc: PermitDocument = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileType: docType,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        ocrResult,
      };

      await handleDocumentUploaded(newDoc);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload captured image';
      addToast({ type: 'error', title: 'Upload Error', message });
    } finally {
      setCameraUploading(false);
    }
  }, [permit, userId, addToast, handleDocumentUploaded]);

  const handleSignedPdf = useCallback(async (source: PermitDocument, blob: Blob, pageNumber: number) => {
    if (!permit) return;
    const base = source.fileName.replace(/\.pdf$/i, '');
    const safeBase = base || 'document';
    const fileName = `${safeBase}-signed.pdf`;
    try {
      const { storagePath, downloadUrl } = await uploadPdfBlob(userId, permit.id, blob, fileName);
      const newDoc: PermitDocument = {
        id: crypto.randomUUID(),
        fileName,
        fileType: 'signed-pdf',
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        ocrResult: null,
        derivedFromDocumentId: source.id,
      };
      await handleDocumentUploaded(newDoc);
      addToast({
        type: 'success',
        title: 'Signed PDF saved',
        message: `Signature applied on page ${pageNumber}. The new file is in your folder.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload signed PDF';
      addToast({ type: 'error', title: 'Upload Error', message });
    }
  }, [permit, userId, handleDocumentUploaded, addToast]);

  const handleAddCollaborator = useCallback(async () => {
    if (!permit) return;
    const uid = newCollaboratorUid.trim();
    if (!uid) {
      addToast({ type: 'warning', title: 'Missing UID', message: 'Enter a collaborator’s Firebase Auth UID.' });
      return;
    }
    if (uid === userId) {
      addToast({ type: 'warning', title: 'Invalid', message: 'You are already the owner of this permit.' });
      return;
    }
    const ownerId = permit.ownerId || permit.userId;
    const current = permit.sharedWith ?? [];
    if (current.includes(uid)) {
      addToast({ type: 'info', title: 'Already shared', message: 'That user already has access.' });
      return;
    }
    const sharedWith = [...current, uid];
    const changes: Partial<PermitPacket> = {
      sharedWith,
      ownerId,
      userId: permit.userId,
      updatedAt: new Date(),
    };
    updatePermit(permit.id, changes);
    setNewCollaboratorUid('');
    try {
      await patchPermit(APP_ID, userId, permit.id, changes);
      addToast({ type: 'success', title: 'Collaborator added', message: 'They can open this permit from their Flight Deck after signing in.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sharing';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  }, [permit, userId, newCollaboratorUid, updatePermit, addToast]);

  const handleRemoveCollaborator = useCallback(async (uid: string) => {
    if (!permit) return;
    const ownerId = permit.ownerId || permit.userId;
    if (userId !== ownerId) return;
    const sharedWith = (permit.sharedWith ?? []).filter(u => u !== uid);
    const changes: Partial<PermitPacket> = {
      sharedWith,
      ownerId,
      userId: permit.userId,
      updatedAt: new Date(),
    };
    updatePermit(permit.id, changes);
    try {
      await patchPermit(APP_ID, userId, permit.id, changes);
      addToast({ type: 'success', title: 'Access removed', message: 'Collaborator removed from this permit.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sharing';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  }, [permit, userId, updatePermit, addToast]);

  if (!permit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">Permit not found.</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Back to Flight Deck</Link>
      </div>
    );
  }

  const handleRunScan = async () => {
    setScanning(true);

    try {
      // Step 1: Deterministic local compliance checks (always works offline)
      const result = runComplianceChecks(permit);

      // Step 2: AI-derived checks — analyze OCR results already on documents
      const aiChecks = analyzeDocumentOcrResults(permit.documents);
      result.checks.push(...aiChecks);

      // Re-evaluate overall status now that AI checks are included
      const hasFailure = result.checks.some(c => c.status === 'fail');
      const hasWarning = result.checks.some(c => c.status === 'warning');
      result.overallStatus = hasFailure ? 'fail' : hasWarning ? 'warnings' : 'pass';

      const updates = { lastPreFlightScan: result, updatedAt: new Date() };
      updatePermit(permit.id, updates);

      try {
        await patchPermit(APP_ID, userId, permit.id, updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sync scan results';
        addToast({ type: 'error', title: 'Firestore Error', message });
      }

      addToast({
        type: result.overallStatus === 'pass' ? 'success' : result.overallStatus === 'warnings' ? 'warning' : 'error',
        title: `Pre-Flight ${result.overallStatus === 'pass' ? 'Passed' : result.overallStatus === 'warnings' ? 'Warnings Found' : 'Issues Found'}`,
        message: `${result.checks.filter(c => c.status === 'pass').length}/${result.checks.length} checks passed`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed unexpectedly';
      addToast({ type: 'error', title: 'Scan Error', message });
    } finally {
      setScanning(false);
    }
  };

  const handleToggleChecklist = async (definitionId: string) => {
    const updated = permit.checklistItems.map(item =>
      item.definitionId === definitionId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date() : null }
        : item,
    );
    const changes = { checklistItems: updated, updatedAt: new Date() };

    updatePermit(permit.id, changes);

    try {
      await patchPermit(APP_ID, userId, permit.id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync checklist';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  };

  const handleStatusChange = async (newStatus: PermitStatus) => {
    setStatusMenuOpen(false);
    const changes = { status: newStatus, updatedAt: new Date() };

    updatePermit(permit.id, changes);

    try {
      await patchPermit(APP_ID, userId, permit.id, changes);
      addToast({ type: 'success', title: 'Status Updated', message: `Permit is now "${PERMIT_STATUSES.find(s => s.value === newStatus)?.label ?? newStatus}".` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }
  };

  const handleConfirmDelete = async () => {
    closeModal();
    removePermit(permit.id);

    try {
      await deletePermit(APP_ID, userId, permit.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete from cloud';
      addToast({ type: 'error', title: 'Firestore Error', message });
    }

    navigate('/');
  };

  const mobileHome = permit.homeType === 'mobile' ? permit.home as MobileHome : null;
  const modularHome = permit.homeType === 'modular' ? permit.home as ModularHome : null;

  const ownerId = permit.ownerId || permit.userId;
  const isOwner = userId === ownerId;
  const collaborators = permit.sharedWith ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/" className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{permit.siteAddress}</h1>
            <p className="text-sm text-gray-500">{permit.countyName} County · Parcel {permit.parcelId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dropdown — lets the user advance through the permit lifecycle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen(prev => !prev)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <StatusBadge status={permit.status} />
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {statusMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {PERMIT_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={s.value === permit.status}
                    onClick={() => handleStatusChange(s.value as PermitStatus)}
                    className="flex w-full items-center px-3 py-1.5 text-left text-sm transition hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isOwner && (
            <Button variant="ghost" size="sm" onClick={() => openModal(DELETE_PERMIT_MODAL)} aria-label="Delete permit">
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      </div>

      {/* Info grid — editable fields let users fix mistakes inline */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard label="Home Type" value={permit.homeType === 'mobile' ? 'Mobile Home (HUD)' : 'Modular Home (FBC)'} />
        <EditableField
          label="Site Address"
          value={permit.siteAddress}
          onSave={(v) => handleInlineSave({ siteAddress: v })}
          placeholder="123 Main St"
        />
        <EditableField
          label="Parcel ID"
          value={permit.parcelId}
          onSave={(v) => handleInlineSave({ parcelId: v })}
          placeholder="00-0000-000-0000"
        />
        <EditableField
          label="Owner"
          value={permit.owner.name}
          onSave={(v) => handleInlineSave({ owner: { ...permit.owner, name: v } })}
          placeholder="Property owner name"
        />
        <EditableField
          label="Contractor"
          value={permit.contractor.name}
          onSave={(v) => handleInlineSave({ contractor: { ...permit.contractor, name: v } })}
          placeholder="Contractor name"
        />
        <InfoCard label="Serial / VIN" value={permit.home.serialNumber || '—'} />
        <InfoCard label="Year / Make / Model" value={[permit.home.year, permit.home.make, permit.home.model].filter(Boolean).join(' ') || '—'} />
        <InfoCard label="Last Updated" value={formatDate(permit.updatedAt)} />
      </div>

      {/* Zones */}
      <div className="flex flex-wrap items-center gap-3">
        <WindZoneBadge zone={permit.windZoneRequired} />
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          Flood Zone {permit.floodZone}
        </span>
        {permit.elevationCertRequired && (
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            Elevation Certificate Required
          </span>
        )}
      </div>

      {/* Collaboration — shared permit packets (Firestore participants + sharedWith) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <Users size={18} className="text-gray-500" />
          Collaboration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Owner UID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-900">{ownerId}</code>
          {isOwner ? ' (you)' : ''}
        </p>
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Collaborators</p>
          {collaborators.length === 0 ? (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No additional collaborators yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {collaborators.map((uid) => (
                <li key={uid} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700">
                  <code className="truncate text-xs">{uid}</code>
                  {isOwner && (
                    <button
                      type="button"
                      className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      aria-label={`Remove collaborator ${uid}`}
                      onClick={() => void handleRemoveCollaborator(uid)}
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isOwner && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Add collaborator (Firebase Auth UID)"
                value={newCollaboratorUid}
                onChange={(e) => setNewCollaboratorUid(e.target.value)}
                placeholder="Paste the user’s UID from Firebase Console"
              />
            </div>
            <Button type="button" onClick={() => void handleAddCollaborator()}>
              <UserPlus size={16} className="mr-1.5" />
              Add access
            </Button>
          </div>
        )}
        {!isOwner && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Only the owner can add or remove collaborators.
          </p>
        )}
      </div>

      {/* Mobile-home-specific info */}
      {mobileHome && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">HUD Code Details</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <InfoRow label="HUD Label #" value={mobileHome.hudLabelNumber || '—'} />
            <InfoRow label="Installer License (IH#)" value={mobileHome.installerLicenseNumber || '—'} />
            <InfoRow label="Installer Name" value={mobileHome.installerName || '—'} />
            <InfoRow label="Wind Zone Rating" value={`Zone ${mobileHome.windZoneRating}`} />
          </div>
        </div>
      )}

      {/* Modular-home-specific info */}
      {modularHome && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">FBC / Data Plate Details</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <InfoRow label="DBPR License #" value={modularHome.dbprLicenseNumber || '—'} />
            <InfoRow label="Max Floor Load" value={modularHome.dataPlateInfo.maxFloorLoad ? `${modularHome.dataPlateInfo.maxFloorLoad} PSF` : '—'} />
            <InfoRow label="Thermal Zone" value={modularHome.dataPlateInfo.thermalZone || '—'} />
            <InfoRow label="Wind Zone Rating" value={`Zone ${modularHome.windZoneRating}`} />
          </div>
        </div>
      )}

      {/* Compliance — single scan trigger lives inside CompliancePanel */}
      <CompliancePanel permit={permit} onRunScan={handleRunScan} scanning={scanning} />

      {/* Pre-flight report — display-only, no duplicate button */}
      {permit.lastPreFlightScan && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Pre-Flight Report</h3>
          <AiPreFlightReport result={permit.lastPreFlightScan} documents={permit.documents} />
        </div>
      )}

      {/* Checklist */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Permit Checklist</h3>
        {permit.checklistItems.length > 0 ? (
          <DynamicChecklist items={permit.checklistItems} onToggle={handleToggleChecklist} />
        ) : (
          <p className="text-sm text-gray-400 italic">No checklist items assigned.</p>
        )}
      </div>

      {/* Notes — auto-saves on blur so users never lose their annotations */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Notes</h3>
        <Textarea
          value={notesValue}
          onChange={e => setNotesValue(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add internal notes, reminders, or instructions for this permit…"
          rows={4}
        />
        <p className="mt-1.5 text-[11px] text-gray-400">Auto-saves when you click away.</p>
      </div>

      {/* Edit Full Details — opens the wizard pre-filled with this permit */}
      <div className="flex justify-center">
        <Link
          to={`/permits/${permit.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ExternalLink size={15} />
          Edit Full Details in Wizard
        </Link>
      </div>

      {/* Documents — upload zone, camera capture, and folder viewer */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Document Folder</h3>

        <div className="space-y-4 mb-6">
          <DocumentUploadZone
            userId={userId}
            permitId={permit.id}
            onUploadComplete={handleDocumentUploaded}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400 dark:bg-gray-800">or capture with camera</span>
            </div>
          </div>

          <CameraCapture
            onCapture={(file, docType) => {
              setCameraDocType(docType);
              void handleCameraCapture(file, docType);
            }}
            docType={cameraDocType}
            label={cameraUploading ? 'Uploading…' : 'Snap a Document Photo'}
          />
        </div>

        <PermitFolder
          documents={permit.documents}
          onSignedPdfReady={(source, blob, pageNum) => { void handleSignedPdf(source, blob, pageNum); }}
        />
      </div>

      <Modal
        open={activeModal === DELETE_PERMIT_MODAL}
        onClose={closeModal}
        title="Delete permit packet?"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This removes the permit from your Flight Deck. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" type="button" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" type="button" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Inspects documents that already have OCR results and flags any with low
 * extraction confidence so the user knows to double-check them. Also catches
 * NOC documents that Gemini identified as unrecorded.
 *
 * This runs synchronously on data already in the permit — no network call,
 * no Gemini invocation — keeping the scan functional offline.
 */
function analyzeDocumentOcrResults(documents: PermitDocument[]): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const docsWithOcr = documents.filter(d => d.ocrResult !== null);

  if (docsWithOcr.length === 0) return checks;

  for (const doc of docsWithOcr) {
    const ocr = doc.ocrResult!;

    if (ocr.confidence < LOW_CONFIDENCE_THRESHOLD) {
      checks.push({
        id: `ai-confidence-${doc.id}`,
        category: 'ai-review',
        status: ocr.confidence < 0.4 ? 'fail' : 'warning',
        message: `AI flagged "${doc.fileName}" for manual review`,
        detail:
          `OCR confidence: ${Math.round(ocr.confidence * 100)}%. ` +
          'The extracted data may contain errors — please verify the document manually.',
      });
    }
  }

  const nocDocs = docsWithOcr.filter(d => d.fileType === 'noc');
  for (const noc of nocDocs) {
    const fields = noc.ocrResult!.extractedFields;
    const isRecorded = fields['isRecorded'];
    if (isRecorded === 'false' || isRecorded === false as unknown as string) {
      checks.push({
        id: `ai-noc-unrecorded-${noc.id}`,
        category: 'noc',
        status: 'fail',
        message: 'AI detected unrecorded Notice of Commencement',
        detail:
          'The NOC document does not appear to have a county clerk recording stamp. ' +
          'An unrecorded NOC is a compliance issue that must be resolved before submission.',
      });
    }
  }

  return checks;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-900 dark:text-gray-100 truncate">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
