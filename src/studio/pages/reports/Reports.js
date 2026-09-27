import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Receipt,
  FolderGit2,
  Building2,
  Users,
  ChevronRight,
  DollarSign,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatINR, formatDate, exportToCSV } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { getLeads } from '../../services/crmService';
import { getDeals } from '../../services/salesService';
import { getInvoices, getPayments, getExpenses } from '../../services/financeService';
import { getProjects } from '../../services/projectService';
import { getClients } from '../../services/clientService';

export default function Reports() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [l, d, inv, pay, exp, prj, cli] = await Promise.all([
          getLeads(),
          getDeals(),
          getInvoices(),
          getPayments(),
          getExpenses(),
          getProjects(),
          getClients(),
        ]);
        setLeads(l);
        setDeals(d);
        setInvoices(inv);
        setPayments(pay);
        setExpenses(exp);
        setProjects(prj);
        setClients(cli);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const tabs = [
    { id: 'sales', label: 'Sales & Pipeline', icon: TrendingUp },
    { id: 'finance', label: 'Financial Telemetry', icon: Receipt },
    { id: 'projects', label: 'Delivery Health', icon: FolderGit2 },
    { id: 'clients', label: 'Corporate Accounts', icon: Building2 },
  ];

  // Sales calculations
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const wonRevenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const totalPipeline = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').reduce((s, d) => s + (d.value || 0), 0);

  // Finance calculations
  const totalInvoiced = invoices.filter(i => i.status !== 'Cancelled').reduce((s, i) => s + (i.total || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpenses = expenses.filter(e => !e.reversed).reduce((s, e) => s + (e.amount || 0), 0);
  const netRevenue = totalCollected - totalExpenses;

  const handleExportSales = () => {
    exportToCSV('sales_report', deals);
    toast.success('Exported Sales Report CSV');
  };

  const handleExportFinance = () => {
    exportToCSV('finance_invoices_report', invoices);
    toast.success('Exported Invoices Report CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Business Intelligence</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Executive Intelligence & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-module aggregated analytics for revenue, pipeline conversion, project velocity, and profit margins
          </p>
        </div>

        <button
          onClick={activeTab === 'sales' ? handleExportSales : handleExportFinance}
          className="st-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {activeTab === 'sales' ? 'Sales' : 'Financial'} CSV</span>
        </button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Closed Won Revenue"
              value={formatINR(wonRevenue)}
              icon={TrendingUp}
              subtext={`${wonDeals.length} won contracts`}
            />
            <StatCard
              label="Active Pipeline"
              value={formatINR(totalPipeline)}
              icon={DollarSign}
              subtext="Unclosed commercial volume"
            />
            <StatCard
              label="Lead Generation"
              value={leads.length}
              icon={Users}
              subtext={`${leads.filter(l => l.status === 'Qualified').length} qualified prospects`}
            />
          </div>

          <div className="st-card p-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                Commercial Pipeline Register
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Opportunity</th>
                    <th className="py-2.5 px-3">Company Account</th>
                    <th className="py-2.5 px-3 text-right">Value (INR)</th>
                    <th className="py-2.5 px-3 text-right">Probability</th>
                    <th className="py-2.5 px-3">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {deals.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">{d.name}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{d.company}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-white">{formatINR(d.value)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">{d.probability}%</td>
                      <td className="py-2.5 px-3 font-sans"><StatusBadge status={d.stage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Invoiced" value={formatINR(totalInvoiced)} icon={Receipt} subtext="Tax billings" />
            <StatCard label="Cash Collected" value={formatINR(totalCollected)} icon={DollarSign} subtext="Reconciled settlements" />
            <StatCard label="Operating Costs" value={formatINR(totalExpenses)} icon={Receipt} subtext="Approved vouchers" />
            <StatCard label="Net Cash Margin" value={formatINR(netRevenue)} icon={TrendingUp} subtext="Cash flow profitability" />
          </div>

          <div className="st-card p-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                Billing & GST Ledger Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Gross Total</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{inv.clientCompany || inv.clientName}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">{formatINR(inv.taxableAmount || inv.subtotal)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">{formatINR(inv.totalTax || 0)}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-white">{formatINR(inv.total)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                        {formatINR(inv.outstandingAmount !== undefined ? inv.outstandingAmount : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="st-card p-5 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Project Delivery Health & Progress
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Project Deliverable</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{p.clientName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(p.budget)}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-blue-600 dark:text-blue-400">{p.progress || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="st-card p-5 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Corporate Account Concentration
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Client Organization</th>
                  <th className="py-2.5 px-3">Liaison Contact</th>
                  <th className="py-2.5 px-3 font-mono">GSTIN</th>
                  <th className="py-2.5 px-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{c.companyName}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{c.primaryContact || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{c.gstin || 'Unregistered'}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
