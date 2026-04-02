import type { WindZone } from '@/types';
import type { ComplianceCheck } from '@/types';

const ZONE_STRENGTH: Record<WindZone, number> = { 'I': 1, 'II': 2, 'III': 3 };

export function checkWindZoneCompliance(
  homeWindZone: WindZone,
  countyWindZone: WindZone,
  countyName: string,
): ComplianceCheck {
  const homeStrength = ZONE_STRENGTH[homeWindZone];
  const requiredStrength = ZONE_STRENGTH[countyWindZone];

  if (homeStrength >= requiredStrength) {
    return {
      id: 'wind-zone-check',
      category: 'wind-zone',
      status: 'pass',
      message: `Home is rated for Wind Zone ${homeWindZone}, meets ${countyName} requirement (Zone ${countyWindZone}).`,
      detail: '',
    };
  }

  return {
    id: 'wind-zone-check',
    category: 'wind-zone',
    status: 'fail',
    message: `Wind Zone mismatch: Home is rated Zone ${homeWindZone}, but ${countyName} requires Zone ${countyWindZone}.`,
    detail: `This home cannot be installed in ${countyName} without upgrades. A Zone ${homeWindZone} home does not meet the Zone ${countyWindZone} wind resistance requirements for this county.`,
  };
}
