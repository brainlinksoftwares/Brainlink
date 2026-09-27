import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Sparkles,
  Download,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'proposalNumber',
      label: 'Proposal ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-blue-600 text-xs">{val || 'PROP-2026-0001'}</span>
          <div className="text-xs font-semibold text-slate-800 mt-0.5">{row.title}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Target',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">{row.clientEmail || '—'}</div>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: 'Budget Scope',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{formatINR(val)}</span>,
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
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
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setEditingProp(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPropToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Proposals Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build formal technical specifications, executive scope summaries, and commercial proposals
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={proposals}
        searchKey={['title', 'clientName', 'proposalNumber']}
        searchPlaceholder="Search proposals by title, client, ID..."
        filterKey="status"
        filterOptions={['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'].map(s => ({ label: s, value: s }))}
        onRowClick={(p) => {
          setEditingProp(p);
          setFormData(p);
          setModalOpen(true);
        }}
        exportFileName="brainlink_proposals"
        loading={loading}
        emptyMessage="No commercial proposals recorded yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProp ? 'Edit Proposal' : 'Draft Commercial Proposal'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Proposal
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Proposal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Telehealth Web Platform & Medical Consultation Suite"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Email</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (INR ₹)</label>
            <input
              type="number"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              placeholder="e.g. 1400000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
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
            <label className="block font-semibold text-slate-700 mb-1">Executive Summary</label>
            <textarea
              rows={2}
              value={formData.executiveSummary}
              onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
              placeholder="High-level solution overview and architectural approach..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Scope & Key Deliverables</label>
            <textarea
              rows={3}
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              placeholder="List core modules, integrations, cloud infrastructure..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Proposal"
        message="Are you sure you want to permanently delete this proposal draft?"
      />
    </div>
  );
}
