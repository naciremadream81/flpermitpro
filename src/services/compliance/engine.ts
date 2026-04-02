import type {
  PermitPacket,
  ComplianceCheck,
  PreFlightResult,
  MobileHome,
  ModularHome,
} from '@/types';
import { checkWindZoneCompliance } from './windZone';
import { checkFloodZoneCompliance } from './floodZone';
import { isValidInstallerLicense, isValidDbprLicense } from '@/utils/validators';

/** Florida minimum floor live-load rating in lbs/ft² per FBC R301.5 */
const FL_MIN_FLOOR_LOAD_PSF = 40;

export function runComplianceChecks(permit: PermitPacket): PreFlightResult {
  const checks: ComplianceCheck[] = [];

  // ── Wind zone check ───────────────────────────────────────────────
  checks.push(
    checkWindZoneCompliance(
      permit.home.windZoneRating,
      permit.windZoneRequired,
      permit.countyName,
    ),
  );

  // ── Flood zone check ──────────────────────────────────────────────
  checks.push(
    checkFloodZoneCompliance(
      permit.floodZone,
      permit.elevationCertRequired
        ? permit.documents.some((d) => d.fileType === 'elevation-cert')
        : true,
    ),
  );

  // ── Mobile home–specific checks ───────────────────────────────────
  if (permit.homeType === 'mobile') {
    const home = permit.home as MobileHome;

    if (!home.hudLabelNumber) {
      checks.push({
        id: 'hud-label-check',
        category: 'document',
        status: 'fail',
        message: 'Missing HUD Label/Certification number.',
        detail: 'All HUD-code manufactured homes must have a valid HUD certification label.',
      });
    }

    if (!home.installerLicenseNumber) {
      checks.push({
        id: 'installer-license-check',
        category: 'license',
        status: 'fail',
        message: 'Missing Installer License (IH) number.',
        detail: 'Florida requires a licensed installer (IH license) for manufactured home installation.',
      });
    } else if (!isValidInstallerLicense(home.installerLicenseNumber)) {
      checks.push({
        id: 'installer-license-format',
        category: 'license',
        status: 'warning',
        message: 'Installer License format appears invalid.',
        detail:
          `Expected format: "IH" followed by exactly 5 digits (e.g., IH12345). ` +
          `Received: "${home.installerLicenseNumber}". Please verify the license number.`,
      });
    }
  }

  // ── Modular home–specific checks ──────────────────────────────────
  if (permit.homeType === 'modular') {
    const home = permit.home as ModularHome;

    if (!home.dbprLicenseNumber) {
      checks.push({
        id: 'contractor-license-check',
        category: 'license',
        status: 'fail',
        message: 'Missing DBPR contractor license number.',
        detail: 'Modular home installation requires a licensed contractor with valid DBPR credentials.',
      });
    } else if (!isValidDbprLicense(home.dbprLicenseNumber)) {
      checks.push({
        id: 'dbpr-license-format',
        category: 'license',
        status: 'warning',
        message: 'DBPR license format appears invalid.',
        detail:
          `Expected format: CBC, CGC, or CRC prefix followed by digits (e.g., CBC1234567). ` +
          `Received: "${home.dbprLicenseNumber}". Please verify the license number.`,
      });
    }

    // Data plate — floor load rating (Ticket 3.1)
    if (
      home.dataPlateInfo.maxFloorLoad === null ||
      home.dataPlateInfo.maxFloorLoad < FL_MIN_FLOOR_LOAD_PSF
    ) {
      checks.push({
        id: 'floor-load-check',
        category: 'data-plate',
        status: 'fail',
        message: `Floor load rating does not meet Florida's ${FL_MIN_FLOOR_LOAD_PSF} lbs/ft² minimum.`,
        detail:
          home.dataPlateInfo.maxFloorLoad === null
            ? 'The data plate is missing the maximum floor load value. Florida Building Code requires a minimum live-load rating of 40 lbs/ft².'
            : `Data plate shows ${home.dataPlateInfo.maxFloorLoad} lbs/ft², which is below the Florida minimum of ${FL_MIN_FLOOR_LOAD_PSF} lbs/ft² (FBC R301.5).`,
      });
    }

    // Data plate — thermal zone (Ticket 3.1)
    if (!home.dataPlateInfo.thermalZone.trim()) {
      checks.push({
        id: 'thermal-zone-check',
        category: 'data-plate',
        status: 'warning',
        message: 'Thermal zone is not specified on the data plate.',
        detail:
          'The data plate should include a thermal zone designation. This information helps verify energy compliance with Florida standards.',
      });
    }
  }

  // ── NOC check ─────────────────────────────────────────────────────
  const nocDoc = permit.documents.find((d) => d.fileType === 'noc');
  if (!nocDoc) {
    checks.push({
      id: 'noc-check',
      category: 'noc',
      status: 'warning',
      message: 'Notice of Commencement not uploaded.',
      detail: 'A recorded Notice of Commencement should be included in the permit packet.',
    });
  }

  // ── Determine overall status ──────────────────────────────────────
  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warning');

  return {
    scannedAt: new Date(),
    overallStatus: hasFailure ? 'fail' : hasWarning ? 'warnings' : 'pass',
    checks,
  };
}
