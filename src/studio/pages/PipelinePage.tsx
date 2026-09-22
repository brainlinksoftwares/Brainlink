import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Building,
  Table as TableIcon,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { Lead, LeadStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/StatusBadge';
import { DEFAULT_LEAD_STATUSES } from '../config/crmConfig';
import { EmptyState } from '../components/common/EmptyState';

export const PipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await leadService.getAllLeads();
      setLeads(data.filter((l) => !l.archived));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = leadService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleMoveStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!user) return;
    await leadService.updateLeadStatus(leadId, newStatus, { id: user.id, name: user.name });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sales Pipeline Kanban
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize prospect progression across qualification and deal stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-500" />
            Table View
          </button>
          <button
            onClick={() => navigate('/leads/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="Pipeline is empty"
          description="Create your first lead to see it move across your visual pipeline Kanban board."
          actionLabel="Create Lead"
          onAction={() => navigate('/leads/new')}
        />
      ) : (
        /* Kanban Horizontal Scroll Container */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x">
          {DEFAULT_LEAD_STATUSES.map((statusConfig, colIdx) => {
            const stageLeads = leads.filter((l) => l.status === statusConfig.key);

            return (
              <div
                key={statusConfig.key}
                className="w-72 sm:w-80 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 max-h-[calc(100vh-210px)] overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">{statusConfig.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                      No leads in {statusConfig.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="cursor-pointer"
                          >
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {lead.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              {lead.company || 'Direct'}
                            </p>
                          </div>
                          <PriorityBadge priority={lead.priority} size="sm" />
                        </div>

                        <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {lead.requirement || 'No notes provided'}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-slate-700">{lead.budget || lead.service}</span>
                          <span>{lead.assignedToName || 'Unassigned'}</span>
                        </div>

                        {/* Quick stage transition controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          {colIdx > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleMoveStatus(lead.id, DEFAULT_LEAD_STATUSES[colIdx - 1].key)}
                              className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5 p-1 hover:bg-slate-100 rounded"
                              title={`Move back to ${DEFAULT_LEAD_STATUSES[colIdx - 1].label}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Back
                            </button>
                          ) : (
                            <div />
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Details
                          </button>

                          {colIdx < DEFAULT_LEAD_STATUSES.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => handleMoveStatus(lead.id, DEFAULT_LEAD_STATUSES[colIdx + 1].key)}
                              className="text-slate-400 hover:text-blue-600 flex items-center gap-0.5 p-1 hover:bg-slate-100 rounded"
                              title={`Advance to ${DEFAULT_LEAD_STATUSES[colIdx + 1].label}`}
                            >
                              Next
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
