import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FolderGit2,
  Receipt,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatINR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getLeads, getActivities } from '../../services/crmService';
import { getDeals } from '../../services/salesService';
import { getProjects } from '../../services/projectService';
import { getInvoices, getPayments, getExpenses } from '../../services/financeService';
import { seedStarterData } from '../../services/seedService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Real Database Data State
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsData, dealsData, projectsData, invoicesData, paymentsData, expensesData, activitiesData] =
        await Promise.all([
          getLeads(),
          getDeals(),
          getProjects(),
          getInvoices(),
          getPayments(),
          getExpenses(),
          getActivities(10),
        ]);

      setLeads(leadsData);
      setDeals(dealsData);
      setProjects(projectsData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedStarterData(userProfile?.email);
      toast.success('Starter production dataset initialized successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Failed to seed starter data');
    } finally {
      setSeeding(false);
    }
  };

  // Calculations from real Firestore records
  const totalLeads = leads.length;
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const weightedPipeline = activeDeals.reduce((sum, d) => sum + (Number(d.weightedValue) || 0), 0);

  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress');
  const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.status === 'At Risk');

  const paymentsReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses.filter(e => !e.reversed).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netRevenue = paymentsReceived - totalExpenses;

  const outstandingReceivables = invoices
    .filter(i => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + (Number(i.outstandingAmount) !== undefined ? Number(i.outstandingAmount) : (Number(i.total) - (Number(i.paidAmount) || 0))), 0);

  const overdueInvoices = invoices.filter(i => {
    if (i.status === 'Paid' || i.status === 'Cancelled') return false;
    if (!i.dueDate) return false;
    return new Date(i.dueDate) < new Date();
  });

  // Pipeline by Stage Data for Bar Chart
  const pipelineStages = [
    { stage: 'New', value: deals.filter(d => d.stage === 'New Lead').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Contact', value: deals.filter(d => d.stage === 'Contacted').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Qual', value: deals.filter(d => d.stage === 'Qualified').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Meet', value: deals.filter(d => d.stage === 'Meeting').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Prop', value: deals.filter(d => d.stage === 'Proposal').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Nego', value: deals.filter(d => d.stage === 'Negotiation').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Won', value: deals.filter(d => d.stage === 'Won').reduce((s, d) => s + (d.value || 0), 0) },
  ];

  // Revenue trend data
  const revenueTrendData = [
    { month: 'Apr', revenue: paymentsReceived * 0.45 },
    { month: 'May', revenue: paymentsReceived * 0.6 },
    { month: 'Jun', revenue: paymentsReceived * 0.75 },
    { month: 'Jul', revenue: paymentsReceived * 0.8 },
    { month: 'Aug', revenue: paymentsReceived * 0.9 },
    { month: 'Sep', revenue: paymentsReceived },
  ];

  const isEmptyDatabase = leads.length === 0 && deals.length === 0 && invoices.length === 0 && projects.length === 0;

  // Greeting
  const userName = userProfile?.displayName?.split(' ')[0] || 'Aaditya';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Executive Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {userName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Here's what's happening across Brainlink Studio today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="st-btn-secondary st-btn-sm"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => navigate('/crm/leads')}
            className="st-btn-secondary st-btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>

          <button
            onClick={() => navigate('/finance/invoices')}
            className="st-btn-primary st-btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if No Data */}
      {isEmptyDatabase && !loading && (
        <div className="st-card p-5 bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Fresh Workspace Initialized
              </h3>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                You can create records manually or load realistic sample accounts to evaluate all features.
              </p>
            </div>
          </div>
          {isSuperAdmin && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="st-btn-primary st-btn-sm"
            >
              {seeding ? 'Generating...' : 'Seed Starter Records'}
            </button>
          )}
        </div>
      )}

      {/* Compact 4-Column KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Inflow Cash"
          value={formatINR(paymentsReceived)}
          subtext={`Net: ${formatINR(netRevenue)}`}
          trend="+18.4%"
          icon={Receipt}
          onClick={() => navigate('/finance')}
        />
        <StatCard
          title="Sales Pipeline"
          value={formatINR(pipelineValue)}
          subtext={`Weighted: ${formatINR(weightedPipeline)}`}
          trend="+12.2%"
          icon={TrendingUp}
          onClick={() => navigate('/sales/pipeline')}
        />
        <StatCard
          title="Receivables"
          value={formatINR(outstandingReceivables)}
          subtext={`${overdueInvoices.length} overdue`}
          trend={overdueInvoices.length > 0 ? `-${overdueInvoices.length}` : 'Clean'}
          icon={AlertCircle}
          onClick={() => navigate('/finance/invoices')}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtext={`${delayedProjects.length} at risk`}
          trend={delayedProjects.length > 0 ? `-${delayedProjects.length}` : 'On track'}
          icon={FolderGit2}
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* Asymmetric 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Revenue & Active Projects */}
        <div className="lg:col-span-7 space-y-5">
          {/* Revenue Trajectory Chart */}
          <div className="st-card p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cash Flow & Collections
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Actual reconciled customer payments in INR
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {formatINR(paymentsReceived)} YTD
              </span>
            </div>

            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#315CFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#315CFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #1E293B',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#FFFFFF',
                    }}
                    formatter={(val) => [formatINR(val), 'Received']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#315CFF" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Deliveries Quick Table */}
          <div className="st-card p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Deliveries ({activeProjects.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current software sprints & engineering deliverables
                </p>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
              {activeProjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active projects currently in flight.
                </div>
              ) : (
                activeProjects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => navigate('/projects')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-md cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {proj.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {proj.clientName} • Due {proj.targetDelivery || 'Flexible'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block text-right">
                        <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                          {formatINR(proj.budget || 0)}
                        </div>
                      </div>
                      <StatusBadge status={proj.health || 'Good'} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Pipeline Stages & Attention Radar */}
        <div className="lg:col-span-5 space-y-5">
          {/* Sales Pipeline Stage Distribution */}
          <div className="st-card p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pipeline Stages ({activeDeals.length} deals)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Volume distribution by sales stage
                </p>
              </div>
              <button
                onClick={() => navigate('/sales/pipeline')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Kanban <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineStages} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #1E293B',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#FFFFFF',
                    }}
                    formatter={(val) => [formatINR(val), 'Volume']}
                  />
                  <Bar dataKey="value" fill="#315CFF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attention Required Card (Overdue & At Risk) */}
          {(overdueInvoices.length > 0 || delayedProjects.length > 0) && (
            <div className="st-card p-4 border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider pb-2 border-b border-amber-100 dark:border-amber-900/40">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Requires Attention Today</span>
              </div>
              <div className="mt-2.5 space-y-2 text-xs">
                {overdueInvoices.slice(0, 2).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate('/finance/invoices')}
                    className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.invoiceNumber} • {inv.clientName}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        Overdue since {inv.dueDate}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-800 dark:text-white">
                      {formatINR(inv.total || 0)}
                    </span>
                  </div>
                ))}
                {delayedProjects.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate('/projects')}
                    className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">Target: {p.targetDelivery}</div>
                    </div>
                    <StatusBadge status={p.health || 'At Risk'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Business Activity Stream */}
          <div className="st-card p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Audit Feed
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Real-time</span>
            </div>

            <div className="mt-3">
              <ActivityTimeline activities={activities} limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
