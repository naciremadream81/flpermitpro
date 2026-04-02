import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface EditableFieldProps {
  /** The label shown above the value (e.g. "Site Address"). */
  label: string;
  /** The current persisted value. */
  value: string;
  /**
   * Called when the user confirms a new value. The parent is responsible for
   * persisting the change (optimistic store update + Firestore patch).
   * Return value or a resolved promise signals "done"; a rejected promise
   * will keep the field in edit mode so the user can retry.
   */
  onSave: (newValue: string) => void | Promise<void>;
  /** Render as a text input or a select dropdown. Defaults to 'text'. */
  type?: 'text' | 'select';
  /** Required when type is 'select'. */
  options?: SelectOption[];
  /** Placeholder shown when editing in text mode. */
  placeholder?: string;
}

/**
 * A read-only display that flips to an inline editor on click.
 *
 * Think of it like a museum placard: most of the time you just read the
 * information, but tap the pencil and you can fix a typo right there —
 * no need to rebuild the entire exhibit.
 *
 * Keyboard shortcuts:
 *  - Enter  → save
 *  - Escape → cancel (revert to the original value)
 */
export function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Keep the draft in sync when the parent value changes externally
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  // Auto-focus the input/select when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
      selectRef.current?.focus();
    }
  }, [editing]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      // Stay in edit mode so the user can retry
    } finally {
      setSaving(false);
    }
  }, [draft, value, onSave]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      cancel();
    }
  };

  // For select fields, save immediately when the selection changes
  const handleSelectChange = (newValue: string) => {
    setDraft(newValue);
    setSaving(true);
    Promise.resolve(onSave(newValue))
      .then(() => setEditing(false))
      .catch(() => {/* stay in edit mode */})
      .finally(() => setSaving(false));
  };

  /* ── Display mode ── */
  if (!editing) {
    const displayValue = type === 'select'
      ? options.find(o => o.value === value)?.label ?? value
      : value;

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="group mt-1 flex w-full items-center justify-between gap-2 text-left"
          aria-label={`Edit ${label}`}
        >
          <span className="font-medium text-gray-900 truncate dark:text-gray-100">
            {displayValue || '—'}
          </span>
          <Pencil
            size={14}
            className="shrink-0 text-gray-300 transition-colors group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400"
          />
        </button>
      </div>
    );
  }

  /* ── Edit mode ── */
  return (
    <div className="rounded-lg border-2 border-blue-500 bg-white p-4 dark:bg-gray-800">
      <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">{label}</p>

      {type === 'text' ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          disabled={saving}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      ) : (
        <select
          ref={selectRef}
          value={draft}
          onChange={e => handleSelectChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {type === 'text' && (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Check size={12} /> Save
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X size={12} /> Cancel
          </button>
          <span className="ml-auto text-[10px] text-gray-400">Enter to save · Esc to cancel</span>
        </div>
      )}
    </div>
  );
}
