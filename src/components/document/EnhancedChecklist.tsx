/**
 * EnhancedChecklist — Checklist with override/waiver capability.
 *
 * Features:
 * - Progress bar + completion stats
 * - Per-item override: mark as "waived" with a reason
 * - Waived items show orange asterisk and strikethrough
 * - Required items distinguished from optional
 * - onToggle, onWaive, onUnwaive callbacks
 *
 * Usage in PermitDetailPage — replace DynamicChecklist with:
 *   <EnhancedChecklist
 *     items={permit.checklistItems}
 *     onToggle={handleToggleChecklist}
 *     onWaive={handleWaiveItem}
 *   />
 */

import { useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, X, ChevronDown, ChevronUp, Slash } from 'lucide-react';
import type { ChecklistItemState } from '@/types';

interface EnhancedChecklistProps {
  items: ChecklistItemState[];
  onToggle: (definitionId: string) => void;
  onWaive?: (definitionId: string, reason: string) => void;
  onUnwaive?: (definitionId: string) => void;
  readOnly?: boolean;
}

interface WaiverFormState {
  definitionId: string;
  reason: string;
}

export function EnhancedChecklist({
  items,
  onToggle,
  onWaive,
  onUnwaive,
  readOnly = false,
}: EnhancedChecklistProps) {
  const [waiverForm, setWaiverForm] = useState<WaiverFormState | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const completed = items.filter(i => i.completed).length;
  const waived = items.filter(i => i.waived).length;
  const total = items.length;
  const effective = completed + waived;
  const pct = total === 0 ? 0 : Math.round((effective / total) * 100);

  const handleWaiveSubmit = (definitionId: string) => {
    if (!waiverForm || !onWaive) return;
    onWaive(definitionId, waiverForm.reason.trim());
    setWaiverForm(null);
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#0F1624', border: '1px solid rgb(255 255 255 / 0.06)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#4A5568', letterSpacing: '0.1em' }}>
                COMPLETED
              </p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 700, color: completed === total ? '#0ECC89' : '#EBF0FA', lineHeight: 1 }}>
                {effective}<span style={{ fontSize: '14px', color: '#4A5568' }}>/{total}</span>
              </p>
            </div>
            {waived > 0 && (
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#4A5568', letterSpacing: '0.1em' }}>
                  WAIVED
                </p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 700, color: '#F4A623', lineHeight: 1 }}>
                  {waived}
                </p>
              </div>
            )}
          </div>
          <div
            className="relative flex items-center justify-center"
            style={{ width: 52, height: 52 }}
          >
            <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={26} cy={26} r={22} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth={3} />
              <circle
                cx={26} cy={26} r={22} fill="none"
                stroke={pct === 100 ? '#0ECC89' : '#F4A623'} strokeWidth={3}
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
              />
            </svg>
            <span
              className="absolute"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                fontWeight: 500,
                color: pct === 100 ? '#0ECC89' : '#F4A623',
              }}
            >
              {pct}%
            </span>
          </div>
        </div>

        {/* Progress track */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgb(255 255 255 / 0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? '#0ECC89'
                : `linear-gradient(90deg, #F4A623 ${Math.max(0, pct - 30)}%, #FFD080 100%)`,
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const isWaived = item.waived ?? false;
          const isComplete = item.completed;
          const isOpenWaiver = waiverForm?.definitionId === item.definitionId;
          const hasNotes = item.notes || item.waivedReason;
          const notesExpanded = expandedNotes.has(item.definitionId);

          return (
            <div
              key={item.definitionId}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                background: isWaived
                  ? 'rgb(244 166 35 / 0.05)'
                  : isComplete
                  ? 'rgb(14 204 137 / 0.05)'
                  : '#111928',
                border: isWaived
                  ? '1px solid rgb(244 166 35 / 0.15)'
                  : isComplete
                  ? '1px solid rgb(14 204 137 / 0.12)'
                  : '1px solid rgb(255 255 255 / 0.05)',
              }}
            >
              <div className="flex items-start gap-3 px-3 py-3">
                {/* Checkbox / waived indicator */}
                <button
                  type="button"
                  disabled={readOnly || isWaived}
                  onClick={() => !isWaived && onToggle(item.definitionId)}
                  className="shrink-0 mt-0.5 transition-all"
                  style={{ opacity: isWaived ? 0.5 : 1 }}
                >
                  {isWaived ? (
                    <Slash size={18} style={{ color: '#F4A623' }} />
                  ) : isComplete ? (
                    <CheckCircle2 size={18} style={{ color: '#0ECC89' }} />
                  ) : (
                    <Circle size={18} style={{ color: '#4A5568' }} />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        color: isWaived ? '#6B7E98' : isComplete ? '#0ECC89' : '#EBF0FA',
                        textDecoration: isWaived ? 'line-through' : 'none',
                        textDecorationColor: '#F4A623',
                      }}
                    >
                      {item.label}
                    </span>
                    {isWaived && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          color: '#F4A623',
                          background: 'rgb(244 166 35 / 0.12)',
                          border: '1px solid rgb(244 166 35 / 0.20)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        WAIVED
                      </span>
                    )}
                  </div>
                  {item.waivedReason && isWaived && (
                    <p className="text-xs mt-0.5 italic" style={{ color: '#6B7E98' }}>
                      Reason: {item.waivedReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!readOnly && (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Notes toggle */}
                    {hasNotes && (
                      <button
                        type="button"
                        onClick={() => toggleNotes(item.definitionId)}
                        className="rounded p-1 transition-colors"
                        style={{ color: '#4A5568' }}
                        title="Toggle notes"
                      >
                        {notesExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}

                    {/* Waive button */}
                    {!isWaived && onWaive && (
                      <button
                        type="button"
                        onClick={() => setWaiverForm(isOpenWaiver ? null : { definitionId: item.definitionId, reason: '' })}
                        className="rounded px-2 py-1 text-xs transition-all"
                        title="Override / waive this requirement"
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: '11px',
                          color: isOpenWaiver ? '#F4A623' : '#4A5568',
                          background: isOpenWaiver ? 'rgb(244 166 35 / 0.10)' : 'transparent',
                          border: isOpenWaiver ? '1px solid rgb(244 166 35 / 0.20)' : '1px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isOpenWaiver) {
                            (e.currentTarget as HTMLButtonElement).style.color = '#F4A623';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgb(244 166 35 / 0.06)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isOpenWaiver) {
                            (e.currentTarget as HTMLButtonElement).style.color = '#4A5568';
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                          }
                        }}
                      >
                        <AlertTriangle size={11} className="inline mr-1" />
                        Override
                      </button>
                    )}

                    {/* Unwaive */}
                    {isWaived && onUnwaive && (
                      <button
                        type="button"
                        onClick={() => onUnwaive(item.definitionId)}
                        className="rounded px-2 py-1 text-xs transition-all"
                        title="Remove override"
                        style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: '#4A5568' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF4B5B'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4A5568'; }}
                      >
                        <X size={11} className="inline mr-1" />
                        Restore
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Notes expansion */}
              {notesExpanded && hasNotes && (
                <div
                  className="px-3 pb-3 animate-pp-fade-in"
                  style={{ borderTop: '1px solid rgb(255 255 255 / 0.04)' }}
                >
                  {item.notes && (
                    <p className="text-xs pt-2" style={{ color: '#6B7E98' }}>
                      <span style={{ color: '#4A5568' }}>Note: </span>{item.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Waiver form */}
              {isOpenWaiver && waiverForm && (
                <div
                  className="px-3 pb-3 animate-pp-fade-in"
                  style={{ borderTop: '1px solid rgb(244 166 35 / 0.12)' }}
                >
                  <p className="text-xs font-medium mt-3 mb-2" style={{ color: '#F4A623' }}>
                    Override Reason
                  </p>
                  <textarea
                    value={waiverForm.reason}
                    onChange={e => setWaiverForm({ ...waiverForm, reason: e.target.value })}
                    placeholder="Explain why this requirement is being waived or is not applicable…"
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-xs resize-none outline-none"
                    style={{
                      background: 'rgb(255 255 255 / 0.04)',
                      border: '1px solid rgb(244 166 35 / 0.20)',
                      color: '#EBF0FA',
                      fontFamily: "'Figtree', sans-serif",
                    }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleWaiveSubmit(item.definitionId)}
                      disabled={!waiverForm.reason.trim()}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                      style={{
                        background: waiverForm.reason.trim() ? 'rgb(244 166 35 / 0.15)' : 'rgb(255 255 255 / 0.04)',
                        color: waiverForm.reason.trim() ? '#F4A623' : '#4A5568',
                        border: waiverForm.reason.trim() ? '1px solid rgb(244 166 35 / 0.28)' : '1px solid rgb(255 255 255 / 0.06)',
                        cursor: waiverForm.reason.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Apply Override
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiverForm(null)}
                      className="rounded-lg px-3 py-1.5 text-xs transition-all"
                      style={{ color: '#6B7E98', background: 'transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EBF0FA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6B7E98'; }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
