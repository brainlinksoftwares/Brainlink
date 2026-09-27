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
  ChevronRight,
  UserCheck,
  Percent,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
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

  // Metrics
  const totalAccounts = clients.length;
  const completedAccounts = clients.filter(c => (c.onboardingProgress || 0) === 100).length;
  const inFlightAccounts = clients.filter(c => (c.onboardingProgress || 0) < 100).length;
  const avgProgress = totalAccounts > 0
    ? Math.round(clients.reduce((s, c) => s + (c.onboardingProgress || 0), 0) / totalAccounts)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Clients</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">Onboarding</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
          Client Onboarding Orchestration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          10-point standardized operational checklist triggered upon Deal Won closing
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Accounts"
          value={totalAccounts}
          icon={Building2}
          subtext="Indexed corporate clients"
        />
        <StatCard
          label="Fully Onboarded"
          value={completedAccounts}
          icon={ShieldCheck}
          subtext="100% protocol completed"
        />
        <StatCard
          label="In-Flight Onboarding"
          value={inFlightAccounts}
          icon={Clock}
          subtext="Checklist items pending"
        />
        <StatCard
          label="Average Progress"
          value={`${avgProgress}%`}
          icon={Percent}
          subtext="Overall pipeline velocity"
        />
      </div>

      {/* Main Grid: Client Selector & Onboarding Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Client List */}
        <div className="st-card p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
            Corporate Accounts
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading accounts...</div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No clients found. Close a deal to initiate onboarding!
            </div>
          ) : (
            <div className="space-y-1">
              {clients.map((c) => {
                const isSelected = selectedClient?.id === c.id;
                const cProgress = c.onboardingProgress || 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`w-full text-left p-3 rounded-md transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 shadow-2xs'
                        : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {c.companyName}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400">
                        {cProgress}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {c.primaryContact || 'Primary Stakeholder'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: 10-Step Interactive Checklist */}
        <div className="lg:col-span-2 st-card p-5 space-y-5">
          {selectedClient ? (
            <>
              {/* Client Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {selectedClient.companyName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Account Status: <strong className="text-slate-800 dark:text-slate-200">{selectedClient.status}</strong>
                  </p>
                </div>

                <div className="w-48 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Protocol Progress</span>
                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
              <div className="space-y-2">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const isDone = Boolean(checklist[step.id]);
                  return (
                    <div
                      key={step.id}
                      onClick={() => handleToggleStep(step.id, isDone)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isDone
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-medium leading-tight block">
                            {idx + 1}. {step.label}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block uppercase tracking-wider font-mono">
                            Category: {step.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isDone
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isDone ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {progress === 100 && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold">100% Onboarding Completed!</span> All legal, financial, and operational requirements satisfied. Account is verified and active.
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
