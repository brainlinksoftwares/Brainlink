import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Building2,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getClients,
  updateClientChecklist,
  ONBOARDING_STEPS,
} from '../../services/clientService';

export default function ClientOnboarding() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load onboarding clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleToggleStep = async (stepId, currentStatus) => {
    if (!selectedClient) return;
    try {
      const updated = await updateClientChecklist(
        selectedClient.id,
        stepId,
        !currentStatus,
        userProfile?.email
      );
      setSelectedClient(updated);
      setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      toast.success(
        !currentStatus ? 'Marked step completed' : 'Marked step pending'
      );
    } catch (err) {
      toast.error('Failed to update onboarding step');
    }
  };

  const checklist = selectedClient?.checklist || {};
  const progress = selectedClient?.onboardingProgress || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Client Onboarding Orchestration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          10-point standardized operational checklist triggered upon Deal Won closing
        </p>
      </div>

      {/* Main Grid: Client Selector & Onboarding Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client List */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Select Client Account
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading accounts...</div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No clients found. Close a deal to initiate onboarding!
            </div>
          ) : (
            <div className="space-y-1.5">
              {clients.map((c) => {
                const isSelected = selectedClient?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.companyName}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600">
                        {c.onboardingProgress || 0}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.primaryContact || 'Stakeholder'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: 10-Step Interactive Checklist */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          {selectedClient ? (
            <>
              {/* Client Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    {selectedClient.companyName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Account Status: <strong className="text-slate-800">{selectedClient.status}</strong>
                  </p>
                </div>

                <div className="w-48 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Onboarding Progress</span>
                    <span className="text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const isDone = Boolean(checklist[step.id]);
                  return (
                    <div
                      key={step.id}
                      onClick={() => handleToggleStep(step.id, isDone)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold leading-tight block">
                            {idx + 1}. {step.label}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold uppercase tracking-wider">
                            Category: {step.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isDone ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {progress === 100 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">100% Onboarding Completed!</span> All legal, financial, and operational requirements satisfied. Account is fully active.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select a client account to inspect or execute the onboarding workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
