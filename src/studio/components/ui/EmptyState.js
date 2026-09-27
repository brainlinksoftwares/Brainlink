import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}) {
  return (
    <div className="st-card p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6">
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-2.5 mt-5">
        {actionLabel && onAction && (
          <button onClick={onAction} className="st-btn-primary">
            <Plus className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
