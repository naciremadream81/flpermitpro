import type { HomeType, PermitFees, FeeScheduleEntry } from '@/types';
import counties from '@/data/counties.json';

/** Florida's statewide sales-tax rate applied to permit fees. */
const FL_SALES_TAX_RATE = 6;

/**
 * Finds the first fee schedule entry whose description matches a keyword
 * and whose `appliesTo` scope covers the given home type.
 */
function findFee(
  schedule: FeeScheduleEntry[],
  keyword: string,
  homeType: HomeType,
): number {
  const entry = schedule.find(
    (e) =>
      e.description.toLowerCase().includes(keyword) &&
      (e.appliesTo === homeType || e.appliesTo === 'both'),
  );
  return entry?.amount ?? 0;
}

/**
 * Calculates the full fee breakdown for a Florida manufactured-housing permit.
 *
 * Fee resolution works in three steps:
 *  1. Look up the county in our dataset by `countyId`.
 *  2. Search the county's `feeSchedule` array for entries matching "permit",
 *     "impact", and "plan review" (filtered by home type applicability).
 *  3. Apply Florida's 6 % state sales tax to the permit fee specifically,
 *     then sum everything into a total.
 *
 * When a county has no fee schedule data (common — many rural FL counties
 * don't publish machine-readable schedules yet), all amounts default to $0
 * so the UI can still render a clean breakdown for the applicant to fill in.
 */
export function calculateFees(
  countyId: string,
  homeType: HomeType,
  homeValue?: number,
): PermitFees {
  void homeValue;

  const county = (counties as Array<{ id: string; feeSchedule: FeeScheduleEntry[] }>)
    .find((c) => c.id === countyId);

  const schedule = county?.feeSchedule ?? [];

  const permitFee = findFee(schedule, 'permit', homeType);
  const impactFee = findFee(schedule, 'impact', homeType);
  const planReviewFee = findFee(schedule, 'plan review', homeType);

  const salesTaxAmount =
    Math.round(permitFee * (FL_SALES_TAX_RATE / 100) * 100) / 100;

  const totalFees = permitFee + impactFee + planReviewFee + salesTaxAmount;

  return {
    permitFee,
    impactFee,
    planReviewFee,
    salesTaxRate: FL_SALES_TAX_RATE,
    salesTaxAmount,
    totalFees,
  };
}
