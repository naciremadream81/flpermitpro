import type { FloodZone } from '@/types';
import type { ComplianceCheck } from '@/types';

const HIGH_RISK_ZONES: FloodZone[] = ['AE', 'VE', 'A', 'AH', 'AO'];

export function checkFloodZoneCompliance(
  floodZone: FloodZone,
  hasElevationCert: boolean,
): ComplianceCheck {
  if (!HIGH_RISK_ZONES.includes(floodZone)) {
    return {
      id: 'flood-zone-check',
      category: 'flood-zone',
      status: 'pass',
      message: `Flood Zone ${floodZone} does not require special flood provisions.`,
      detail: '',
    };
  }

  if (floodZone === 'VE') {
    return {
      id: 'flood-zone-check',
      category: 'flood-zone',
      status: hasElevationCert ? 'warning' : 'fail',
      message: hasElevationCert
        ? `VE Zone: Elevation Certificate present. Verify BFE compliance and V-zone construction requirements.`
        : `VE Zone: Elevation Certificate REQUIRED. Coastal high hazard area — special foundation and construction requirements apply.`,
      detail: 'VE zones require structures to be elevated on pilings or columns. Manufactured homes may have additional restrictions in VE zones.',
    };
  }

  if (floodZone === 'AE' || floodZone === 'A') {
    return {
      id: 'flood-zone-check',
      category: 'flood-zone',
      status: hasElevationCert ? 'pass' : 'fail',
      message: hasElevationCert
        ? `Flood Zone ${floodZone}: Elevation Certificate present.`
        : `Flood Zone ${floodZone}: Elevation Certificate REQUIRED.`,
      detail: `Properties in Zone ${floodZone} must have the lowest floor elevated to or above the Base Flood Elevation (BFE). An Elevation Certificate is required to document compliance.`,
    };
  }

  return {
    id: 'flood-zone-check',
    category: 'flood-zone',
    status: hasElevationCert ? 'pass' : 'warning',
    message: hasElevationCert
      ? `Flood Zone ${floodZone}: Elevation Certificate present.`
      : `Flood Zone ${floodZone}: Elevation Certificate recommended.`,
    detail: `Zone ${floodZone} may require flood-related documentation depending on the jurisdiction.`,
  };
}
