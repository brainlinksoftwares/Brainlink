import React from 'react';
import { AlertTriangle, ArrowRight, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge } from './StatusBadge';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasons: string[];
  matchingLeads: Lead[];
  onOpenExisting: (leadId: string) => void;
  onUpdateExisting?: (leadId: string) => void;
  onCreateAnyway: () => void;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  reasons,
  matchingLeads,
  onOpenExisting,
  onUpdateExisting,
  onCreateAnyway,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-200/60 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Possible Existing Lead Found</h3>
              <p className="text-xs text-slate-600">Duplicate detection prevented creating an accidental duplicate.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reasons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Matching Criteria:
            </span>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
              {reasons.map((r, i) => (
                <li key={i} className="font-medium text-amber-800">{r}</li>
              ))}
            </ul>
          </div>

          {/* Matched leads */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Existing Record ({matchingLeads.length}):
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {matchingLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{lead.name}</span>
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lead.company} &bull; {lead.email || lead.phone}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned: {lead.assignedToName || 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenExisting(lead.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </button>
                    {onUpdateExisting && (
                      <button
                        type="button"
                        onClick={() => onUpdateExisting(lead.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Update
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreateAnyway}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
          >
            Create Anyway (Genuinely Different)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
