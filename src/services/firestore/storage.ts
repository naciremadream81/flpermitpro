import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';
import type { DocumentType } from '@/types';

export async function uploadDocument(
  userId: string,
  permitId: string,
  file: File,
  docType: DocumentType,
): Promise<{ storagePath: string; downloadUrl: string }> {
  const ext = file.name.split('.').pop() ?? 'bin';
  // Must match `storage.rules`: `permits/{userId}/**`
  const storagePath = `permits/${userId}/${permitId}/${docType}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadUrl = await getDownloadURL(storageRef);
  return { storagePath, downloadUrl };
}

export async function uploadPdfBlob(
  userId: string,
  permitId: string,
  blob: Blob,
  fileName: string,
): Promise<{ storagePath: string; downloadUrl: string }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `permits/${userId}/${permitId}/signed-${Date.now()}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
  const downloadUrl = await getDownloadURL(storageRef);
  return { storagePath, downloadUrl };
}

/**
 * Resolve a Firebase Storage path into a fetchable download URL.
 * Used for legacy PermitDocuments that were stored before the
 * `downloadUrl` field was added to the PermitDocument interface.
 */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

export async function deleteDocument(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
