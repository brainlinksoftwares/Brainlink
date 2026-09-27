import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  footer,
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
    <div className="st-themed fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#07090E]/55 backdrop-blur-md"
        style={{ animation: 'stFadeIn 180ms ease-out' }}
        onClick={onClose}
      />

      <div className="relative min-h-full flex items-center justify-center p-4 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`pointer-events-auto w-full ${maxWidth} overflow-hidden rounded-2xl bg-[var(--st-surface)] text-left border border-[var(--st-border)] shadow-[var(--st-shadow-modal)] my-8`}
          style={{ animation: 'stScaleUp 240ms var(--st-ease)' }}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[var(--st-border-subtle)]">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--st-text-primary)]">{title}</h3>
              {subtitle && <p className="text-[12.5px] text-[var(--st-text-muted)] mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="st-icon-btn -mr-2 -mt-1 w-8 h-8" aria-label="Close dialog">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 max-h-[72vh] overflow-y-auto studio-scrollbar">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[var(--st-surface-subtle)] border-t border-[var(--st-border-subtle)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
