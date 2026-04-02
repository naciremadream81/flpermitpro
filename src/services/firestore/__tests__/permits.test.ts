import { describe, it, expect, vi } from 'vitest';

/**
 * Mock every Firebase Firestore import so the module can be loaded without a
 * real Firebase project. We only need `serializePermit` and `deserializePermit`.
 */
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));
vi.mock('@/config/firebase', () => ({ db: {} }));

import { serializePermit, deserializePermit } from '../permits';
import type {
  PermitPacket,
  PartyInfo,
  PermitFees,
  PermitDocument,
  ChecklistItemState,
  PreFlightResult,
  MobileHome,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers — build a complete PermitPacket with real Date instances
// ---------------------------------------------------------------------------

function makeParty(): PartyInfo {
  return { name: '', address: '', city: '', state: 'FL', zip: '', phone: '', email: '' };
}

function makeFees(): PermitFees {
  return { permitFee: 0, impactFee: 0, planReviewFee: 0, salesTaxRate: 0, salesTaxAmount: 0, totalFees: 0 };
}

function makePermit(overrides: Partial<PermitPacket> = {}): PermitPacket {
  const home: MobileHome = {
    homeType: 'mobile',
    year: 2024,
    make: 'Test',
    model: 'T-100',
    serialNumber: 'SN-001',
    propertyClassification: 'personal',
    windZoneRating: 'III',
    hudLabelNumber: 'HUD-001',
    installerLicenseNumber: 'IH-001',
    installerName: 'Installer',
    anchorPattern: 'Diagonal',
    blockingChartRef: '',
  };

  const docUploadedAt = new Date('2025-06-15T10:30:00Z');
  const documents: PermitDocument[] = [
    {
      id: 'doc-1',
      fileName: 'deed.pdf',
      fileType: 'deed',
      storagePath: '/docs/deed.pdf',
      downloadUrl: 'https://example.com/test.pdf',
      uploadedAt: docUploadedAt,
      ocrResult: null,
    },
  ];

  const checklistItems: ChecklistItemState[] = [
    { definitionId: 'cl-1', label: 'Site Plan', completed: true, completedAt: new Date('2025-06-14T09:00:00Z'), notes: '' },
    { definitionId: 'cl-2', label: 'NOC', completed: false, completedAt: null, notes: '' },
  ];

  return {
    id: 'pkt-rt',
    userId: 'user-1',
    ownerId: 'user-1',
    sharedWith: [],
    createdAt: new Date('2025-06-01T00:00:00Z'),
    updatedAt: new Date('2025-06-20T12:00:00Z'),
    status: 'draft',
    homeType: 'mobile',
    home,
    countyId: 'miami-dade',
    countyName: 'Miami-Dade',
    siteAddress: '123 Palm Ave',
    parcelId: '01-2345',
    legalDescription: 'Lot 1',
    windZoneRequired: 'III',
    floodZone: 'X',
    elevationCertRequired: false,
    owner: makeParty(),
    contractor: makeParty(),
    fees: makeFees(),
    documents,
    checklistItems,
    lastPreFlightScan: null,
    notes: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests — round-trip serialization
// ---------------------------------------------------------------------------

describe('Firestore serialization round-trip', () => {
  it('preserves createdAt and updatedAt Date fields', () => {
    const original = makePermit();
    const roundTripped = deserializePermit(
      serializePermit(original) as Record<string, unknown>,
    );

    expect(roundTripped.createdAt).toBeInstanceOf(Date);
    expect(roundTripped.updatedAt).toBeInstanceOf(Date);
    expect(roundTripped.createdAt.toISOString()).toBe(original.createdAt.toISOString());
    expect(roundTripped.updatedAt.toISOString()).toBe(original.updatedAt.toISOString());
  });

  it('preserves document uploadedAt Date fields', () => {
    const original = makePermit();
    const roundTripped = deserializePermit(
      serializePermit(original) as Record<string, unknown>,
    );

    expect(roundTripped.documents[0].uploadedAt).toBeInstanceOf(Date);
    expect(roundTripped.documents[0].uploadedAt.toISOString())
      .toBe(original.documents[0].uploadedAt.toISOString());
  });

  it('keeps checklist completedAt as null when it was null', () => {
    const original = makePermit();
    const roundTripped = deserializePermit(
      serializePermit(original) as Record<string, unknown>,
    );

    const nullItem = roundTripped.checklistItems.find((i) => i.definitionId === 'cl-2');
    expect(nullItem).toBeDefined();
    expect(nullItem!.completedAt).toBeNull();
  });

  it('keeps lastPreFlightScan as null when it was null', () => {
    const original = makePermit({ lastPreFlightScan: null });
    const roundTripped = deserializePermit(
      serializePermit(original) as Record<string, unknown>,
    );

    expect(roundTripped.lastPreFlightScan).toBeNull();
  });

  it('preserves lastPreFlightScan.scannedAt through the round-trip', () => {
    const scan: PreFlightResult = {
      scannedAt: new Date('2025-07-01T08:00:00Z'),
      overallStatus: 'pass',
      checks: [],
    };
    const original = makePermit({ lastPreFlightScan: scan });
    const roundTripped = deserializePermit(
      serializePermit(original) as Record<string, unknown>,
    );

    expect(roundTripped.lastPreFlightScan).not.toBeNull();
    expect(roundTripped.lastPreFlightScan!.scannedAt).toBeInstanceOf(Date);
    expect(roundTripped.lastPreFlightScan!.scannedAt.toISOString())
      .toBe(scan.scannedAt.toISOString());
  });
});
