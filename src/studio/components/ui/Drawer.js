import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="st-drawer-overlay st-themed" onClick={onClose}>
      <div
        className={`st-drawer-panel ${width}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        <div className="relative flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--st-border)] bg-[var(--st-surface)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[image:var(--st-gradient)]" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-[var(--st-text-primary)]">{title}</h3>
            {subtitle && <p className="text-[12.5px] text-[var(--st-text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="st-icon-btn -mr-2 w-8 h-8" title="Close (Esc)" aria-label="Close">
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 studio-scrollbar bg-[var(--st-surface-subtle)]">{children}</div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-[var(--st-border)] bg-[var(--st-surface)] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
