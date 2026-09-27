import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  ChevronRight,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProposals, createProposal, updateProposal, deleteProposal } from '../../services/salesService';

export default function Proposals() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propToDelete, setPropToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    executiveSummary: '',
    scope: '',
    deliverables: '',
    timeline: '8 Weeks',
    pricing: '',
    terms: '50% advance upon project kickoff, 30% on milestone 2, 20% on final UAT signoff.',
    validUntil: '',
    status: 'Draft',
  });

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getProposals();
      setProposals(data);
    } catch (err) {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleOpenCreate = () => {
    setEditingProp(null);
    setFormData({
      title: '',
      clientName: '',
      clientEmail: '',
      executiveSummary: '',
      scope: '',
      deliverables: '',
      timeline: '8 Weeks',
      pricing: '',
      terms: '50% advance upon kickoff, 30% milestone 2, 20% final signoff.',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProp(p);
    setFormData(p);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) {
      toast.error('Proposal title and client name are required');
      return;
    }

    try {
      if (editingProp) {
        await updateProposal(editingProp.id, formData, userProfile?.email);
        toast.success('Proposal updated');
      } else {
        await createProposal(formData, userProfile?.email);
        toast.success('Proposal created');
      }
      setDrawerOpen(false);
      await loadProposals();
    } catch (err) {
      toast.error('Error saving proposal');
    }
  };

  const handleDelete = async () => {
    if (!propToDelete) return;
    try {
      await deleteProposal(propToDelete.id, userProfile?.email);
      toast.success('Proposal removed');
      setDeleteConfirmOpen(false);
      setPropToDelete(null);
      await loadProposals();
    } catch (err) {
      toast.error('Failed to delete proposal');
    }
  };

  // Metrics
  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter(p => p.status === 'Accepted');
  const acceptedVolume = acceptedProposals.reduce((sum, p) => sum + (Number(p.pricing) || 0), 0);
  const pendingReview = proposals.filter(p => ['Sent', 'Viewed'].includes(p.status)).length;
  const winRate = totalProposals > 0 ? Math.round((acceptedProposals.length / totalProposals) * 100) : 0;

  const columns = [
    {
      key: 'proposalNumber',
      label: 'Proposal & Scope',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{row.title}</div>
            <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {val || 'PROP-2026-0001'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Target Client',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
          <div className="text-slate-500 dark:text-slate-400">{row.clientEmail || '—'}</div>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: 'Estimated Scope',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-medium text-slate-900 dark:text-white font-mono">
          {formatINR(val)}
        </span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Validity Period',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Proposal"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setPropToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Proposal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Sales</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Proposals</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Commercial Proposals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formal technical specifications, scope architecture summaries, and pricing structures
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Proposals"
          value={totalProposals}
          icon={FileCheck2}
          subtext="Indexed documents"
        />
        <StatCard
          label="Accepted Value"
          value={formatINR(acceptedVolume)}
          icon={DollarSign}
          subtext="Won contract value"
        />
        <StatCard
          label="Under Review"
          value={pendingReview}
          icon={Send}
          subtext="Awaiting client signoff"
        />
        <StatCard
          label="Proposal Win Rate"
          value={`${winRate}%`}
          icon={CheckCircle2}
          subtext="Accepted vs submitted"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={proposals}
        searchKey={['title', 'clientName', 'proposalNumber']}
        searchPlaceholder="Search proposals by title, client, ID..."
        filterKey="status"
        filterOptions={['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'].map(s => ({ label: s, value: s }))}
        onRowClick={(p) => handleOpenEdit(p)}
        exportFileName="brainlink_proposals"
        loading={loading}
        emptyMessage="No commercial proposals recorded yet. Click 'New Proposal' to draft a proposal."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProp ? `Edit Proposal: ${formData.title}` : 'Draft Commercial Proposal'}
        subtitle="Specify technical scope, milestones, commercial deliverables, and validity"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="st-btn-secondary px-3.5 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="st-btn-primary px-4 py-1.5 text-xs shadow-sm"
            >
              {editingProp ? 'Save Changes' : 'Create Proposal'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposal Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Telehealth Mobile Platform & Video Consultation Suite"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Apex Health Systems"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Contact Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="exec@apexhealth.in"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Budget Scope (INR ₹)
              </label>
              <input
                type="number"
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                placeholder="1400000"
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Validity Deadline
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Implementation Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="e.g. 8 Weeks"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="st-select"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Viewed">Viewed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Architecture Summary
              </label>
              <textarea
                rows={2}
                value={formData.executiveSummary}
                onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
                placeholder="High-level solution overview, strategic benefits, and tech stack..."
                className="st-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scope & Key Deliverables
              </label>
              <textarea
                rows={3}
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Detailed breakdown of sprint milestones, microservices, and user-facing capabilities..."
                className="st-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commercial Payment Terms
              </label>
              <textarea
                rows={2}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Milestone milestone breakdown: e.g. 50% advance, 30% milestone 2, 20% signoff..."
                className="st-textarea"
              />
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Proposal"
        message="Are you sure you want to delete this commercial proposal draft?"
      />
    </div>
  );
}
