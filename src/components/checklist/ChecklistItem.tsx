import { Check } from 'lucide-react';
import type { ChecklistItemState } from '@/types';
import { formatDate } from '@/utils/formatters';

interface ChecklistItemProps {
  item: ChecklistItemState;
  onToggle: (definitionId: string) => void;
}

export function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <div
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${item.completed ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-200 bg-white hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800'}`}
      onClick={() => onToggle(item.definitionId)}
    >
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${item.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
        {item.completed && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.completed ? 'text-green-800 line-through dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
          {item.label}
        </p>
        {item.completed && item.completedAt && (
          <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">Completed {formatDate(item.completedAt)}</p>
        )}
        {item.notes && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.notes}</p>}
      </div>
    </div>
  );
}
