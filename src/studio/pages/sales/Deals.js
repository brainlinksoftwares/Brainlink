import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  ShieldCheck,
  Target,
  ArrowRight,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
  PIPELINE_STAGES,
} from '../../services/salesService';

const STAGE_ORDER = [
  'New Lead',
  'Qualified',
  'Meeting',
  'Proposal',
  'Negotiation',
  'Won',
];

export default function Deals() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [activeDeal, setActiveDeal] = useState(null);
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
      setDeals(data || []);
    } catch (err) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const totalValue = deals
    .filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const weightedTotal = deals
    .filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce(
      (sum, d) => sum + (Number(d.value || 0) * (Number(d.probability || 50) / 100)),
      0
    );

  const wonTotal = deals
    .filter((d) => d.stage === 'Won')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

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

  const handleRowClick = (deal) => {
    setActiveDeal(deal);
    setDetailDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Deal title is required');
      return;
    }

    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, formData);
        toast.success('Opportunity updated');
      } else {
        await createDeal(
          {
            ...formData,
            value: Number(formData.value) || 0,
            owner: formData.owner || userProfile?.displayName || 'Aaditya Vishnoi',
          },
          userProfile?.email
        );
        toast.success('Commercial opportunity created');
      }
      setDrawerOpen(false);
      loadDeals();
    } catch (err) {
      toast.error('Error saving deal');
    }
  };

  const handleDelete = async () => {
    if (!dealToDelete) return;
    try {
      await deleteDeal(dealToDelete.id);
      toast.success('Opportunity deleted');
      setDeleteConfirmOpen(false);
      setDetailDrawerOpen(false);
      loadDeals();
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  };

  const handleAdvanceStage = async (stage) => {
    if (!activeDeal) return;
    try {
      const updated = await updateDealStage(activeDeal.id, stage, userProfile?.email);
      setActiveDeal(updated);
      setDeals((prev) => prev.map((d) => (d.id === activeDeal.id ? updated : d)));
      toast.success(`Advanced to stage: ${stage}`);
    } catch (err) {
      toast.error('Failed to change stage');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Opportunity',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#315CFF]/10 text-[#315CFF] font-bold text-xs flex items-center justify-center shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'D'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-[#111318] dark:text-white hover:text-[#315CFF] transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-[#9299A6] truncate">
              {row.company || 'Enterprise Prospect'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'Qualified'} />,
    },
    {
      key: 'value',
      label: 'Contract Value',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-sans font-bold text-xs text-[#111318] dark:text-white">
          {formatINR(val || 0)}
        </span>
      ),
    },
    {
      key: 'probability',
      label: 'Probability',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-[#E7E9EE] dark:bg-[#222733] overflow-hidden">
            <div
              className="h-full bg-[#315CFF] rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, Number(val) || 50))}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#626A78] dark:text-[#9AA3B2]">
            {val || 50}%
          </span>
        </div>
      ),
    },
    {
      key: 'expectedClose',
      label: 'Target Close',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#626A78] dark:text-[#9AA3B2]">
          {val ? formatDate(val) : 'Flexible'}
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#626A78] dark:text-[#9AA3B2]">
          {val || 'Aaditya Vishnoi'}
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
            className="p-1 rounded text-[#9299A6] hover:text-[#315CFF] transition-colors"
            title="Edit Deal"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setDealToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-[#9299A6] hover:text-rose-600 transition-colors"
            title="Delete Deal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E9EE] dark:border-[#222733]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">
            Deals & Opportunities
          </h1>
          <p className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
            Commercial enterprise pipeline, contract valuations, and closing probabilities.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Active Pipeline
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {formatINR(totalValue)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Weighted Forecast
          </span>
          <div className="text-xl font-bold text-[#315CFF] mt-1">
            {formatINR(weightedTotal)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Won Revenue
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(wonTotal)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Total Deals
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {deals.length}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={deals}
        searchKey={['name', 'company', 'owner']}
        searchPlaceholder="Search deals by opportunity, company, or owner..."
        filterKey="stage"
        filterOptions={STAGE_ORDER.map((s) => ({ label: s, value: s }))}
        onRowClick={handleRowClick}
        exportFileName="brainlink_deals"
        loading={loading}
      />

      {/* SIDE DRAWER: Deal Workspace / Detail View */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={activeDeal?.name || 'Deal Workspace'}
        subtitle={activeDeal?.company || 'Commercial opportunity'}
        width="max-w-xl"
        footer={
          activeDeal && (
            <>
              <button
                type="button"
                onClick={() => {
                  setDealToDelete(activeDeal);
                  setDeleteConfirmOpen(true);
                }}
                className="st-btn-danger st-btn-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(activeDeal)}
                className="st-btn-primary st-btn-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>
            </>
          )
        }
      >
        {activeDeal && (
          <div className="space-y-5 text-xs">
            {/* Header Workspace Card */}
            <div className="p-4 rounded-lg border border-[#E7E9EE] dark:border-[#222733] bg-white dark:bg-[#10131A]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111318] dark:text-white">
                    {activeDeal.name}
                  </h3>
                  <div className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
                    {activeDeal.company || 'Enterprise Client'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#111318] dark:text-white font-sans">
                    {formatINR(activeDeal.value || 0)}
                  </div>
                  <div className="text-[11px] text-[#315CFF] font-semibold mt-0.5">
                    {activeDeal.stage || 'Qualified'}
                  </div>
                </div>
              </div>

              {/* Pipeline Progress Stepper */}
              <div className="mt-4 pt-3 border-t border-[#E7E9EE] dark:border-[#222733]">
                <div className="text-[10px] uppercase font-semibold text-[#9299A6] tracking-wider mb-2">
                  Pipeline Stage Progression
                </div>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-[#E7E9EE] dark:bg-[#222733] -translate-y-1/2 z-0" />
                  {STAGE_ORDER.map((stageName, index) => {
                    const currentIdx = STAGE_ORDER.indexOf(activeDeal.stage || 'Qualified');
                    const isPassed = index <= currentIdx;
                    const isCurrent = index === currentIdx;

                    return (
                      <button
                        key={stageName}
                        onClick={() => handleAdvanceStage(stageName)}
                        className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all`}
                        title={`Click to set stage: ${stageName}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            isCurrent
                              ? 'bg-[#315CFF] text-white border-[#315CFF] ring-4 ring-[#315CFF]/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-[#10131A] text-[#9299A6] border-[#E7E9EE] dark:border-[#222733]'
                          }`}
                        >
                          {isPassed && !isCurrent ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={`text-[9px] mt-1 hidden sm:block whitespace-nowrap ${
                            isCurrent
                              ? 'font-bold text-[#315CFF]'
                              : isPassed
                              ? 'font-medium text-[#111318] dark:text-white'
                              : 'text-[#9299A6]'
                          }`}
                        >
                          {stageName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deal Parameters */}
            <div className="st-card p-4 space-y-2.5">
              <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider">
                Deal Parameters
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-[#626A78] dark:text-[#9AA3B2]">Probability:</span>
                <span className="font-semibold text-[#111318] dark:text-white">
                  {activeDeal.probability || 50}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#626A78] dark:text-[#9AA3B2]">Target Close:</span>
                <span className="font-semibold text-[#111318] dark:text-white">
                  {activeDeal.expectedClose || 'Open'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#626A78] dark:text-[#9AA3B2]">Deal Owner:</span>
                <span className="text-[#111318] dark:text-white">
                  {activeDeal.owner || 'Aaditya Vishnoi'}
                </span>
              </div>
            </div>

            {/* Notes */}
            {activeDeal.notes && (
              <div className="st-card p-4">
                <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider mb-1.5">
                  Deal Strategy & Notes
                </h4>
                <p className="text-[#626A78] dark:text-[#9AA3B2] whitespace-pre-wrap leading-relaxed">
                  {activeDeal.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* SIDE DRAWER: Create / Edit Deal */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingDeal ? `Edit Deal: ${formData.name}` : 'New Commercial Opportunity'}
        subtitle="Specify contract parameters, closing timeline, and probability"
        width="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="st-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" form="deal-form" className="st-btn-primary">
              {editingDeal ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </>
        }
      >
        <form id="deal-form" onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Website Modernization"
              className="st-input"
            />
          </div>

          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Company / Client Name
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Technologies"
              className="st-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Deal Value (INR) *
              </label>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="125000"
                className="st-input font-sans"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="st-select w-full"
              >
                {STAGE_ORDER.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Probability ({formData.probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.probability}
                onChange={(e) =>
                  setFormData({ ...formData, probability: Number(e.target.value) })
                }
                className="w-full mt-2 accent-[#315CFF]"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expectedClose}
                onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                className="st-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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

          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Notes & Deal Strategy
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Strategic deliverables, client expectations, timeline..."
              className="st-textarea"
            />
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
