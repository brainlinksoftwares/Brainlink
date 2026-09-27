import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be easily undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={loading} className="st-btn-secondary">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'st-btn-danger' : 'st-btn-primary'}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className={`st-icon-chip w-11 h-11 rounded-xl ${danger ? 'st-tone-rose' : 'st-tone-amber'}`}>
          <AlertTriangle className="w-5 h-5" />
        </span>
        <div className="text-[13.5px] text-[var(--st-text-secondary)] leading-relaxed pt-1">{message}</div>
      </div>
    </Modal>
  );
}
