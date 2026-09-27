import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Layers,
  Receipt,
  CreditCard,
  FileText,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/projectService';
import { getInvoices, getPayments } from '../../services/financeService';
import { getDocuments } from '../../services/documentService';
import { generateInvoicePDF } from '../../services/pdfService';
import { getCompanySettings } from '../../services/settingsService';

export default function ClientPortal() {
  const { userProfile, role } = useAuth();

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClientData() {
      setLoading(true);
      try {
        const [projAll, invAll, payAll, docAll] = await Promise.all([
          getProjects(),
          getInvoices(),
          getPayments(),
          getDocuments(),
        ]);

        const userEmail = userProfile?.email || '';
        const userCompany = userProfile?.company || '';

        const clientInvoices = invAll.filter(
          i => i.clientEmail === userEmail || (userCompany && i.clientCompany === userCompany) || role !== 'CLIENT'
        );

        const clientProjects = projAll.filter(
          p => p.clientEmail === userEmail || (userCompany && p.clientName === userCompany) || role !== 'CLIENT'
        );

        const clientDocs = docAll.filter(
          d => (d.isPublicToClient && (d.clientEmail === userEmail || role !== 'CLIENT')) || role !== 'CLIENT'
        );

        setProjects(clientProjects);
        setInvoices(clientInvoices);
        setPayments(payAll);
        setDocuments(clientDocs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClientData();
  }, [userProfile, role]);

  const handleDownloadPDF = async (inv) => {
    const comp = await getCompanySettings();
    generateInvoicePDF(inv, comp);
  };

  const totalInvoiced = invoices.filter(i => i.status !== 'Cancelled').reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status !== 'Cancelled').reduce((s, i) => s + (i.paidAmount || 0), 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Overview</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Client Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, <strong className="text-slate-800 dark:text-slate-200">{userProfile?.displayName || userProfile?.email}</strong>. Track your deliverables, phase gates, and financial invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Client Portal
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Deliverables"
          value={projects.length}
          icon={Briefcase}
          subtext="Engineering projects in flight"
        />
        <StatCard
          label="Total Invoiced"
          value={formatINR(totalInvoiced)}
          icon={Receipt}
          subtext="Cumulative tax invoices"
        />
        <StatCard
          label="Settled to Date"
          value={formatINR(totalPaid)}
          icon={CreditCard}
          subtext="Confirmed payments"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatINR(outstanding)}
          icon={Clock}
          subtext="Due for settlement"
        />
      </div>

      {/* Projects Deliveries */}
      <div className="st-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Active Deliverables & Milestones</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{projects.length} active</span>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No projects currently active under your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {p.description || 'Sprint deliverables under active development'}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Completion</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Target: {formatDate(p.endDate)}</span>
                  <span>Budget: {formatINR(p.budget || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices & Settlement History */}
      <div className="st-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tax Invoices & Receipts</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{invoices.length} invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No invoices generated for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                  <th className="py-2.5 px-3 text-right">Paid Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900 dark:text-white font-mono">{formatINR(inv.total)}</td>
                    <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-mono">{formatINR(inv.paidAmount || 0)}</td>
                    <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
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
