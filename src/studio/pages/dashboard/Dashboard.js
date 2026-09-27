import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FolderGit2,
  Receipt,
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Layers,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileCheck2,
  Users,
  Wallet,
  Trophy,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudioPath } from '../../context/StudioBaseContext';
import { getLeads, getActivities } from '../../services/crmService';
import { getDeals } from '../../services/salesService';
import { getProjects } from '../../services/projectService';
import { getInvoices, getPayments, getExpenses } from '../../services/financeService';

const DASHBOARD_CACHE_KEY = 'brainlink_dashboard_cache_v2';

const PERIODS = [
  { id: 'week', label: '7D', days: 7, name: 'last 7 days' },
  { id: 'month', label: '30D', days: 30, name: 'last 30 days' },
  { id: 'quarter', label: '90D', days: 90, name: 'last 90 days' },
  { id: 'year', label: '12M', days: 365, name: 'last 12 months' },
];

// Open stages are ordinal → one-hue ramp (validated light & dark). "Won" is an
// outcome, so it takes the success status color and always carries its label.
const STAGES = [
  { key: 'New', label: 'New', filter: ['New Lead', 'New'] },
  { key: 'Qualified', label: 'Qualified', filter: ['Qualified', 'Contacted'] },
  { key: 'Meeting', label: 'Meeting', filter: ['Meeting', 'Demo', 'Meeting Scheduled'] },
  { key: 'Proposal', label: 'Proposal', filter: ['Proposal', 'Quotation', 'Proposal Sent'] },
  { key: 'Negotiation', label: 'Negotiation', filter: ['Negotiation'] },
  { key: 'Won', label: 'Won', filter: ['Won', 'Closed Won'] },
];
const STAGE_COLORS = {
  light: ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281', '#10B981'],
  dark: ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4', '#34D399'],
};

