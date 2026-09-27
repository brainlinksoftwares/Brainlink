import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectClosureStep,
  PROJECT_CLOSURE_STEPS,
} from '../../services/projectService';
import { getClients } from '../../services/clientService';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { userProfile, role } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [selectedProjectForClosure, setSelectedProjectForClosure] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    description: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    projectManager: 'Aaditya Vishnoi',
    priority: 'Medium',
    status: 'Active',
    progress: 10,
    team: 'Aaditya Vishnoi',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projData, clientData] = await Promise.all([getProjects(), getClients()]);
      setProjects(projData);
      setClients(clientData);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientName: clients.length > 0 ? clients[0].companyName : '',
      description: '',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectManager: userProfile?.displayName || 'Aaditya Vishnoi',
      priority: 'Medium',
      status: 'Active',
      progress: 0,
      team: userProfile?.displayName || 'Aaditya Vishnoi',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Project title is required');
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData, userProfile?.email);
        toast.success(`Updated project: ${formData.name}`);
      } else {
        await createProject(formData, userProfile?.email);
        toast.success(`Launched project: ${formData.name}`);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error saving project');
    }
  };

  const handleToggleClosureStep = async (stepId, currentState) => {
    if (!selectedProjectForClosure) return;
    try {
      const updated = await updateProjectClosureStep(
        selectedProjectForClosure.id,
        stepId,
        !currentState,
        userProfile?.email
      );
      setSelectedProjectForClosure(updated);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      toast.success(!currentState ? 'Closure requirement approved' : 'Closure step uncheck');
    } catch (err) {
      toast.error('Failed to update closure checklist');
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id, userProfile?.email);
      toast.success('Project archived');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to archive project');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Project Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{row.clientName || 'General Client'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{formatINR(val)}</span>,
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (val = 0) => (
        <div className="w-28 space-y-1">
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
      key: 'deadline',
      label: 'Deadline',
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
              setSelectedProjectForClosure(row);
              setClosureModalOpen(true);
            }}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Project Closure Checklist"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingProject(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setProjectToDelete(row);
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

  const closureChecklist = selectedProjectForClosure?.closureChecklist || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Engineering Projects & Deliveries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking active client software developments, milestone roadmaps, and formal handovers
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Project</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        searchKey={['name', 'clientName', 'projectManager']}
        searchPlaceholder="Search projects by name, client, manager..."
        filterKey="status"
        filterOptions={['Active', 'Planning', 'On Hold', 'At Risk', 'Delayed', 'Completed', 'Cancelled'].map(s => ({ label: s, value: s }))}
        onRowClick={(p) => {
          setEditingProject(p);
          setFormData(p);
          setModalOpen(true);
        }}
        exportFileName="brainlink_projects"
        loading={loading}
        emptyMessage="No engineering projects recorded. Launch your first project."
      />

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Launch New Engineering Project'}
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
              Save Project
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Telemedicine Mobile & Web Portal"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="e.g. Nova Health Systems"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Project Budget (INR ₹) *</label>
            <input
              type="number"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g. 1400000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
              <option value="At Risk">At Risk</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Completion Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Project Description & Architecture Brief</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* Project Closure Checklist Modal (Section 27) */}
      <Modal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        title="Project Closure & Handover Verification"
        subtitle={`Audit and sign off on completion requirements for "${selectedProjectForClosure?.name}"`}
        maxWidth="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setClosureModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Done
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500 leading-relaxed mb-4">
            Under Section 27 policy, marking a project as formally <strong>CLOSED</strong> requires verifying all technical, operational, and financial handover steps below:
          </p>

          <div className="space-y-2">
            {PROJECT_CLOSURE_STEPS.map((step, idx) => {
              const isChecked = Boolean(closureChecklist[step.id]);
              return (
                <div
                  key={step.id}
                  onClick={() => handleToggleClosureStep(step.id, isChecked)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950 font-medium'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`}
                    />
                    <span>{idx + 1}. {step.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isChecked ? 'Passed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Archive Project"
        message="Are you sure you want to archive this project? Financial transactions and documents will remain preserved."
      />
    </div>
  );
}
