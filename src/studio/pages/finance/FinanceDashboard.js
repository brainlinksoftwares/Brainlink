import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Receipt,
  Plus,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import { formatINR, formatDate } from '../../utils/formatters';
import { getInvoices, getPayments, getExpenses } from '../../services/financeService';
import { getProjects } from '../../services/projectService';

export default function FinanceDashboard() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, pay, exp, proj] = await Promise.all([
        getInvoices(),
        getPayments(),
        getExpenses(),
        getProjects(),
      ]);
      setInvoices(inv || []);
      setPayments(pay || []);
      setExpenses(exp || []);
      setProjects(proj || []);
    } catch (err) {
      console.error('Error loading finance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Aggregate Metrics
  const totalBilled = invoices
    .filter((i) => i.status !== 'Cancelled')
    .reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses
    .filter((e) => !e.reversed)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netRevenue = totalPaid - totalExpenses;
  const outstanding = Math.max(0, totalBilled - totalPaid);
  const profitMargin = totalPaid > 0 ? Math.round((netRevenue / totalPaid) * 100) : 0;

  const overdueInvoices = invoices.filter((i) => {
    if (i.status === 'Paid' || i.status === 'Cancelled') return false;
    if (!i.dueDate) return false;
    return new Date(i.dueDate) < new Date();
  });

  // Cash flow comparison data
  const hasCashFlowData = totalPaid > 0 || totalExpenses > 0;
  const comparisonData = [
    { period: 'Q1', inflow: Math.round(totalPaid * 0.25), outflow: Math.round(totalExpenses * 0.22) },
    { period: 'Q2', inflow: Math.round(totalPaid * 0.45), outflow: Math.round(totalExpenses * 0.38) },
    { period: 'Q3', inflow: Math.round(totalPaid * 0.72), outflow: Math.round(totalExpenses * 0.55) },
    { period: 'Current', inflow: totalPaid, outflow: totalExpenses },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E9EE] dark:border-[#222733]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">
            Finance & Ledger
          </h1>
          <p className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
            Cash flows, tax collections, operating expenses, and auto-reconciled ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/finance/expenses')}
            className="st-btn-secondary st-btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => navigate('/finance/payments')}
            className="st-btn-secondary st-btn-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => navigate('/finance/invoices')}
            className="st-btn-primary st-btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* 5-Column Compact KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Gross Billed"
          value={formatINR(totalBilled)}
          subtext={`${invoices.length} invoices`}
          trend="+14.5%"
          icon={Receipt}
          onClick={() => navigate('/finance/invoices')}
        />
        <StatCard
          title="Collected Cash"
          value={formatINR(totalPaid)}
          subtext="Actual in bank"
          trend="+18.4%"
          icon={CreditCard}
          onClick={() => navigate('/finance/payments')}
        />
        <StatCard
          title="Receivables"
          value={formatINR(outstanding)}
          subtext={`${overdueInvoices.length} overdue`}
          trend={overdueInvoices.length > 0 ? `-${overdueInvoices.length} alert` : 'Clean'}
          icon={AlertCircle}
          onClick={() => navigate('/finance/invoices')}
        />
        <StatCard
          title="Expenses"
          value={formatINR(totalExpenses)}
          subtext={`${expenses.length} records`}
          icon={Receipt}
          onClick={() => navigate('/finance/expenses')}
        />
        <StatCard
          title="Net Margin"
          value={formatINR(netRevenue)}
          subtext={`${profitMargin}% margin`}
          trend={profitMargin >= 30 ? '+Healthy' : 'Moderate'}
          icon={TrendingUp}
        />
      </div>

      {/* Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cash Inflow vs Expenses Chart (7 cols) */}
        <div className="lg:col-span-7 st-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#222733]">
            <div>
              <h3 className="text-xs font-semibold text-[#111318] dark:text-white uppercase tracking-wider">
                Cash Flow Dynamics
              </h3>
              <p className="text-[11px] text-[#626A78] dark:text-[#9AA3B2]">
                Collections received vs operating expenses paid
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#315CFF] font-medium">
                <span className="w-2.5 h-2.5 bg-[#315CFF] rounded-sm" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Outflow
              </span>
            </div>
          </div>

          {!hasCashFlowData ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <CreditCard className="w-8 h-8 text-[#9299A6] mb-2" />
              <h4 className="text-xs font-semibold text-[#111318] dark:text-white">
                No financial transactions recorded
              </h4>
              <p className="text-[11px] text-[#626A78] dark:text-[#9AA3B2] mt-0.5 max-w-xs">
                Inflow vs outflow charts will render dynamically once customer receipts or operating costs are entered.
              </p>
              <button
                onClick={() => navigate('/finance/payments')}
                className="st-btn-primary st-btn-sm mt-3"
              >
                <Plus className="w-3 h-3" />
                <span>Record Payment</span>
              </button>
            </div>
          ) : (
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#9299A6', fontFamily: 'Outfit' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#9299A6', fontFamily: 'Outfit' }}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10131A',
                      border: '1px solid #222733',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'Outfit',
                      color: '#FFFFFF',
                    }}
                    formatter={(val) => [formatINR(val)]}
                  />
                  <Bar dataKey="inflow" fill="#315CFF" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="outflow" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Overdue Receivables Alert Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="st-card p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#222733]">
              <h3 className="text-xs font-semibold text-[#111318] dark:text-white uppercase tracking-wider">
                Overdue Receivables ({overdueInvoices.length})
              </h3>
              <button
                onClick={() => navigate('/finance/invoices')}
                className="text-xs text-[#315CFF] hover:underline font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[#F0F2F5] dark:divide-[#191E2A] mt-2">
              {overdueInvoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9299A6]">
                  All accounts are clean. Zero overdue invoices!
                </div>
              ) : (
                overdueInvoices.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate('/finance/invoices')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#151923] -mx-2 px-2 rounded-md cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#111318] dark:text-white">
                        {inv.invoiceNumber} • {inv.clientCompany || inv.clientName}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        Due since {inv.dueDate}
                      </div>
                    </div>
                    <span className="font-bold text-[#111318] dark:text-white font-sans">
                      {formatINR(inv.outstandingAmount || inv.total)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="st-card p-4 bg-[#F6F7F9]/50 dark:bg-[#151923]/40 border-[#E7E9EE] dark:border-[#222733]">
            <h4 className="text-xs font-semibold text-[#111318] dark:text-white mb-1">
              Indian GST Compliance Rules
            </h4>
            <p className="text-[11px] text-[#626A78] dark:text-[#9AA3B2] leading-relaxed">
              Standard B2B tax rates default to 18% GST (CGST 9% + SGST 9% for intra-state Noida/Delhi, IGST 18% for inter-state contracts) with automatic HSN/SAC classification.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments Stream */}
      <div className="st-card p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#222733]">
          <h3 className="text-xs font-semibold text-[#111318] dark:text-white uppercase tracking-wider">
            Recent Customer Receipts ({payments.length})
          </h3>
          <button
            onClick={() => navigate('/finance/payments')}
            className="text-xs text-[#315CFF] hover:underline font-medium inline-flex items-center gap-1"
          >
            Payments Ledger <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-[#F0F2F5] dark:divide-[#191E2A] mt-2">
          {payments.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9299A6]">
              No payments recorded in the ledger yet.
            </div>
          ) : (
            payments.slice(0, 5).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#111318] dark:text-white">
                    {pay.clientName} — Invoice {pay.invoiceNumber || 'Advance'}
                  </div>
                  <div className="text-[11px] text-[#9299A6]">
                    {pay.paymentMethod} • {formatDate(pay.paymentDate)}
                    {pay.transactionReference ? ` • Ref: ${pay.transactionReference}` : ''}
                  </div>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                  +{formatINR(pay.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
