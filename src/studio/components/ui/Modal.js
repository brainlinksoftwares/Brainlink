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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${maxWidth} transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-800 my-8 animate-fadeIn`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 max-h-[75vh] overflow-y-auto studio-scrollbar">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
