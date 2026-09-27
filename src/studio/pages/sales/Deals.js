import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Target,
  Percent,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(true);
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
    setDrawerOpen(true);
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
      setDrawerOpen(false);
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

  // KPI calculations
  const totalPipeline = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const weightedPipeline = deals.reduce((sum, d) => sum + ((Number(d.value) || 0) * ((Number(d.probability) || 0) / 100)), 0);
  const activeDeals = deals.filter(d => !['Won', 'Lost'].includes(d.stage)).length;
  const wonDeals = deals.filter(d => d.stage === 'Won').length;

  const columns = [
    {
      key: 'name',
      label: 'Opportunity & Account',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{row.company || 'Direct Account'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Contract Value',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div className="text-right">
          <div className="font-medium text-slate-900 dark:text-white font-mono">{formatINR(val)}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Wt: {formatINR(row.weightedValue || Math.round((Number(val) * (Number(row.probability) || 50)) / 100))}
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
      key: 'probability',
      label: 'Probability',
      sortable: true,
      render: (val) => (
        <div className="w-24">
          <div className="flex justify-between text-[11px] mb-1 text-slate-600 dark:text-slate-400 font-mono">
            <span>{val || 50}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (val || 50) >= 80 ? 'bg-emerald-500' : (val || 50) >= 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${val || 50}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'expectedClose',
      label: 'Target Close',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {val || 'Unassigned'}
        </span>
      ),
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
            title="Edit Deal"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setDealToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Deal"
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
            <span className="text-slate-900 dark:text-white font-medium">Deals</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Opportunity Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Commercial deals register with weighted probability forecasting and stage tracking
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Pipeline"
          value={formatINR(totalPipeline)}
          icon={DollarSign}
          subtext="Unweighted total value"
        />
        <StatCard
          label="Weighted Forecast"
          value={formatINR(Math.round(weightedPipeline))}
          icon={Target}
          subtext="Probability-adjusted volume"
        />
        <StatCard
          label="Active Deals"
          value={activeDeals}
          icon={TrendingUp}
          subtext="Under active pursuit"
        />
        <StatCard
          label="Deals Won"
          value={wonDeals}
          icon={ShieldCheck}
          subtext="Successfully closed"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={deals}
        searchKey={['name', 'company', 'owner']}
        searchPlaceholder="Search deals by opportunity, company, or owner..."
        filterKey="stage"
        filterOptions={PIPELINE_STAGES.map(s => ({ label: s.name, value: s.id }))}
        onRowClick={(d) => handleOpenEdit(d)}
        exportFileName="brainlink_deals"
        loading={loading}
        emptyMessage="No commercial opportunities found. Click 'New Deal' to register a pipeline opportunity."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingDeal ? `Edit Deal: ${formData.name}` : 'New Commercial Opportunity'}
        subtitle="Specify value parameters, closing timeline, and probability"
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
              {editingDeal ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity / Deal Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Core Banking Platform Modernization"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Account / Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Apex Global Solutions"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deal Value (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="500000"
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="st-select"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Probability ({formData.probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expectedClose}
                onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deal Owner
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Aaditya Vishnoi"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes & Deal Strategy
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Client pain points, competitor dynamics, pricing considerations..."
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
        title="Delete Opportunity"
        message={`Are you sure you want to delete deal "${dealToDelete?.name}"?`}
      />
    </div>
  );
}
