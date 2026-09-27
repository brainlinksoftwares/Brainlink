import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  FolderGit2,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import EmptyState from '../../components/ui/EmptyState';
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
  const { userProfile, role, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [dateFilter, setDateFilter] = useState('ALL'); // THIS_MONTH, THIS_QUARTER, THIS_YEAR, ALL
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

  const fetchData = async () => {
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
          getActivities(15),
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
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified' || l.status === 'Proposal Sent').length;

  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const weightedPipeline = activeDeals.reduce((sum, d) => sum + (Number(d.weightedValue) || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'Won');

  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress');
  const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.status === 'At Risk');

  const totalInvoiced = invoices.filter(i => i.status !== 'Cancelled').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
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

  // Funnel Data
  const funnelStages = [
    { name: 'Lead', count: leads.length, fill: '#3b82f6' },
    { name: 'Qualified', count: leads.filter(l => ['Qualified', 'Meeting Scheduled', 'Proposal Sent', 'Won'].includes(l.status)).length, fill: '#06b6d4' },
    { name: 'Proposal', count: deals.filter(d => ['Proposal', 'Negotiation', 'Won'].includes(d.stage)).length, fill: '#8b5cf6' },
    { name: 'Negotiation', count: deals.filter(d => ['Negotiation', 'Won'].includes(d.stage)).length, fill: '#f59e0b' },
    { name: 'Won', count: wonDeals.length, fill: '#10b981' },
  ];

  // Pipeline by Stage Data
  const pipelineByStage = [
    { stage: 'New', value: deals.filter(d => d.stage === 'New Lead').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Contacted', value: deals.filter(d => d.stage === 'Contacted').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Qualified', value: deals.filter(d => d.stage === 'Qualified').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Meeting', value: deals.filter(d => d.stage === 'Meeting').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Proposal', value: deals.filter(d => d.stage === 'Proposal').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Negotiation', value: deals.filter(d => d.stage === 'Negotiation').reduce((s, d) => s + (d.value || 0), 0) },
    { stage: 'Won', value: deals.filter(d => d.stage === 'Won').reduce((s, d) => s + (d.value || 0), 0) },
  ];

  // Receivables Pie Data
  const receivablesPie = [
    { name: 'Collected', value: paymentsReceived, color: '#10b981' },
    { name: 'Outstanding', value: Math.max(0, outstandingReceivables), color: '#f59e0b' },
  ];

  const isEmptyDatabase = leads.length === 0 && deals.length === 0 && invoices.length === 0 && projects.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Executive Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business performance, sales telemetry, active deliveries & financials
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Date Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-600 shadow-2xs">
            <button
              onClick={() => setDateFilter('THIS_MONTH')}
              className={`px-2.5 py-1 rounded ${dateFilter === 'THIS_MONTH' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('THIS_QUARTER')}
              className={`px-2.5 py-1 rounded ${dateFilter === 'THIS_QUARTER' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            >
              Quarter
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-2.5 py-1 rounded ${dateFilter === 'ALL' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Banner if clean database */}
      {isEmptyDatabase && !loading && (
        <EmptyState
          icon={Sparkles}
          title="Welcome to Brainlink Studio"
          description="Your production database is currently empty. You can either begin creating your live leads, deals, and projects, or seed realistic starter records to test end-to-end workflows."
          actionLabel={seeding ? 'Seeding Database...' : 'Populate Starter Dataset'}
          onAction={handleSeedData}
          secondaryAction={
            <button
              onClick={() => navigate('/studio/crm/leads')}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              + Create First Lead
            </button>
          }
        />
      )}

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          subtext={`${qualifiedLeads} qualified`}
          icon={Users}
          color="blue"
          onClick={() => navigate('/studio/crm/leads')}
        />
        <StatCard
          title="Active Pipeline"
          value={formatINR(pipelineValue)}
          subtext={`Weighted: ${formatINR(weightedPipeline)}`}
          icon={TrendingUp}
          color="indigo"
          onClick={() => navigate('/studio/sales/pipeline')}
        />
        <StatCard
          title="Won Deals"
          value={wonDeals.length}
          subtext={`${activeDeals.length} in negotiation`}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/studio/sales/pipeline')}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtext={delayedProjects.length > 0 ? `${delayedProjects.length} flagged at risk` : 'All deliveries on schedule'}
          icon={FolderGit2}
          color="cyan"
          onClick={() => navigate('/studio/projects')}
        />
        <StatCard
          title="Payments Collected"
          value={formatINR(paymentsReceived)}
          subtext={`Invoiced: ${formatINR(totalInvoiced)}`}
          icon={CreditCard}
          color="emerald"
          onClick={() => navigate('/studio/finance/payments')}
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatINR(outstandingReceivables)}
          subtext={`${overdueInvoices.length} invoices overdue`}
          icon={Receipt}
          color={overdueInvoices.length > 0 ? 'rose' : 'amber'}
          onClick={() => navigate('/studio/finance/invoices')}
        />
        <StatCard
          title="Operating Expenses"
          value={formatINR(totalExpenses)}
          subtext={`${expenses.length} recorded entries`}
          icon={DollarSign}
          color="rose"
          onClick={() => navigate('/studio/finance/expenses')}
        />
        <StatCard
          title="Net Revenue"
          value={formatINR(netRevenue)}
          subtext="Collected - Operating Expenses"
          icon={TrendingUp}
          color="emerald"
          onClick={() => navigate('/studio/finance')}
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline Stage Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Deal Value by Stage</h3>
              <p className="text-xs text-slate-500">Total volume distributed across pipeline checkpoints</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value), 'Deal Value']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#315cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables & Cash Flow Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Receivables Collection</h3>
            <p className="text-xs text-slate-500">Collected cash vs outstanding balances</p>
          </div>

          <div className="h-52 my-auto">
            {paymentsReceived === 0 && outstandingReceivables === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No invoices or payments recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={receivablesPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {receivablesPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Billed:</span>
            <span className="font-bold text-slate-800">{formatINR(totalInvoiced)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sales Funnel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Sales Conversion Funnel</h3>
          <p className="text-xs text-slate-500 mb-4">Stage-by-stage pipeline velocity</p>

          <div className="space-y-3">
            {funnelStages.map((stg) => {
              const maxCount = Math.max(...funnelStages.map(s => s.count), 1);
              const pct = Math.round((stg.count / maxCount) * 100);
              return (
                <div key={stg.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stg.name}</span>
                    <span className="text-slate-500">{stg.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: stg.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Operational Activity</h3>
              <p className="text-xs text-slate-500">Auditable events across CRM, Sales, Projects & Finance</p>
            </div>
            <button
              onClick={() => navigate('/studio/crm/activities')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ActivityTimeline
            activities={activities}
            emptyMessage="No operational activity logged yet. Actions taken across the system will appear here automatically."
          />
        </div>
      </div>
    </div>
  );
}
