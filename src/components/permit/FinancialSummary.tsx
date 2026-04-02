import { useMemo } from 'react';
import type { HomeType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { calculateFees } from '@/services/fees/calculator';

interface FinancialSummaryProps {
  countyId: string;
  homeType: HomeType;
  homeValue?: number;
}

/**
 * Displays a real-time permit fee breakdown driven by the fee calculator.
 *
 * Instead of hard-coded inputs, this component receives the county and home
 * type from the parent form, resolves the correct fee schedule automatically,
 * and renders every line item with the Florida 6 % sales-tax calculation.
 */
export function FinancialSummary({
  countyId,
  homeType,
  homeValue,
}: FinancialSummaryProps) {
  const fees = useMemo(
    () => calculateFees(countyId, homeType, homeValue),
    [countyId, homeType, homeValue],
  );

  const lineItems: { label: string; amount: number }[] = [
    { label: 'Permit Fee', amount: fees.permitFee },
    { label: 'Impact Fee', amount: fees.impactFee },
    { label: 'Plan Review Fee', amount: fees.planReviewFee },
    { label: `Sales Tax (${fees.salesTaxRate}%)`, amount: fees.salesTaxAmount },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 space-y-2">
        {lineItems.map((item) => (
          <div
            key={item.label}
            className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span>{item.label}</span>
            <span className="font-mono">{formatCurrency(item.amount)}</span>
          </div>
        ))}

        <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Total Fees
          </span>
          <span className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {formatCurrency(fees.totalFees)}
          </span>
        </div>
      </div>
    </div>
  );
}
