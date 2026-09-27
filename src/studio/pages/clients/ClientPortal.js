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

        // If client user, filter strictly by client email or company
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
      {/* Client Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Brainlink Client Portal</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
          Welcome, {userProfile?.displayName || userProfile?.email}
        </h1>
        <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
          Monitor your ongoing software deliverables, inspect phase milestones, view verified GST tax invoices, and access project contracts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-800/60">
          <div>
            <div className="text-[11px] text-blue-300 font-semibold uppercase">Active Projects</div>
            <div className="text-xl font-bold mt-0.5">{projects.length}</div>
          </div>
          <div>
            <div className="text-[11px] text-blue-300 font-semibold uppercase">Total Invoiced</div>
            <div className="text-xl font-bold mt-0.5">{formatINR(totalInvoiced)}</div>
          </div>
          <div>
            <div className="text-[11px] text-blue-300 font-semibold uppercase">Balance Outstanding</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{formatINR(outstanding)}</div>
          </div>
        </div>
      </div>

      {/* Projects Deliveries */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Active Projects & Milestones</span>
        </h2>

        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No projects currently active under your account.
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Delivery Completion</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices & Settlement History */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>Your Invoices & Receipts</span>
        </h2>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No invoices generated for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(inv.total)}</td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-semibold">{formatINR(inv.paidAmount || 0)}</td>
                    <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
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
