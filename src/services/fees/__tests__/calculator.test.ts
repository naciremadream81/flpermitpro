import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FeeScheduleEntry } from '@/types';

/**
 * Mock county dataset injected before the calculator module loads.
 *
 * We provide two entries:
 *  • "miami-dade" — has a full fee schedule so we can verify real math.
 *  • (implicit) any other countyId — won't match, so all fees default to $0.
 */
const MOCK_COUNTIES: Array<{
  id: string;
  feeSchedule: FeeScheduleEntry[];
}> = [
  {
    id: 'miami-dade',
    feeSchedule: [
      { description: 'Mobile Home Permit Fee', amount: 250, unit: 'flat', appliesTo: 'mobile' },
      { description: 'Modular Home Permit Fee', amount: 300, unit: 'flat', appliesTo: 'modular' },
      { description: 'Impact Fee', amount: 1500, unit: 'flat', appliesTo: 'both' },
      { description: 'Plan Review Fee', amount: 75, unit: 'flat', appliesTo: 'both' },
    ],
  },
];

vi.mock('@/data/counties.json', () => ({ default: MOCK_COUNTIES }));

const { calculateFees } = await import('../calculator');

describe('calculateFees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Known county returns correct fee breakdown ──────────────────
  it('returns the correct fee breakdown for a known county (mobile)', () => {
    const result = calculateFees('miami-dade', 'mobile');

    expect(result.permitFee).toBe(250);
    expect(result.impactFee).toBe(1500);
    expect(result.planReviewFee).toBe(75);
  });

  it('returns the correct fee breakdown for a known county (modular)', () => {
    const result = calculateFees('miami-dade', 'modular');

    expect(result.permitFee).toBe(300);
    expect(result.impactFee).toBe(1500);
    expect(result.planReviewFee).toBe(75);
  });

  // ── 2. Unknown county returns all zeros ────────────────────────────
  it('returns all zeros for an unknown county', () => {
    const result = calculateFees('nonexistent-county', 'mobile');

    expect(result.permitFee).toBe(0);
    expect(result.impactFee).toBe(0);
    expect(result.planReviewFee).toBe(0);
    expect(result.salesTaxAmount).toBe(0);
    expect(result.totalFees).toBe(0);
  });

  // ── 3. Sales tax calculated at 6 % of permit fee ──────────────────
  it('applies 6 % sales tax to the permit fee only', () => {
    const result = calculateFees('miami-dade', 'mobile');

    const expectedTax = Math.round(250 * 0.06 * 100) / 100; // $15.00
    expect(result.salesTaxRate).toBe(6);
    expect(result.salesTaxAmount).toBe(expectedTax);
  });

  // ── 4. Total = sum of all fees + tax ───────────────────────────────
  it('total equals the sum of permit + impact + plan review + sales tax', () => {
    const result = calculateFees('miami-dade', 'mobile');

    const expectedTotal =
      result.permitFee +
      result.impactFee +
      result.planReviewFee +
      result.salesTaxAmount;

    expect(result.totalFees).toBe(expectedTotal);
  });

  // ── 5. Both home types work ────────────────────────────────────────
  it('works for mobile home type', () => {
    const result = calculateFees('miami-dade', 'mobile');
    expect(result.permitFee).toBe(250);
  });

  it('works for modular home type', () => {
    const result = calculateFees('miami-dade', 'modular');
    expect(result.permitFee).toBe(300);
  });
});
