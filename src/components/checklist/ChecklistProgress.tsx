interface ChecklistProgressProps { completed: number; total: number; }

export function ChecklistProgress({ completed, total }: ChecklistProgressProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const color = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-yellow-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">Checklist Progress</span>
        <span className="text-gray-500">{completed}/{total} complete ({pct}%)</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
