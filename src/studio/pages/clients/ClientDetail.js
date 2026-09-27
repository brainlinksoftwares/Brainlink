import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingUp,
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const clientData = await getClientById(id);
      if (!clientData) {
        toast.error('Client not found');
        navigate('/clients');
        return;
      }
      setClient(clientData);

      const [projAll, invAll, payAll, dealAll, docAll, actAll] = await Promise.all([
        getProjects(),
        getInvoices(),
        getPayments(),
        getDeals(),
        getDocuments(),
        getActivities(20),
      ]);

      const clientName = clientData.companyName;
      setProjects(projAll.filter(p => p.clientName === clientName || p.clientId === id));
      setInvoices(invAll.filter(i => i.clientCompany === clientName || i.clientName === clientName || i.clientId === id));
      setPayments(payAll.filter(p => p.clientName === clientName || p.clientId === id));
      setDeals(dealAll.filter(d => d.company === clientName || d.clientId === id));
      setDocuments(docAll.filter(d => d.clientName === clientName || d.clientId === id));
      setActivities(actAll.filter(a => a.entityId === id || (a.details && a.details.includes(clientName))));
    } catch (err) {
      toast.error('Failed to load client profile');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !client) {
    return (
      <div className="py-20 text-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading client workspace...</p>
      </div>
    );
  }

  // Financial computations
  const totalBilled = invoices.filter(i => i.status !== 'Cancelled').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: projects.length },
    { id: 'invoices', label: 'Invoices', icon: Receipt, count: invoices.length },
    { id: 'deals', label: 'Pipeline Deals', icon: TrendingUp, count: deals.length },
    { id: 'documents', label: 'Vault Files', icon: FileText, count: documents.length },
    { id: 'activity', label: 'Activity Log', icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/clients')}
          className="st-btn-ghost st-btn-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Clients
        </button>
      </div>

      {/* Client 360 Workspace Header */}
      <div className="st-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center shrink-0">
              {client.companyName ? client.companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {client.companyName}
                </h1>
                <StatusBadge status={client.status || 'Active'} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                {client.primaryContact && <span>Attn: {client.primaryContact}</span>}
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </span>
                )}
                {client.gstin && <span className="font-mono">GSTIN: {client.gstin}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/projects')}
              className="st-btn-secondary st-btn-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
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

        {/* Financial KPI Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Lifetime Value
            </span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatINR(totalBilled)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Collected Cash
            </span>
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {formatINR(totalPaid)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Outstanding Due
            </span>
            <span className={`font-mono text-base font-bold mt-0.5 block ${outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatINR(outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="st-card p-4 space-y-3 text-xs">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Corporate & Tax Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Legal Name:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{client.companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{client.gstin || 'Not registered'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">PAN:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{client.pan || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Billing Address:</span>
                <span className="text-right text-slate-800 dark:text-slate-200 max-w-xs">{client.billingAddress || 'India'}</span>
              </div>
            </div>
          </div>

          <div className="st-card p-4 space-y-3 text-xs">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Engagement Timeline
            </h3>
            <ActivityTimeline activities={activities} limit={4} />
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="st-card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Deliveries ({projects.length})
            </h3>
            <button onClick={() => navigate('/projects')} className="st-btn-primary st-btn-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No active projects for this client yet.</div>
            ) : (
              projects.map(p => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400">Target Delivery: {p.deadline || 'Flexible'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formatINR(p.budget || 0)}</span>
                    <StatusBadge status={p.status || 'Active'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="st-card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Invoices & Billing History ({invoices.length})
            </h3>
            <button onClick={() => navigate('/finance/invoices')} className="st-btn-primary st-btn-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Invoice</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {invoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No invoices issued to this client yet.</div>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-400">Due: {inv.dueDate || 'Upon receipt'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(inv.total || 0)}</span>
                    <StatusBadge status={inv.status || 'Sent'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="st-card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Sales Pipeline Opportunities ({deals.length})
            </h3>
            <button onClick={() => navigate('/sales/pipeline')} className="st-btn-primary st-btn-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New Deal</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {deals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No opportunities recorded for this client.</div>
            ) : (
              deals.map(d => (
                <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400">Stage: {d.stage} ({d.probability || 50}%)</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(d.value || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="st-card p-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
            Contracts & Deliverable Files ({documents.length})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No documents stored for this client.</div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</span>
                  </div>
                  <a href={doc.downloadUrl || doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    View / Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="st-card p-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
            Chronological Audit History
          </h3>
          <div className="mt-3">
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      )}
    </div>
  );
}
