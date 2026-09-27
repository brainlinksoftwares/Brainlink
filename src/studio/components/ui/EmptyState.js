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
        compact ? 'py-8 px-4' : 'py-12 px-6 max-w-sm'
      }`}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-[#F6F7F9] dark:bg-[#151923] text-[#626A78] dark:text-[#9AA3B2] flex items-center justify-center mb-3 border border-[#E7E9EE] dark:border-[#222733]">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <h3 className="text-[13px] font-semibold text-[#111318] dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-[12px] text-[#626A78] dark:text-[#9AA3B2] mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-4">
        {actionLabel && onAction && (
          <button onClick={onAction} className="st-btn-primary st-btn-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
