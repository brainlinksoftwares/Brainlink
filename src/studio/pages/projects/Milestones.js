import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Receipt,
  ChevronRight,
  DollarSign,
  Clock,
  Target,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone, getProjects } from '../../services/projectService';

export default function Milestones() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    projectName: '',
    description: '',
    dueDate: '',
    paymentPercentage: 30,
    billingAmount: '',
    completionPercentage: 0,
    status: 'In Progress',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [mileData, projData] = await Promise.all([getMilestones(), getProjects()]);
      setMilestones(mileData);
      setProjects(projData);
    } catch (err) {
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingMilestone(null);
    const defaultProj = projects[0] || {};
    setFormData({
      name: '',
      projectId: defaultProj.id || '',
      projectName: defaultProj.name || '',
      description: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentPercentage: 30,
      billingAmount: defaultProj.budget ? Math.round((defaultProj.budget * 30) / 100) : '',
      completionPercentage: 0,
      status: 'In Progress',
    });
    setDrawerOpen(true);
  };

  const handleProjectSelect = (projId) => {
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setFormData({
        ...formData,
        projectId: proj.id,
        projectName: proj.name,
        billingAmount: proj.budget ? Math.round((proj.budget * (formData.paymentPercentage || 30)) / 100) : '',
      });
    }
  };

  const handlePercentageChange = (pct) => {
    const numericPct = Number(pct) || 0;
    const proj = projects.find(p => p.id === formData.projectId);
    setFormData({
      ...formData,
      paymentPercentage: numericPct,
      billingAmount: proj?.budget ? Math.round((proj.budget * numericPct) / 100) : formData.billingAmount,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Milestone name is required');
      return;
    }

    try {
      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, formData, userProfile?.email);
        toast.success(`Updated milestone: ${formData.name}`);
      } else {
        await createMilestone(formData, userProfile?.email);
        toast.success(`Created milestone: ${formData.name}`);
      }
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error saving milestone');
    }
  };

  const handleDelete = async () => {
    if (!milestoneToDelete) return;
    try {
      await deleteMilestone(milestoneToDelete.id, userProfile?.email);
      toast.success('Milestone removed');
      setDeleteConfirmOpen(false);
      setMilestoneToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to delete milestone');
    }
  };

  // Metrics
  const totalMilestones = milestones.length;
  const linkedVolume = milestones.reduce((sum, m) => sum + (Number(m.billingAmount) || 0), 0);
  const completedCount = milestones.filter(m => m.status === 'Completed' || m.completionPercentage === 100).length;
  const inProgressCount = milestones.filter(m => m.status === 'In Progress').length;

  const columns = [
    {
      key: 'name',
      label: 'Deliverable Milestone & Project',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {row.projectName || 'General Engineering'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'paymentPercentage',
      label: 'Linked Payout',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div className="text-right">
          <div className="font-medium text-slate-900 dark:text-white font-mono text-xs">
            {formatINR(row.billingAmount)}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
            {val}% milestone tranche
          </div>
        </div>
      ),
    },
    {
      key: 'completionPercentage',
      label: 'Progress',
      sortable: true,
      render: (val = 0) => (
        <div className="w-24">
          <div className="flex justify-between text-[11px] mb-1 text-slate-600 dark:text-slate-400 font-mono">
            <span>{val}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${val === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Milestone Deadline',
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
            onClick={() => {
              setEditingMilestone(row);
              setFormData(row);
              setDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Milestone"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setMilestoneToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Milestone"
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
            <span>Projects</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Milestones</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Milestones & Deliverable Tranches
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phase gates, client sign-off criteria, and contract-linked billing milestones
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Milestone</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Milestones"
          value={totalMilestones}
          icon={Layers}
          subtext="Indexed contract gates"
        />
        <StatCard
          label="Linked Payout Volume"
          value={formatINR(linkedVolume)}
          icon={DollarSign}
          subtext="Total contract value tied"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          subtext="Active delivery phases"
        />
        <StatCard
          label="Achieved Sign-offs"
          value={completedCount}
          icon={CheckCircle2}
          subtext="Verified & eligible for billing"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={milestones}
        searchKey={['name', 'projectName']}
        searchPlaceholder="Search milestones by title, project..."
        filterKey="status"
        filterOptions={['In Progress', 'Completed', 'Delayed', 'On Hold'].map(s => ({ label: s, value: s }))}
        onRowClick={(m) => {
          setEditingMilestone(m);
          setFormData(m);
          setDrawerOpen(true);
        }}
        exportFileName="brainlink_milestones"
        loading={loading}
        emptyMessage="No project milestones recorded yet. Click 'New Milestone' to define phase gates."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingMilestone ? `Edit Milestone: ${formData.name}` : 'Create Project Milestone'}
        subtitle="Establish deliverable scope, billing percentage, and target sign-off date"
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
              {editingMilestone ? 'Save Changes' : 'Create Milestone'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milestone Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Phase 2: Core Engine & REST API Integration"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="st-select"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Sign-off Deadline
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payout Tranche ({formData.paymentPercentage}%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.paymentPercentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Calculated Billing Value (INR ₹)
              </label>
              <input
                type="number"
                value={formData.billingAmount}
                onChange={(e) => setFormData({ ...formData, billingAmount: Number(e.target.value) })}
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Execution Progress ({formData.completionPercentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.completionPercentage}
                onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gate Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="st-select"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed & Verified</option>
                <option value="Delayed">Delayed / Blocked</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scope Checklist & Sign-off Criteria
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key technical criteria required for client sign-off..."
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
        title="Delete Milestone"
        message="Are you sure you want to delete this deliverable milestone?"
      />
    </div>
  );
}
