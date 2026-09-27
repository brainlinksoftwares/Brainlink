import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderGit2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
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
  const { userProfile } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawers and Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projData, clientData] = await Promise.all([
        getProjects(),
        getClients(),
      ]);
      setProjects(projData);
      setClients(clientData);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientName: clients[0]?.companyName || '',
      description: '',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      projectManager: userProfile?.displayName || 'Aaditya Vishnoi',
      priority: 'Medium',
      status: 'Active',
      progress: 10,
      team: userProfile?.displayName || 'Aaditya Vishnoi',
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      clientName: proj.clientName || '',
      description: proj.description || '',
      budget: proj.budget || '',
      startDate: proj.startDate || '',
      deadline: proj.deadline || '',
      projectManager: proj.projectManager || '',
      priority: proj.priority || 'Medium',
      status: proj.status || 'Active',
      progress: proj.progress || 0,
      team: proj.team || '',
    });
    setDrawerOpen(true);
  };

  const handleRowClick = (proj) => {
    setSelectedProject(proj);
    setDetailDrawerOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        toast.success('Project updated');
      } else {
        await createProject({
          ...formData,
          budget: Number(formData.budget) || 0,
          progress: Number(formData.progress) || 0,
        });
        toast.success('Project created');
      }
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      toast.success('Project deleted');
      setDeleteConfirmOpen(false);
      setDetailDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleToggleClosureStep = async (stepKey) => {
    if (!selectedProject) return;
    const currentCompleted = selectedProject.closureSteps?.[stepKey]?.completed || false;
    try {
      const updated = await updateProjectClosureStep(
        selectedProject.id,
        stepKey,
        !currentCompleted,
        userProfile?.email
      );
      setSelectedProject(updated);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      toast.success(`Updated closure checklist step`);
    } catch (err) {
      toast.error('Failed to update closure step');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Project',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-slate-400 truncate">
              {row.clientName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'Active'} />,
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (val) => {
        const pct = Math.min(100, Math.max(0, Number(val) || 0));
        return (
          <div className="w-32">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Delivery</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {val ? formatINR(val) : '—'}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedProject(row);
              setClosureModalOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="11-Step Closure Protocol"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Project"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setProjectToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Project"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Projects & Deliveries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active engineering sprints, milestone schedules, and formal Section 27 closure compliance.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={projects}
        searchKey={['name', 'clientName', 'projectManager']}
        searchPlaceholder="Search projects by name, client..."
        filterKey="status"
        filterOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Delayed', value: 'Delayed' },
          { label: 'Completed', value: 'Completed' },
        ]}
        onRowClick={handleRowClick}
        loading={loading}
        exportFileName="brainlink_projects"
      />

      {/* SIDE DRAWER: Create / Edit Project */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        subtitle="Manage client delivery contract & milestones"
        width="max-w-xl"
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className="st-btn-secondary">
              Cancel
            </button>
            <button type="submit" form="project-form" className="st-btn-primary">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Brainlink Studio Redesign"
              className="st-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Client Company *
              </label>
              <select
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="st-select w-full"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.companyName}>{c.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Project Budget (INR) *
              </label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="250000"
                className="st-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="st-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Progress Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="st-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="st-select w-full"
              >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed / At Risk</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Description & Scope
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key architectural deliverables, stack, and milestones..."
              className="st-textarea"
            />
          </div>
        </form>
      </Drawer>

      {/* SIDE DRAWER: Project Workspace Detail */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={selectedProject?.name || 'Project Details'}
        subtitle={`Client: ${selectedProject?.clientName}`}
        width="max-w-lg"
        footer={
          selectedProject && (
            <>
              <button
                type="button"
                onClick={() => {
                  setClosureModalOpen(true);
                }}
                className="st-btn-secondary st-btn-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Closure Protocol</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedProject)}
                className="st-btn-primary st-btn-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            </>
          )
        }
      >
        {selectedProject && (
          <div className="space-y-4 text-xs">
            {/* Delivery Progress Bar */}
            <div className="st-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Overall Completion
                </span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {selectedProject.progress || 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${selectedProject.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Commercial Parameters */}
            <div className="st-card p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Budget:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {formatINR(selectedProject.budget || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Delivery:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedProject.deadline || 'Flexible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={selectedProject.status || 'Active'} />
              </div>
            </div>

            {/* Description */}
            {selectedProject.description && (
              <div className="st-card p-4">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Scope & Details
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedProject.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 11-Step Formal Closure Protocol Modal */}
      <Modal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        title="11-Step Formal Project Closure Protocol"
        subtitle={`Mandatory compliance sign-off for ${selectedProject?.name}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto studio-scrollbar text-xs">
          {PROJECT_CLOSURE_STEPS.map((step, idx) => {
            const isCompleted = selectedProject?.closureSteps?.[step.key]?.completed || false;
            return (
              <div
                key={step.key}
                onClick={() => handleToggleClosureStep(step.key)}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                  isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs">
                    {idx + 1}. {step.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated milestones and tasks will also be deleted.`}
      />
    </div>
  );
}