function readCache() {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Firestore Timestamp | {seconds} (from JSON cache) | ISO/date string → Date | null
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function sumInRange(rows, dateKey, from, to) {
  return rows.reduce((sum, row) => {
    const d = toDate(row[dateKey] || row.createdAt);
    return d && d >= from && d < to ? sum + (Number(row.amount) || 0) : sum;
  }, 0);
}

function percentChange(current, previous) {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function compactINR(v) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
  return `₹${v}`;
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`st-card p-5 ${className}`}>
      <header className="st-card-header">
        <div className="min-w-0">
          <h2 className="st-card-title">{title}</h2>
          {subtitle && <p className="st-card-subtitle truncate">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function InlineEmpty({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center">
      <span className="st-icon-chip st-tone-blue w-11 h-11 rounded-xl mb-3">
        <Icon className="w-5 h-5" />
      </span>
      <h3 className="text-[13.5px] font-semibold text-[var(--st-text-primary)]">{title}</h3>
      <p className="text-[12.5px] text-[var(--st-text-muted)] mt-1 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && (
        <button onClick={onAction} className="st-btn-secondary st-btn-sm mt-4">
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toPath = useStudioPath();
  const go = useCallback((path) => navigate(toPath(path)), [navigate, toPath]);
  const { userProfile } = useAuth();
  const { resolvedTheme } = useTheme();
  const toast = useToast();
  const isDark = resolvedTheme === 'dark';

  // Read the session cache once; a fresh object per render would retrigger fetching forever.
  const [initialCache] = useState(readCache);
  const [loading, setLoading] = useState(!initialCache);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(() => ({
    leads: initialCache?.leads || [],
    deals: initialCache?.deals || [],
    projects: initialCache?.projects || [],
    invoices: initialCache?.invoices || [],
    payments: initialCache?.payments || [],
    expenses: initialCache?.expenses || [],
    activities: initialCache?.activities || [],
  }));

  const fetchData = useCallback(
    async ({ manual = false } = {}) => {
      if (manual) setRefreshing(true);
      try {
        const [leads, deals, projects, invoices, payments, expenses, activities] = await Promise.all([
          getLeads(),
          getDeals(),
          getProjects(),
          getInvoices(),
          getPayments(),
          getExpenses(),
          getActivities(10),
        ]);
        const next = {
          leads: leads || [],
          deals: deals || [],
          projects: projects || [],
          invoices: invoices || [],
          payments: payments || [],
          expenses: expenses || [],
          activities: activities || [],
        };
        setData(next);
        try {
          sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(next));
        } catch (e) {}
        if (manual) toast.success('Dashboard refreshed');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { leads, deals, projects, invoices, payments, expenses, activities } = data;
  const activePeriod = PERIODS.find((p) => p.id === period);

  // ---- Derived metrics (all from live records) ----
  const metrics = useMemo(() => {
    const now = new Date();
    const dayMs = 86400000;
    const from = new Date(now.getTime() - activePeriod.days * dayMs);
    const prevFrom = new Date(from.getTime() - activePeriod.days * dayMs);
    const liveExpenses = expenses.filter((e) => !e.reversed);

    const revenue = sumInRange(payments, 'paymentDate', from, now);
    const prevRevenue = sumInRange(payments, 'paymentDate', prevFrom, from);
    const spend = sumInRange(liveExpenses, 'date', from, now);

    const activeDeals = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
    const pipelineValue = activeDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const weightedPipeline = activeDeals.reduce(
      (s, d) => s + (Number(d.value) || 0) * ((Number(d.probability) || 0) / 100),
      0
    );
    const closed = deals.filter((d) => d.stage === 'Won' || d.stage === 'Lost');
    const winRate = closed.length
      ? Math.round((closed.filter((d) => d.stage === 'Won').length / closed.length) * 100)
      : null;

    const activeProjects = projects.filter(
      (p) => p.status === 'Active' || p.status === 'In Progress' || !p.status
    );
    const atRiskProjects = projects.filter(
      (p) => p.status === 'Delayed' || p.status === 'At Risk' || p.health === 'At Risk'
    );

    const openInvoices = invoices.filter((i) => i.status !== 'Cancelled' && i.status !== 'Paid');
    const receivables = openInvoices.reduce((s, i) => {
      const remaining =
        i.outstandingAmount !== undefined
          ? Number(i.outstandingAmount)
          : Number(i.total || 0) - (Number(i.paidAmount) || 0);
      return s + Math.max(0, remaining);
    }, 0);
    const overdueInvoices = openInvoices.filter((i) => {
      const due = toDate(i.dueDate);
      return due && due < now;
    });

    const newLeads = leads.filter((l) => {
      const d = toDate(l.createdAt);
      return d && d >= from;
    }).length;

    return {
      revenue,
      revenueTrend: percentChange(revenue, prevRevenue),
      net: revenue - spend,
      activeDeals,
      pipelineValue,
      weightedPipeline,
      winRate,
      activeProjects,
      atRiskProjects,
      receivables,
      overdueInvoices,
      newLeads,
    };
  }, [payments, expenses, deals, projects, invoices, leads, activePeriod]);

  // Monthly collections for the last 6 months, bucketed from real payment dates
  const revenueSeries = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString('en-IN', { month: 'short' }),
        revenue: 0,
      });
    }
    payments.forEach((p) => {
      const d = toDate(p.paymentDate || p.createdAt);
      if (!d) return;
      const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.revenue += Number(p.amount) || 0;
    });
    return buckets;
  }, [payments]);
  const sixMonthTotal = revenueSeries.reduce((s, b) => s + b.revenue, 0);

  const stageBreakdown = useMemo(() => {
    const palette = STAGE_COLORS[isDark ? 'dark' : 'light'];
    return STAGES.map((stg, idx) => {
      const matched = deals.filter((d) => stg.filter.includes(d.stage));
      return {
        ...stg,
        color: palette[idx],
        count: matched.length,
        value: matched.reduce((s, d) => s + (Number(d.value) || 0), 0),
      };
    });
  }, [deals, isDark]);
  const stagedCount = stageBreakdown.reduce((s, stg) => s + stg.count, 0);

  const userName = userProfile?.displayName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date()
  );

  const attentionCount = metrics.overdueInvoices.length + metrics.atRiskProjects.length;

  const chartInk = isDark
    ? { tick: '#687186', grid: '#1E2330', stroke: '#6680FF', tooltipBg: '#131722', tooltipBorder: '#2A3142', text: '#F2F4F8' }
    : { tick: '#8C93A3', grid: '#EEF0F4', stroke: '#3B5BFF', tooltipBg: '#FFFFFF', tooltipBorder: '#E4E7EE', text: '#0E1117' };

  const quickActions = [
    { label: 'Add lead', icon: Users, path: '/crm/leads', tone: 'blue' },
    { label: 'New proposal', icon: FileCheck2, path: '/sales/proposals', tone: 'violet' },
    { label: 'Create invoice', icon: Receipt, path: '/finance/invoices', tone: 'emerald' },
    { label: 'Record payment', icon: CreditCard, path: '/finance/payments', tone: 'cyan' },
    { label: 'Schedule meeting', icon: Calendar, path: '/sales/meetings', tone: 'amber' },
  ];

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="st-skeleton h-[148px] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="st-skeleton h-[124px] rounded-[13px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="st-skeleton h-[340px] rounded-[13px] xl:col-span-8" />
          <div className="st-skeleton h-[340px] rounded-[13px] xl:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 st-stagger">
      {/* Hero */}
      <section className="st-hero p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--st-text-muted)]">
              <span className="st-live-dot" />
              <span>{today}</span>
            </div>
            <h1 className="mt-2 text-[26px] sm:text-[30px] leading-tight font-bold tracking-[-0.03em] text-[var(--st-text-primary)]">
              {greeting}, <span className="st-gradient-text">{userName}</span>
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[var(--st-text-secondary)] max-w-xl">
              {attentionCount > 0
                ? `${attentionCount} item${attentionCount > 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} your attention · ${metrics.activeDeals.length} open deals worth ${formatINR(metrics.pipelineValue)}.`
                : `Everything is on track · ${metrics.activeDeals.length} open deals worth ${formatINR(metrics.pipelineValue)}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="st-segmented" role="group" aria-label="Reporting period">
              {PERIODS.map((p) => (
                <button key={p.id} aria-pressed={period === p.id} onClick={() => setPeriod(p.id)} title={p.name}>
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchData({ manual: true })}
              disabled={refreshing}
              className="st-btn-secondary st-btn-sm w-8 px-0"
              title="Refresh metrics"
              aria-label="Refresh metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => go('/finance/invoices')} className="st-btn-primary st-btn-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New invoice</span>
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-5 pt-5 border-t border-[var(--st-border-subtle)] flex gap-2 overflow-x-auto studio-scrollbar -mx-1 px-1 pb-1">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => go(a.path)}
                className="group shrink-0 flex items-center gap-2.5 h-10 pl-1.5 pr-3.5 rounded-[11px] bg-[var(--st-surface)] border border-[var(--st-border)] hover:border-[var(--st-border-strong)] shadow-[var(--st-shadow-xs)] hover:shadow-[var(--st-shadow-sm)] cursor-pointer transition-all"
              >
                <span className={`st-icon-chip w-7 h-7 rounded-lg st-tone-${a.tone}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-[12.5px] font-semibold text-[var(--st-text-primary)]">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={`Collected · ${activePeriod.label}`}
          value={formatINR(metrics.revenue)}
          trend={metrics.revenueTrend || undefined}
          subtext={`Net ${formatINR(metrics.net)} after expenses`}
          icon={Wallet}
          color="emerald"
          onClick={() => go('/finance')}
        />
        <StatCard
          title="Open pipeline"
          value={formatINR(metrics.pipelineValue)}
          subtext={`${metrics.activeDeals.length} deals · weighted ${formatINR(Math.round(metrics.weightedPipeline))}`}
          icon={TrendingUp}
          color="blue"
          onClick={() => go('/sales/pipeline')}
        />
        <StatCard
          title="Receivables"
          value={formatINR(metrics.receivables)}
          trend={metrics.overdueInvoices.length > 0 ? `-${metrics.overdueInvoices.length} overdue` : undefined}
          subtext={metrics.overdueInvoices.length > 0 ? 'needs follow-up' : 'Nothing overdue'}
          icon={AlertCircle}
          color={metrics.overdueInvoices.length > 0 ? 'rose' : 'violet'}
          onClick={() => go('/finance/invoices')}
        />
        <StatCard
          title="Active projects"
          value={metrics.activeProjects.length}
          subtext={
            metrics.atRiskProjects.length > 0
              ? `${metrics.atRiskProjects.length} at risk`
              : `${metrics.newLeads} new leads · ${activePeriod.label}`
          }
          icon={FolderGit2}
          color={metrics.atRiskProjects.length > 0 ? 'amber' : 'cyan'}
          onClick={() => go('/projects')}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 space-y-5 min-w-0">
          <Panel
            title="Revenue collected"
            subtitle="Payments received per month · last 6 months"
            action={
              <div className="text-right shrink-0">
                <div className="text-lg font-bold tracking-tight text-[var(--st-text-primary)] tabular-nums">
                  {formatINR(sixMonthTotal)}
                </div>
                <div className="text-[11px] text-[var(--st-text-muted)]">6-month total</div>
              </div>
            }
          >
            {sixMonthTotal === 0 ? (
              <InlineEmpty
                icon={CreditCard}
                title="No payments in the last 6 months"
                description="Monthly collections will chart here as soon as customer payments are recorded."
                actionLabel="Record payment"
                onAction={() => go('/finance/payments')}
              />
            ) : (
              <div className="h-64 mt-3 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartInk.stroke} stopOpacity={isDark ? 0.35 : 0.22} />
                        <stop offset="100%" stopColor={chartInk.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={chartInk.grid} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11.5, fill: chartInk.tick, fontFamily: 'Outfit' }}
                    />
                    <YAxis
                      width={56}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: chartInk.tick, fontFamily: 'Outfit' }}
                      tickFormatter={compactINR}
                    />
                    <Tooltip
                      cursor={{ stroke: chartInk.tick, strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: chartInk.tooltipBg,
                        border: `1px solid ${chartInk.tooltipBorder}`,
                        borderRadius: 10,
                        fontSize: 12,
                        fontFamily: 'Outfit',
                        boxShadow: '0 12px 28px -8px rgba(0,0,0,0.25)',
                      }}
                      labelStyle={{ color: chartInk.tick, fontWeight: 500, marginBottom: 2 }}
                      itemStyle={{ color: chartInk.text, fontWeight: 600 }}
                      formatter={(val) => [formatINR(val), 'Collected']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartInk.stroke}
                      strokeWidth={2}
                      fill="url(#dashRevGrad)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: isDark ? '#0E1119' : '#FFFFFF' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel
            title="Active projects"
            subtitle={`${metrics.activeProjects.length} in delivery`}
            action={
              <button onClick={() => go('/projects')} className="st-link">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {metrics.activeProjects.length === 0 ? (
              <InlineEmpty
                icon={FolderGit2}
                title="No projects in flight"
                description="Active deliveries will show milestone progress and deadlines here."
                actionLabel="Create project"
                onAction={() => go('/projects')}
              />
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Client</th>
                      <th className="w-44">Progress</th>
                      <th className="text-right">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.activeProjects.slice(0, 5).map((p) => {
                      const progress = Math.min(100, Math.max(0, Number(p.progress) || 0));
                      return (
                        <tr key={p.id} onClick={() => go('/projects')} className="cursor-pointer">
                          <td className="font-semibold max-w-[200px] truncate">{p.name}</td>
                          <td className="text-[var(--st-text-secondary)] max-w-[160px] truncate">
                            {p.clientName || '—'}
                          </td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="st-progress-track">
                                <div className="st-progress-fill" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[11.5px] font-semibold text-[var(--st-text-secondary)] w-9 text-right tabular-nums">
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="text-right text-[var(--st-text-secondary)] whitespace-nowrap">
                            {p.targetDelivery ? formatDate(p.targetDelivery) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="xl:col-span-4 space-y-5 min-w-0">
          <Panel
            title="Pipeline by stage"
            subtitle={
              metrics.winRate !== null
                ? `${stagedCount} deals · ${metrics.winRate}% win rate`
                : `${stagedCount} deals across stages`
            }
            action={
              <button onClick={() => go('/sales/pipeline')} className="st-link">
                Board <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {stagedCount === 0 ? (
              <InlineEmpty
                icon={Layers}
                title="No deals yet"
                description="Create an opportunity to start tracking stages and pipeline velocity."
                actionLabel="Create deal"
                onAction={() => go('/sales/pipeline')}
              />
            ) : (
              <>
                {/* Stacked share bar: 2px surface gaps between segments */}
                <div className="flex h-2.5 mt-3 gap-[2px] rounded-full overflow-hidden" role="img" aria-label="Deal count by stage">
                  {stageBreakdown
                    .filter((s) => s.count > 0)
                    .map((s) => (
                      <div
                        key={s.key}
                        title={`${s.label}: ${s.count}`}
                        style={{ flexGrow: s.count, backgroundColor: s.color }}
                        className="first:rounded-l-full last:rounded-r-full transition-[flex-grow] duration-500"
                      />
                    ))}
                </div>
                <ul className="mt-4 space-y-0.5 list-none p-0 m-0">
                  {stageBreakdown.map((s) => (
                    <li
                      key={s.key}
                      className="flex items-center gap-3 px-2 -mx-2 py-2 rounded-lg hover:bg-[var(--st-surface-hover)] transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--st-text-primary)] flex-1 min-w-0">
                        {s.key === 'Won' && <Trophy className="w-3.5 h-3.5 text-[var(--st-success-text)]" />}
                        {s.label}
                      </span>
                      <span className="text-[12px] text-[var(--st-text-muted)] tabular-nums">{formatINR(s.value)}</span>
                      <span className="text-[13px] font-semibold text-[var(--st-text-primary)] tabular-nums w-6 text-right">
                        {s.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <Panel
            title="Needs attention"
            subtitle={attentionCount > 0 ? `${attentionCount} open items` : 'All clear'}
            action={
              attentionCount > 0 ? (
                <span className="st-icon-chip w-7 h-7 rounded-lg st-tone-amber">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              ) : null
            }
          >
            <div className="mt-3 space-y-2">
              {metrics.overdueInvoices.slice(0, 3).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => go('/finance/invoices')}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-[11px] bg-[var(--st-surface-subtle)] border border-[var(--st-border)] hover:border-[var(--st-danger-border)] cursor-pointer transition-colors"
                >
                  <span className="st-icon-chip w-8 h-8 rounded-lg st-tone-rose">
                    <Receipt className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-[var(--st-text-primary)] truncate">
                      {inv.invoiceNumber} · {inv.clientName}
                    </span>
                    <span className="block text-[11.5px] text-[var(--st-danger-text)]">
                      Overdue since {formatDate(inv.dueDate)}
                    </span>
                  </span>
                  <span className="text-[13px] font-bold tabular-nums text-[var(--st-text-primary)]">
                    {formatINR(inv.total || 0)}
                  </span>
                </button>
              ))}

              {metrics.atRiskProjects.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => go('/projects')}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-[11px] bg-[var(--st-surface-subtle)] border border-[var(--st-border)] hover:border-[var(--st-warning-border)] cursor-pointer transition-colors"
                >
                  <span className="st-icon-chip w-8 h-8 rounded-lg st-tone-amber">
                    <FolderGit2 className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-[var(--st-text-primary)] truncate">{p.name}</span>
                    <span className="block text-[11.5px] text-[var(--st-text-muted)]">
                      Target {p.targetDelivery ? formatDate(p.targetDelivery) : 'not set'}
                    </span>
                  </span>
                  <StatusBadge status={p.health === 'At Risk' ? 'At Risk' : p.status || 'At Risk'} />
                </button>
              ))}

              {attentionCount === 0 && (
                <div className="flex items-center gap-3 p-3 rounded-[11px] bg-[var(--st-success-subtle)] border border-[var(--st-success-border)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--st-success-text)] shrink-0" />
                  <span className="text-[12.5px] font-medium text-[var(--st-success-text)]">
                    Invoices and deliveries are all healthy.
                  </span>
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Recent activity"
            subtitle="Latest actions across the workspace"
            action={
              <button onClick={() => go('/crm/activities')} className="st-link">
                <Activity className="w-3.5 h-3.5" /> All
              </button>
            }
          >
            <div className="mt-3">
              <ActivityTimeline activities={activities} limit={5} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
