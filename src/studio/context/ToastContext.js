import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: { Icon: CheckCircle2, tone: { bar: 'bg-emerald-500', chip: 'emerald' } },
  error: { Icon: AlertCircle, tone: { bar: 'bg-rose-500', chip: 'rose' } },
  warning: { Icon: AlertTriangle, tone: { bar: 'bg-amber-500', chip: 'amber' } },
  info: { Icon: Info, tone: { bar: 'bg-[#3B5BFF]', chip: 'blue' } },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Stable identity: pages list `toast` in effect/callback deps.
  const toast = useMemo(
    () => ({
      success: (msg, dur) => addToast(msg, 'success', dur),
      error: (msg, dur) => addToast(msg, 'error', dur),
      info: (msg, dur) => addToast(msg, 'info', dur),
      warning: (msg, dur) => addToast(msg, 'warning', dur),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="st-themed fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 w-[calc(100vw-2.5rem)] max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { Icon, tone } = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto relative overflow-hidden flex items-start gap-3 py-3 pl-4 pr-3 rounded-xl bg-[var(--st-surface-elevated)] border border-[var(--st-border)] shadow-[var(--st-shadow-lg)]"
              style={{ animation: 'stToastIn 260ms var(--st-ease)', fontFamily: 'var(--font-sans)' }}
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              <span className={`absolute left-0 inset-y-0 w-[3px] ${tone.bar}`} />
              <span className={`st-icon-chip w-7 h-7 rounded-lg st-tone-${tone.chip}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 pt-1 text-[13px] font-medium leading-snug text-[var(--st-text-primary)]">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-md bg-transparent border-0 cursor-pointer text-[var(--st-text-muted)] hover:text-[var(--st-text-primary)] hover:bg-[var(--st-surface-hover)] transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
