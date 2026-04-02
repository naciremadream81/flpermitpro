import { ChecklistItem } from './ChecklistItem';
import { ChecklistProgress } from './ChecklistProgress';
import type { ChecklistItemState } from '@/types';

interface DynamicChecklistProps {
  items: ChecklistItemState[];
  onToggle: (definitionId: string) => void;
}

export function DynamicChecklist({ items, onToggle }: DynamicChecklistProps) {
  const completed = items.filter(i => i.completed).length;

  return (
    <div className="space-y-4">
      <ChecklistProgress completed={completed} total={items.length} />
      <div className="space-y-2">
        {items.map(item => (
          <ChecklistItem key={item.definitionId} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
