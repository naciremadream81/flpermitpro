import { describe, it, expect } from 'vitest';
import { runComplianceChecks } from '../engine';
import type {
  PermitPacket,
  PartyInfo,
  PermitFees,
  PermitDocument,
  ChecklistItemState,
  MobileHome,
  ModularHome,
} from '@/types';

/**
 * Creates a minimal PartyInfo stub so every required field is populated.
 */
function makeParty(overrides: Partial<PartyInfo> = {}): PartyInfo {
  return {
    name: '', address: '', city: '', state: 'FL',
    zip: '', phone: '', email: '',
    ...overrides,
  };
}

/**
 * Creates a zero-value PermitFees stub.
 */
function makeFees(overrides: Partial<PermitFees> = {}): PermitFees {
  return {
    permitFee: 0, impactFee: 0, planReviewFee: 0,
    salesTaxRate: 0, salesTaxAmount: 0, totalFees: 0,
    ...overrides,
  };
}

/**
 * Builds a fully-valid mobile-home PermitPacket with sensible defaults.
 * Override any field via the `overrides` parameter.
 */
function makeMobilePermit(
  overrides: Partial<PermitPacket> = {},
  homeOverrides: Partial<MobileHome> = {},
): PermitPacket {
  const home: MobileHome = {
    homeType: 'mobile',
    year: 2024,
    make: 'Palm Harbor',
    model: 'Siesta Key II',
    serialNumber: 'PH1234567',
    propertyClassification: 'personal',
    windZoneRating: 'III',
    hudLabelNumber: 'FLA-123456',
    installerLicenseNumber: 'IH12345',
    installerName: 'Test Installer',
    anchorPattern: 'Diagonal',
    blockingChartRef: '',
    ...homeOverrides,
  };

  return {
    id: 'pkt-1',
    userId: 'user-1',
    ownerId: 'user-1',
    sharedWith: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
    homeType: 'mobile',
    home,
    countyId: 'miami-dade',
    countyName: 'Miami-Dade',
    siteAddress: '123 Palm Ave',
    parcelId: '01-2345-678-9012',
    legalDescription: 'Lot 1 Block 2',
    windZoneRequired: 'III',
    floodZone: 'X',
    elevationCertRequired: false,
    owner: makeParty(),
    contractor: makeParty(),
    fees: makeFees(),
    documents: [
      {
        id: 'doc-noc',
        fileName: 'noc.pdf',
        fileType: 'noc',
        storagePath: '/docs/noc.pdf',
        downloadUrl: '',
        uploadedAt: new Date(),
        ocrResult: null,
      },
    ] satisfies PermitDocument[],
    checklistItems: [] as ChecklistItemState[],
    lastPreFlightScan: null,
    notes: '',
    ...overrides,
  };
}

/**
 * Builds a fully-valid modular-home PermitPacket with sensible defaults.
 */
function makeModularPermit(
  overrides: Partial<PermitPacket> = {},
  homeOverrides: Partial<ModularHome> = {},
): PermitPacket {
  const home: ModularHome = {
    homeType: 'modular',
    year: 2024,
    make: 'Jacobsen',
    model: 'Imperial',
    serialNumber: 'JAC-7890',
    propertyClassification: 'real',
    windZoneRating: 'III',
    dataPlateInfo: { manufacturer: 'Jacobsen', maxFloorLoad: 40, thermalZone: '2' },
    foundationPlanRef: '',
    dbprLicenseNumber: 'CBC1234567',
    ...homeOverrides,
  };

  return {
    id: 'pkt-2',
    userId: 'user-1',
    ownerId: 'user-1',
    sharedWith: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
    homeType: 'modular',
    home,
    countyId: 'broward',
    countyName: 'Broward',
    siteAddress: '456 Ocean Blvd',
    parcelId: '11-2345-678-0000',
    legalDescription: 'Lot 5 Block 10',
    windZoneRequired: 'III',
    floodZone: 'X',
    elevationCertRequired: false,
    owner: makeParty(),
    contractor: makeParty(),
    fees: makeFees(),
    documents: [
      {
        id: 'doc-noc',
        fileName: 'noc.pdf',
        fileType: 'noc',
        storagePath: '/docs/noc.pdf',
        downloadUrl: '',
        uploadedAt: new Date(),
        ocrResult: null,
      },
    ] satisfies PermitDocument[],
    checklistItems: [] as ChecklistItemState[],
    lastPreFlightScan: null,
    notes: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('runComplianceChecks', () => {
  it('returns fail when a mobile home is missing its HUD label', () => {
    const permit = makeMobilePermit({}, { hudLabelNumber: '' });
    const result = runComplianceChecks(permit);

    const hudCheck = result.checks.find((c) => c.id === 'hud-label-check');
    expect(hudCheck).toBeDefined();
    expect(hudCheck!.status).toBe('fail');
  });

  it('returns fail when a mobile home is missing the installer license', () => {
    const permit = makeMobilePermit({}, { installerLicenseNumber: '' });
    const result = runComplianceChecks(permit);

    const licCheck = result.checks.find((c) => c.id === 'installer-license-check');
    expect(licCheck).toBeDefined();
    expect(licCheck!.status).toBe('fail');
  });

  it('returns fail when a modular home is missing the DBPR license', () => {
    const permit = makeModularPermit({}, { dbprLicenseNumber: '' });
    const result = runComplianceChecks(permit);

    const licCheck = result.checks.find((c) => c.id === 'contractor-license-check');
    expect(licCheck).toBeDefined();
    expect(licCheck!.status).toBe('fail');
  });

  it('returns warning (not fail) when the NOC document is missing', () => {
    const permit = makeMobilePermit({ documents: [] });
    const result = runComplianceChecks(permit);

    const nocCheck = result.checks.find((c) => c.id === 'noc-check');
    expect(nocCheck).toBeDefined();
    expect(nocCheck!.status).toBe('warning');
  });

  it('reports overallStatus "pass" when every check passes', () => {
    const permit = makeMobilePermit();
    const result = runComplianceChecks(permit);

    expect(result.overallStatus).toBe('pass');
    expect(result.checks.every((c) => c.status === 'pass')).toBe(true);
  });

  it('reports overallStatus "warnings" for a mix of pass and warning', () => {
    // Remove NOC doc so the engine produces a warning, but keep everything else valid
    const permit = makeMobilePermit({ documents: [] });
    const result = runComplianceChecks(permit);

    expect(result.overallStatus).toBe('warnings');
  });

  it('reports overallStatus "fail" when any check fails', () => {
    const permit = makeMobilePermit(
      { documents: [] },
      { hudLabelNumber: '' },
    );
    const result = runComplianceChecks(permit);

    expect(result.overallStatus).toBe('fail');
  });
});
