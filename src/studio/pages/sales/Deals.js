import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDeals, createDeal, updateDeal, deleteDeal, PIPELINE_STAGES } from '../../services/salesService';

export default function Deals() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    value: '',
    probability: 50,
    stage: 'Qualified',
    expectedClose: '',
    priority: 'Medium',
    owner: '',
    notes: '',
  });

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleOpenCreate = () => {
    setEditingDeal(null);
    setFormData({
      name: '',
      company: '',
      value: '',
      probability: 50,
      stage: 'Qualified',
      expectedClose: '',
      priority: 'Medium',
      owner: userProfile?.displayName || 'Aaditya Vishnoi',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name || '',
      company: deal.company || '',
      value: deal.value || '',
      probability: deal.probability !== undefined ? deal.probability : 50,
      stage: deal.stage || 'Qualified',
      expectedClose: deal.expectedClose || '',
      priority: deal.priority || 'Medium',
      owner: deal.owner || '',
      notes: deal.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Deal title is required');
      return;
    }

    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, formData, userProfile?.email);
        toast.success(`Updated deal: ${formData.name}`);
      } else {
        await createDeal(formData, userProfile?.email);
        toast.success(`Created deal: ${formData.name}`);
      }
      setModalOpen(false);
      await loadDeals();
    } catch (err) {
      toast.error('Error saving deal');
    }
  };

  const handleDelete = async () => {
    if (!dealToDelete) return;
    try {
      await deleteDeal(dealToDelete.id, userProfile?.email);
      toast.success('Deal deleted');
      setDeleteConfirmOpen(false);
      setDealToDelete(null);
      await loadDeals();
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Deal Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.company || 'Direct'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Deal Value',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{formatINR(val)}</div>
          <div className="text-[10px] text-slate-400">
            Weighted: {formatINR(row.weightedValue)} ({row.probability}%)
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'expectedClose',
      label: 'Expected Close',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'Deal Owner',
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-slate-700">{val || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDealToDelete(row);
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
            Opportunities & Deals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tabular register of commercial opportunities with probabilistic forecasting
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={deals}
        searchKey={['name', 'company', 'owner']}
        searchPlaceholder="Search deals by title, company, owner..."
        filterKey="stage"
        filterOptions={PIPELINE_STAGES.map(s => ({ label: s.name, value: s.id }))}
        onRowClick={(d) => handleOpenEdit(d)}
        exportFileName="brainlink_deals"
        loading={loading}
        emptyMessage="No deals found. Create a deal to populate pipeline."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDeal ? 'Edit Opportunity' : 'New Deal Opportunity'}
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
              Save Deal
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deal Value (INR ₹) *</label>
            <input
              type="number"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expected Close</label>
            <input
              type="date"
              value={formData.expectedClose}
              onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete deal "${dealToDelete?.name}"?`}
      />
    </div>
  );
}
