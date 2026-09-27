import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  compact = false,
}) {
  return (
    <div
      className={`text-center flex flex-col items-center justify-center mx-auto ${
        compact ? 'py-8 px-4' : 'py-14 px-6 max-w-sm'
      }`}
    >
      {Icon && (
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-[image:var(--st-gradient)] opacity-25 blur-xl" />
          <div className="relative w-12 h-12 rounded-2xl bg-[var(--st-surface)] border border-[var(--st-border)] shadow-[var(--st-shadow-sm)] text-[var(--st-accent-text)] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      )}
      <h3 className="text-[14px] font-semibold tracking-tight text-[var(--st-text-primary)]">{title}</h3>
      {description && (
        <p className="text-[12.5px] text-[var(--st-text-muted)] mt-1 max-w-xs leading-relaxed">{description}</p>
      )}
      {((actionLabel && onAction) || secondaryAction) && (
        <div className="flex items-center gap-2 mt-5">
          {actionLabel && onAction && (
            <button onClick={onAction} className="st-btn-primary st-btn-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
