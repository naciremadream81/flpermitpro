import type { HomeType, ChecklistItemDefinition } from '@/types';
import counties from '@/data/counties.json';

/**
 * Builds a unique, URL-safe ID from a human-readable label.
 * Strips non-alphanumeric characters and collapses whitespace into hyphens.
 */
function labelToId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Assigns a category based on keywords found in the checklist label.
 * County checklists are free-text strings, so we infer semantics here.
 */
function inferCategory(label: string): ChecklistItemDefinition['category'] {
  const lower = label.toLowerCase();
  if (lower.includes('inspection') || lower.includes('schedule')) return 'inspections';
  if (lower.includes('permit') || lower.includes('application')) return 'permits';
  if (lower.includes('approval') || lower.includes('verification')) return 'approvals';
  return 'documents';
}

// ── Base checklist items required for EVERY Florida manufactured-home permit ──
const BASE_ITEMS: ChecklistItemDefinition[] = [
  {
    id: 'site-plan',
    label: 'Site Plan / Survey',
    description: 'A scaled site plan showing setbacks, easements, and the proposed home placement.',
    required: true,
    category: 'documents',
  },
  {
    id: 'deed-or-title',
    label: 'Deed or Title',
    description: 'Proof of property ownership or authorization from the property owner.',
    required: true,
    category: 'documents',
  },
  {
    id: 'noc',
    label: 'Notice of Commencement (recorded)',
    description: 'A recorded Notice of Commencement filed with the county clerk before work begins.',
    required: true,
    category: 'documents',
  },
  {
    id: 'owner-authorization',
    label: 'Owner Authorization',
    description: 'Written authorization from the property owner permitting the installation.',
    required: true,
    category: 'approvals',
  },
];

// ── Additional items specific to HUD-code mobile/manufactured homes ──────────
const MOBILE_ITEMS: ChecklistItemDefinition[] = [
  {
    id: 'hud-label',
    label: 'HUD Certification Label (Data Plate)',
    description: 'The federal HUD certification label affixed to the home, proving code compliance.',
    required: true,
    category: 'documents',
  },
  {
    id: 'blocking-chart',
    label: 'Anchor/Blocking Diagram',
    description: 'Engineering diagram showing tie-down anchors and blocking layout per Florida standards.',
    required: true,
    category: 'documents',
  },
  {
    id: 'installer-license',
    label: 'Installer License (IH) Verification',
    description: 'Proof that the installer holds a valid Florida IH license issued by DBPR.',
    required: true,
    category: 'approvals',
  },
  {
    id: 'dhsmv-82040',
    label: 'DHSMV Form 82040 (Title Application)',
    description: 'Florida DHSMV title application form for the manufactured home.',
    required: true,
    category: 'documents',
  },
];

// ── Additional items specific to modular homes (built to FBC) ────────────────
const MODULAR_ITEMS: ChecklistItemDefinition[] = [
  {
    id: 'dbpr-license',
    label: 'DBPR Contractor License Verification',
    description: 'Proof that the contractor holds a valid CBC, CGC, or CRC license from DBPR.',
    required: true,
    category: 'approvals',
  },
  {
    id: 'data-plate-docs',
    label: 'Data Plate Documentation',
    description: 'Manufacturer data plate showing floor load, thermal zone, and construction details.',
    required: true,
    category: 'documents',
  },
  {
    id: 'foundation-plans',
    label: 'Permanent Foundation Plan',
    description: 'Engineered foundation plan compliant with Florida Building Code.',
    required: true,
    category: 'documents',
  },
  {
    id: 'building-permit-app',
    label: 'Building Permit Application',
    description: 'Completed building permit application form for the county.',
    required: true,
    category: 'permits',
  },
  {
    id: 'energy-calc',
    label: 'Energy Calculation Report (FBC)',
    description: 'Energy compliance report per the Florida Building Code energy conservation chapter.',
    required: true,
    category: 'documents',
  },
];

/**
 * Generates a complete permit checklist for a given county and home type.
 *
 * The list is assembled in three layers:
 *  1. **Base items** — universal to all FL manufactured-housing permits.
 *  2. **Home-type items** — mobile (HUD-code) or modular (FBC) specifics.
 *  3. **County-specific items** — any additional documents the county requires
 *     that aren't already covered by the first two layers.
 *
 * Duplicate items (matched by id) are automatically de-duplicated so that
 * county overrides don't produce a redundant list.
 */
export function generateChecklist(
  countyId: string,
  homeType: HomeType,
): ChecklistItemDefinition[] {
  const county = (counties as Array<{ id: string; mobileHomeChecklist: string[]; modularHomeChecklist: string[] }>)
    .find((c) => c.id === countyId);

  // Start with base items every permit needs
  const items: ChecklistItemDefinition[] = [...BASE_ITEMS];

  // Layer on home-type–specific items
  if (homeType === 'mobile') {
    items.push(...MOBILE_ITEMS);
  } else {
    items.push(...MODULAR_ITEMS);
  }

  // Layer on county-specific items (if the county exists in our data)
  if (county) {
    const countyList =
      homeType === 'mobile'
        ? county.mobileHomeChecklist
        : county.modularHomeChecklist;

    const existingIds = new Set(items.map((item) => item.id));

    for (const label of countyList) {
      const id = labelToId(label);
      if (existingIds.has(id)) continue;

      items.push({
        id,
        label,
        description: `County-required item: ${label}`,
        required: true,
        category: inferCategory(label),
      });
      existingIds.add(id);
    }
  }

  return items;
}
