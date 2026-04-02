import type { County } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface FeeScheduleProps { county: County; }

export function FeeSchedule({ county }: FeeScheduleProps) {
  if (county.feeSchedule.length === 0) {
    return <p className="text-sm text-gray-500 italic">Fee schedule not available — contact the building department.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">Amount</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Applies To</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {county.feeSchedule.map((fee, i) => (
            <tr key={i} className="bg-white dark:bg-gray-800">
              <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{fee.description}</td>
              <td className="px-4 py-2 text-right font-mono text-gray-900 dark:text-gray-100">
                {fee.unit === 'flat' && formatCurrency(fee.amount)}
                {fee.unit === 'per-sqft' && `${formatCurrency(fee.amount)}/sq ft`}
                {fee.unit === 'percentage' && `${fee.amount}%`}
              </td>
              <td className="px-4 py-2 capitalize text-gray-600 dark:text-gray-400">{fee.appliesTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
