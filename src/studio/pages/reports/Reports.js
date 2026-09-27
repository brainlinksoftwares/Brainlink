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
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import StatCard from '../../components/ui/StatCard';
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
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { id: 'finance', label: 'Financial Performance', icon: Receipt },
    { id: 'projects', label: 'Project Health & Workload', icon: FolderGit2 },
    { id: 'clients', label: 'Client Accounts & Revenue', icon: Building2 },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Business Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 42 reporting: automated multi-dimensional analytics for revenue, pipeline, and delivery margins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === 'sales' ? handleExportSales : handleExportFinance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Deals Closed (Won)" value={formatINR(wonRevenue)} subtext={`${wonDeals.length} won contracts`} icon={TrendingUp} color="emerald" />
            <StatCard title="Active Pipeline Volume" value={formatINR(totalPipeline)} subtext="Unclosed opportunities" icon={TrendingUp} color="blue" />
            <StatCard title="Total Leads Generated" value={leads.length} subtext={`${leads.filter(l => l.status === 'Qualified').length} qualified`} icon={Users} color="indigo" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Deals Summary Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Deal Name</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3 text-right">Value (INR)</th>
                    <th className="py-2.5 px-3 text-right">Probability</th>
                    <th className="py-2.5 px-3">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.company}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(d.value)}</td>
                      <td className="py-2.5 px-3 text-right">{d.probability}%</td>
                      <td className="py-2.5 px-3"><span className="font-semibold text-blue-600">{d.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard title="Total Invoiced" value={formatINR(totalInvoiced)} icon={Receipt} color="blue" />
            <StatCard title="Cash Collected" value={formatINR(totalCollected)} icon={Receipt} color="emerald" />
            <StatCard title="Operating Costs" value={formatINR(totalExpenses)} icon={Receipt} color="rose" />
            <StatCard title="Net Cash Margin" value={formatINR(netRevenue)} icon={Receipt} color="emerald" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Billing & Tax Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">Tax</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inv.clientCompany || inv.clientName}</td>
                      <td className="py-2.5 px-3 text-right">{formatINR(inv.taxableAmount || inv.subtotal)}</td>
                      <td className="py-2.5 px-3 text-right">{formatINR(inv.totalTax || 0)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(inv.total)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">{formatINR(inv.outstandingAmount !== undefined ? inv.outstandingAmount : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Project Delivery Health</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.clientName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(p.budget)}</td>
                    <td className="py-2.5 px-3"><span className="font-semibold text-blue-600">{p.status}</span></td>
                    <td className="py-2.5 px-3 text-right font-semibold">{p.progress || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Client Revenue Concentration</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Client Organization</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.companyName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.primaryContact || '—'}</td>
                    <td className="py-2.5 px-3 font-mono">{c.gstin || '—'}</td>
                    <td className="py-2.5 px-3"><span className="font-semibold text-emerald-600">{c.status}</span></td>
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
