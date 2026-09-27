import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  CreditCard,
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import { formatINR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { getInvoices, getPayments, getExpenses } from '../../services/financeService';
import { getProjects } from '../../services/projectService';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinanceData() {
      setLoading(true);
      try {
        const [inv, pay, exp, proj] = await Promise.all([
          getInvoices(),
          getPayments(),
          getExpenses(),
          getProjects(),
        ]);
        setInvoices(inv);
        setPayments(pay);
        setExpenses(exp);
        setProjects(proj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFinanceData();
  }, []);

  const totalBilled = invoices.filter(i => i.status !== 'Cancelled').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const collectedRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses.filter(e => !e.reversed).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netRevenue = collectedRevenue - totalExpenses;

  const outstanding = invoices
    .filter(i => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + (Number(i.outstandingAmount) !== undefined ? Number(i.outstandingAmount) : (Number(i.total) - (Number(i.paidAmount) || 0))), 0);

  const overdueInvoices = invoices.filter(i => {
    if (i.status === 'Paid' || i.status === 'Cancelled') return false;
    if (!i.dueDate) return false;
    return new Date(i.dueDate) < new Date();
  });
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (Number(i.outstandingAmount) || 0), 0);

  // Profitability by Project calculation (Section 25)
  const projectProfitability = projects.map((p) => {
    const projInvoices = invoices.filter(i => i.projectId === p.id || i.clientName === p.clientName);
    const revenue = projInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const projExpenses = expenses.filter(e => e.projectId === p.id);
    const cost = projExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    return {
      id: p.id,
      name: p.name,
      client: p.clientName,
      revenue,
      cost,
      profit,
      margin,
    };
  });

  // Mock bar comparison data
  const comparisonData = [
    { month: 'Jul 2026', Invoiced: totalBilled * 0.2, Collected: collectedRevenue * 0.25, Expenses: totalExpenses * 0.3 },
    { month: 'Aug 2026', Invoiced: totalBilled * 0.35, Collected: collectedRevenue * 0.35, Expenses: totalExpenses * 0.3 },
    { month: 'Sep 2026', Invoiced: totalBilled * 0.45, Collected: collectedRevenue * 0.4, Expenses: totalExpenses * 0.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Finance & Profitability Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cash flows, tax invoicing, ledger movements, and project margin intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/studio/finance/invoices')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={() => navigate('/studio/finance/payments')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed"
          value={formatINR(totalBilled)}
          subtext={`${invoices.length} total invoices`}
          icon={Receipt}
          color="blue"
          onClick={() => navigate('/studio/finance/invoices')}
        />
        <StatCard
          title="Cash Collected"
          value={formatINR(collectedRevenue)}
          subtext={`${payments.length} transactions received`}
          icon={CreditCard}
          color="emerald"
          onClick={() => navigate('/studio/finance/payments')}
        />
        <StatCard
          title="Operating Expenses"
          value={formatINR(totalExpenses)}
          subtext={`${expenses.length} expense vouchers`}
          icon={DollarSign}
          color="rose"
          onClick={() => navigate('/studio/finance/expenses')}
        />
        <StatCard
          title="Net Cash Profit"
          value={formatINR(netRevenue)}
          subtext="Cash Collected - Operating Costs"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatINR(outstanding)}
          subtext="Unpaid invoice receivables"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/studio/finance/invoices')}
        />
        <StatCard
          title="Overdue Receivables"
          value={formatINR(overdueAmount)}
          subtext={`${overdueInvoices.length} invoices past due`}
          icon={AlertCircle}
          color={overdueInvoices.length > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/studio/finance/invoices')}
        />
      </div>

      {/* Revenue vs Expenses vs Cash Inflow Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Financial Inflow vs Outflow</h3>
        <p className="text-xs text-slate-500 mb-4">Comparison of invoiced amounts, actual collected funds, and operating expenditures</p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val) => [formatINR(val), 'Amount']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="Invoiced" fill="#315cff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Profitability Table (Section 25) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Project Profitability & Cost Breakdown</h3>
          <p className="text-xs text-slate-500">Margin formula: Project Invoiced Revenue - Dedicated Project Costs</p>
        </div>

        {projectProfitability.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No projects available for margin analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Project & Client</th>
                  <th className="py-2.5 px-3 text-right">Invoiced Revenue</th>
                  <th className="py-2.5 px-3 text-right">Direct Costs</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectProfitability.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.client}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(p.revenue)}</td>
                    <td className="py-3 px-3 text-right text-rose-600 font-semibold">{formatINR(p.cost)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">{formatINR(p.profit)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {p.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
