import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
  FolderGit2,
  Receipt,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClientById } from '../../services/clientService';
import { getProjects } from '../../services/projectService';
import { getInvoices, getPayments } from '../../services/financeService';
import { getDeals } from '../../services/salesService';
import { getDocuments } from '../../services/documentService';
import { getActivities } from '../../services/crmService';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deals, setDeals] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const clientData = await getClientById(id);
        if (!clientData) {
          toast.error('Client not found');
          navigate('/studio/clients');
          return;
        }
        setClient(clientData);

        const [projAll, invAll, payAll, dealAll, docAll, actAll] = await Promise.all([
          getProjects(),
          getInvoices(),
          getPayments(),
          getDeals(),
          getDocuments(),
          getActivities(30),
        ]);

        // Filter for this client
        setProjects(projAll.filter(p => p.clientId === id || p.clientName === clientData.companyName));
        setInvoices(invAll.filter(i => i.clientId === id || i.clientName === clientData.companyName));
        setPayments(payAll.filter(p => p.clientName === clientData.companyName));
        setDeals(dealAll.filter(d => d.company === clientData.companyName));
        setDocuments(docAll.filter(d => d.clientName === clientData.companyName || d.entityId === id));
        setActivities(actAll.filter(a => a.entityName === clientData.companyName || a.entityId === id));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading client profile...</div>;
  }

  if (!client) return null;

  const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'finance', label: 'Invoices & Payments', count: invoices.length },
    { id: 'sales', label: 'Deals & Proposals', count: deals.length },
    { id: 'documents', label: 'Documents', count: documents.length },
    { id: 'activity', label: 'Timeline & History' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/studio/clients')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={client.status || 'Active'} />
          <button
            onClick={() => navigate(`/studio/clients/onboarding`)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Onboarding Checklist ({client.onboardingProgress || 0}%)
          </button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center font-bold text-xl shadow-xs">
              {client.companyName ? client.companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                {client.companyName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Contact: <strong className="text-slate-700">{client.primaryContact || '—'}</strong></span>
                <span>•</span>
                {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>}
                <span>•</span>
                {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Billed</div>
              <div className="text-base font-bold text-slate-900">{formatINR(totalInvoiced)}</div>
            </div>
            <div className="text-right pl-4 border-l border-slate-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Outstanding</div>
              <div className="text-base font-bold text-amber-600">{formatINR(outstanding)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard title="Active Projects" value={projects.filter(p => p.status === 'Active').length} icon={FolderGit2} color="blue" />
              <StatCard title="Cash Collected" value={formatINR(totalPaid)} icon={CreditCard} color="emerald" />
              <StatCard title="Total Deals" value={deals.length} icon={Building2} color="indigo" />
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Active Deliveries & Projects</h3>
              {projects.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No active projects assigned yet.</div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate('/studio/projects')}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{p.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Budget: {formatINR(p.budget)} • Progress: {p.progress || 0}%</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm text-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Corporate Tax & Billing Details
              </h3>
              <div>
                <span className="text-slate-400 block">GSTIN</span>
                <span className="font-mono font-semibold text-slate-800">{client.gstin || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">PAN</span>
                <span className="font-mono font-semibold text-slate-800">{client.pan || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Registered Billing Address</span>
                <span className="text-slate-700 leading-relaxed block mt-0.5">{client.billingAddress || 'India'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Projects History</h3>
            <button
              onClick={() => navigate('/studio/projects')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              + Create Project
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No projects linked to this client.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{p.name}</div>
                    <div className="text-[11px] text-slate-500">Manager: {p.projectManager || 'Aaditya Vishnoi'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">{formatINR(p.budget)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Client Invoices & Settlements</h3>
            <button
              onClick={() => navigate('/studio/finance/invoices')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              + New Invoice
            </button>
          </div>
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No invoices issued to this client yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-500">Issued: {formatDate(inv.invoiceDate)} • Due: {formatDate(inv.dueDate)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{formatINR(inv.total)}</div>
                      <div className="text-[10px] text-slate-400">Paid: {formatINR(inv.paidAmount || 0)}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <ActivityTimeline activities={activities} />
        </div>
      )}
    </div>
  );
}
