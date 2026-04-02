import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { PermitPacket, PermitDocument, ChecklistItemState, PreFlightResult } from '@/types';

const permitsCol = (appId: string) =>
  collection(db, 'artifacts', appId, 'permits');

const permitDoc = (appId: string, permitId: string) =>
  doc(db, 'artifacts', appId, 'permits', permitId);

export async function savePermit(appId: string, userId: string, permit: PermitPacket): Promise<void> {
  // userId is the owner id for back-compat
  const canonical: PermitPacket = {
    ...permit,
    userId,
    ownerId: permit.ownerId || userId,
    sharedWith: permit.sharedWith ?? [],
  };
  await setDoc(permitDoc(appId, canonical.id), serializePermit(canonical));
}

export async function patchPermit(appId: string, _userId: string, id: string, updates: Partial<PermitPacket>): Promise<void> {
  // Optimistic UI writes often pass Date objects; Firestore needs ISO strings for our schema.
  const patch = serializePermitPatch({
    ...updates,
    updatedAt: new Date(),
  });
  await updateDoc(permitDoc(appId, id), patch);
}

export async function deletePermit(appId: string, _userId: string, id: string): Promise<void> {
  await deleteDoc(permitDoc(appId, id));
}

export function subscribePermits(
  appId: string,
  userId: string,
  onUpdate: (permits: PermitPacket[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  // Shared permits are queried by participant membership.
  // We store `participants` as an array to support array-contains queries.
  const q = query(
    permitsCol(appId),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => {
      const permits = snap.docs.map(d => deserializePermit(d.data() as Record<string, unknown>));
      onUpdate(permits);
    },
    (err) => {
      onError?.(err);
    },
  );
}

// Firestore cannot store Date objects directly — convert to ISO strings
export function serializePermit(p: PermitPacket): Record<string, unknown> {
  return {
    ...p,
    ownerId: p.ownerId ?? p.userId,
    sharedWith: p.sharedWith ?? [],
    participants: Array.from(new Set([p.ownerId ?? p.userId, ...(p.sharedWith ?? [])])),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    documents: p.documents.map(d => ({
      ...d,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
    checklistItems: p.checklistItems.map(i => ({
      ...i,
      completedAt: i.completedAt ? i.completedAt.toISOString() : null,
    })),
    lastPreFlightScan: p.lastPreFlightScan ? {
      ...p.lastPreFlightScan,
      scannedAt: p.lastPreFlightScan.scannedAt.toISOString(),
    } : null,
  };
}

export function deserializePermit(d: Record<string, unknown>): PermitPacket {
  const ownerId = d.ownerId as string | undefined;
  const sharedWith = (d.sharedWith as string[] | undefined) ?? [];
  return {
    ...(d as unknown as PermitPacket),
    userId: (d.userId as string) ?? (ownerId ?? ''),
    ownerId: ownerId ?? (d.userId as string) ?? '',
    sharedWith,
    createdAt: new Date(d.createdAt as string),
    updatedAt: new Date(d.updatedAt as string),
    documents: ((d.documents as unknown[]) ?? []).map((doc) => {
      const dd = doc as Record<string, unknown>;
      return { ...(dd as unknown as import('@/types').PermitDocument), uploadedAt: new Date(dd.uploadedAt as string) };
    }),
    checklistItems: ((d.checklistItems as unknown[]) ?? []).map((item) => {
      const ci = item as Record<string, unknown>;
      return { ...(ci as unknown as import('@/types').ChecklistItemState), completedAt: ci.completedAt ? new Date(ci.completedAt as string) : null };
    }),
    lastPreFlightScan: d.lastPreFlightScan ? {
      ...(d.lastPreFlightScan as unknown as import('@/types').PreFlightResult),
      scannedAt: new Date((d.lastPreFlightScan as Record<string, unknown>).scannedAt as string),
    } : null,
  };
}

function serializePermitPatch(updates: Partial<PermitPacket>): Record<string, unknown> {
  const patch: Record<string, unknown> = { ...updates };

  if (updates.createdAt instanceof Date) patch.createdAt = updates.createdAt.toISOString();
  if (updates.updatedAt instanceof Date) patch.updatedAt = updates.updatedAt.toISOString();

  if (updates.documents) {
    patch.documents = updates.documents.map((d: PermitDocument) => ({
      ...d,
      uploadedAt: d.uploadedAt instanceof Date ? d.uploadedAt.toISOString() : d.uploadedAt,
    }));
  }

  if (updates.checklistItems) {
    patch.checklistItems = updates.checklistItems.map((i: ChecklistItemState) => ({
      ...i,
      completedAt: i.completedAt instanceof Date ? i.completedAt.toISOString() : i.completedAt,
    }));
  }

  if (updates.lastPreFlightScan) {
    const p = updates.lastPreFlightScan as PreFlightResult;
    patch.lastPreFlightScan = {
      ...p,
      scannedAt: p.scannedAt instanceof Date ? p.scannedAt.toISOString() : p.scannedAt,
    };
  }

  if (typeof updates.ownerId === 'string') patch.ownerId = updates.ownerId;
  if (Array.isArray(updates.sharedWith)) {
    patch.sharedWith = updates.sharedWith;
    const owner = (updates.ownerId as string | undefined)
      ?? (updates.userId as string | undefined);
    patch.participants = Array.from(new Set([owner, ...updates.sharedWith].filter(Boolean) as string[]));
  }

  return patch;
}
