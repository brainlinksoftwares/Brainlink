import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'name',
      label: 'Milestone & Project',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.projectName || 'General Engineering'}</div>
        </div>
      ),
    },
    {
      key: 'paymentPercentage',
      label: 'Linked Billing',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{formatINR(row.billingAmount)}</div>
          <div className="text-[10px] text-blue-600 font-semibold">{val}% milestone payout</div>
        </div>
      ),
    },
    {
      key: 'completionPercentage',
      label: 'Completion',
      sortable: true,
      render: (val = 0) => (
        <div className="w-24 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>{val}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
      label: 'Due Date',
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
              setEditingMilestone(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMilestoneToDelete(row);
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
            Project Milestones & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard milestone-linked billing schedules (e.g. 30% Architecture, 40% Core, 30% UAT)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Milestone</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={milestones}
        searchKey={['name', 'projectName']}
        searchPlaceholder="Search milestones by title, project..."
        filterKey="status"
        filterOptions={['Pending', 'In Progress', 'Completed'].map(s => ({ label: s, value: s }))}
        onRowClick={(m) => {
          setEditingMilestone(m);
          setFormData(m);
          setModalOpen(true);
        }}
        exportFileName="brainlink_milestones"
        loading={loading}
        emptyMessage="No project milestones configured."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMilestone ? 'Edit Milestone' : 'Add Project Milestone'}
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
              Save Milestone
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Milestone Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Phase 2: Video Consultation & EHR Module"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Payout (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.paymentPercentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Billing Amount (INR ₹)</label>
            <input
              type="number"
              value={formData.billingAmount}
              onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
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
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Completion Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.completionPercentage}
              onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Milestone"
        message="Are you sure you want to delete this project milestone?"
      />
    </div>
  );
}
