import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users2,
  UserPlus2,
  CheckCircle,
  Clock,
  Trophy,
  XCircle,
  Percent,
  IndianRupee,
  Plus,
  Upload,
  ArrowUpRight,
  Sparkles,
  FolderOpen,
  Compass,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { teamService } from '../services/teamService';
import { analyticsService, DashboardMetrics } from '../services/analyticsService';
import { seedService } from '../services/seedService';
import { activityService } from '../services/activityService';
import { Activity } from '../types';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leads, followUps, users, recentActs] = await Promise.all([
        leadService.getAllLeads(),
        followUpService.getAllFollowUps(),
        teamService.getAllUsers(),
        activityService.getAllActivities(8),
      ]);

      const calculated = analyticsService.calculateMetrics(leads, followUps, users);
      setMetrics(calculated);
      setActivities(recentActs);
    } catch (err) {
      console.error('Error loading dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubLead = leadService.subscribe(loadData);
    const unsubAct = activityService.subscribe(loadData);
    return () => {
      unsubLead();
      unsubAct();
    };
  }, []);

  const handleSeedDemoData = () => {
    seedService.seedSampleData();
    loadData();
  };

  const handleClearDemoData = () => {
    seedService.clearAllData();
    loadData();
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Calculating CRM metrics...</span>
        </div>
      </div>
    );
  }

  const hasData = metrics && metrics.totalLeads > 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Executive CRM Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time pipeline metrics, lead source attribution &amp; sales velocity
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/lead-hunter')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all"
          >
            <Compass className="w-4 h-4" />
            Auto Lead Hunter
          </button>
          <button
            onClick={() => navigate('/leads/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
          <button
            onClick={() => navigate('/leads/import')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Dev / Testing Demo Banner */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Production Mode:</strong> No hard-coded dummy data. Data is calculated live from the database.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!hasData ? (
            <button
              onClick={handleSeedDemoData}
              className="px-2.5 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
            >
              Load Sample Test Leads
            </button>
          ) : (
            <button
              onClick={handleClearDemoData}
              className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
            >
              Reset to Zero (Clean Slate)
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Leads
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.totalLeads ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active pipeline prospects</p>
        </div>

        {/* New Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              New Leads
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserPlus2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.newLeads ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting first contact</p>
        </div>

        {/* Qualified Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Qualified
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.qualifiedLeads ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requirements matched</p>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Follow-ups Due
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.followupsDue ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for today or overdue</p>
        </div>

        {/* Converted (Won) Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Converted (Won)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.convertedLeads ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully closed deals</p>
        </div>

        {/* Lost Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lost Leads
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.lostLeads ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unconverted / Closed lost</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversion Rate
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {metrics?.conversionRate ?? 0}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Won vs. total pipeline</p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Est. Pipeline Value
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              ₹{(metrics?.pipelineValue ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">In qualified stages</p>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      {!hasData ? (
        <EmptyState
          icon={FolderOpen}
          title="No lead data available yet."
          description="Your CRM is ready for live leads. Generate your first lead manually, capture submissions from the public /apply form, or import a batch CSV file."
          actionLabel="Create First Lead"
          onAction={() => navigate('/leads/new')}
          secondaryActionLabel="Load Sample Data"
          onSecondaryAction={handleSeedDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart: Leads Over Time */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lead Volume Trend</h3>
                <p className="text-xs text-slate-500">Leads generated across recent timeline</p>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                Daily Inflow
              </span>
            </div>

            {/* Dynamic CSS/SVG Bar & Area Visualization */}
            <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
              {metrics.leadsOverTime.length === 0 ? (
                <div className="w-full text-center text-xs text-slate-400 my-auto">
                  Lead trend will appear as dates progress
                </div>
              ) : (
                metrics.leadsOverTime.map((item, idx) => {
                  const max = Math.max(...metrics.leadsOverTime.map((d) => d.count), 1);
                  const heightPercent = Math.max((item.count / max) * 100, 15);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-xs"
                      />
                      <span className="text-[10px] text-slate-400 truncate w-full text-center mt-1">
                        {item.date}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <span>Dynamic calculation from database timestamps</span>
              <button
                onClick={() => navigate('/pipeline')}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
              >
                View Pipeline Kanban
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Leads by Source */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Lead Sources Breakdown</h3>
              <p className="text-xs text-slate-500">Channel distribution of incoming leads</p>
            </div>

            <div className="space-y-3">
              {metrics.leadsBySource.slice(0, 6).map((src) => (
                <div key={src.source}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{src.source}</span>
                    <span className="text-slate-500 font-semibold">
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${src.percentage}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Sales Conversion Funnel</h3>
              <p className="text-xs text-slate-500">Deal progression from New to Won</p>
            </div>

            <div className="space-y-2.5">
              {metrics.funnelData.map((f, i) => (
                <div
                  key={f.stage}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{f.stage}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                    {f.count} leads
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance Table */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Team Sales Performance</h3>
                <p className="text-xs text-slate-500">Assigned leads, closures, and conversion rates</p>
              </div>
              <button
                onClick={() => navigate('/team')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Team
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Team Member</th>
                    <th className="pb-2.5 text-center">Assigned Leads</th>
                    <th className="pb-2.5 text-center">Won Deals</th>
                    <th className="pb-2.5 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.teamPerformance.map((tp) => (
                    <tr key={tp.userId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800">{tp.userName}</td>
                      <td className="py-2.5 text-center text-slate-600 font-semibold">{tp.totalAssigned}</td>
                      <td className="py-2.5 text-center text-emerald-600 font-semibold">{tp.wonCount}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {tp.conversionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent CRM Audit Activity Log */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live CRM Activity Stream</h3>
                <p className="text-xs text-slate-500">Immutable audit actions logged in real-time</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Audited
              </span>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent actions logged</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{act.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        By <span className="font-semibold text-slate-600">{act.actorName}</span> &bull;{' '}
                        {new Date(act.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
