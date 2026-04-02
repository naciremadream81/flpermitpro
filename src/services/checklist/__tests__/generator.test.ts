import { describe, it, expect, vi } from 'vitest';

/**
 * Mock county dataset for the checklist generator.
 *
 * "alachua" has both mobile and modular checklists that overlap with the
 * built-in base/type items (to exercise de-duplication) and add one
 * county-specific entry each.
 */
const MOCK_COUNTIES = [
  {
    id: 'alachua',
    mobileHomeChecklist: [
      'HUD Certification Label (Data Plate)',
      'Installer License (IH) Verification',
      'Site Plan / Survey',
      'Anchor/Blocking Diagram',
      'Foundation Engineering Drawings (if required)',
      'Notice of Commencement (recorded)',
      'Deed or Title',
      'Owner Authorization',
      'DHSMV Form 82040 (Title Application)',
    ],
    modularHomeChecklist: [
      'DBPR Contractor License Verification',
      'Building Permit Application',
      'Site Plan / Survey',
      'Foundation Engineering Drawings',
      'Permanent Foundation Plan',
      'Data Plate Documentation',
      'Notice of Commencement (recorded)',
      'Energy Calculation Report (FBC)',
      'Inspection Schedule',
    ],
  },
];

vi.mock('@/data/counties.json', () => ({ default: MOCK_COUNTIES }));

const { generateChecklist } = await import('../generator');

describe('generateChecklist', () => {
  // ── 1. Mobile home gets HUD-specific items ─────────────────────────
  it('includes HUD-specific items for mobile home type', () => {
    const items = generateChecklist('alachua', 'mobile');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('hud-label');
    expect(ids).toContain('blocking-chart');
    expect(ids).toContain('installer-license');
    expect(ids).toContain('dhsmv-82040');
  });

  // ── 2. Modular home gets DBPR-specific items ───────────────────────
  it('includes DBPR-specific items for modular home type', () => {
    const items = generateChecklist('alachua', 'modular');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('dbpr-license');
    expect(ids).toContain('foundation-plans');
    expect(ids).toContain('building-permit-app');
    expect(ids).toContain('energy-calc');
  });

  // ── 3. Base items present in both home types ───────────────────────
  it('includes base items (site plan, deed, NOC) for mobile', () => {
    const items = generateChecklist('alachua', 'mobile');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('site-plan');
    expect(ids).toContain('deed-or-title');
    expect(ids).toContain('noc');
  });

  it('includes base items (site plan, deed, NOC) for modular', () => {
    const items = generateChecklist('alachua', 'modular');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('site-plan');
    expect(ids).toContain('deed-or-title');
    expect(ids).toContain('noc');
  });

  // ── 4. No duplicate items ─────────────────────────────────────────
  it('contains no duplicate IDs', () => {
    const mobileItems = generateChecklist('alachua', 'mobile');
    const mobileIds = mobileItems.map((i) => i.id);
    expect(new Set(mobileIds).size).toBe(mobileIds.length);

    const modularItems = generateChecklist('alachua', 'modular');
    const modularIds = modularItems.map((i) => i.id);
    expect(new Set(modularIds).size).toBe(modularIds.length);
  });

  // ── 5. Unknown county falls back to base + type items ──────────────
  it('returns base + type items for an unknown county', () => {
    const items = generateChecklist('nonexistent-county', 'mobile');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('site-plan');
    expect(ids).toContain('deed-or-title');
    expect(ids).toContain('noc');
    expect(ids).toContain('hud-label');
    expect(ids).toContain('blocking-chart');
    expect(items.length).toBeGreaterThan(0);
  });

  it('returns base + modular items for an unknown county (modular)', () => {
    const items = generateChecklist('nonexistent-county', 'modular');
    const ids = items.map((i) => i.id);

    expect(ids).toContain('site-plan');
    expect(ids).toContain('dbpr-license');
    expect(ids).toContain('foundation-plans');
    expect(items.length).toBeGreaterThan(0);
  });
});
