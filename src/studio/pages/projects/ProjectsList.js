import React, { useState, useEffect, useCallback } from 'react';
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
  CheckSquare,
  Layers,
  DollarSign,
  TrendingUp,
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
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('overview');

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
      setProjects(projData || []);
      setClients(clientData || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(
    (p) => p.status === 'Active' || p.status === 'In Progress'
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

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
    setActiveTab('overview');
    setDetailDrawerOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Project title is required');
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
        toast.success('Delivery sprint launched');
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
    try {
      const current = selectedProject.closureSteps?.[stepKey]?.completed || false;
      const updated = await updateProjectClosureStep(
        selectedProject.id,
        stepKey,
        !current,
        userProfile?.email
      );
      setSelectedProject(updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Compliance step updated`);
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
          <div className="w-7 h-7 rounded-md bg-[#315CFF]/10 text-[#315CFF] font-bold text-xs flex items-center justify-center shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-[#111318] dark:text-white hover:text-[#315CFF] transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-[#9299A6] truncate">
              {row.clientName || 'Direct Engagement'}
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
            <div className="flex justify-between text-[11px] text-[#626A78] dark:text-[#9AA3B2] mb-1">
              <span>Delivery</span>
              <span className="font-semibold text-[#111318] dark:text-white">{pct}%</span>
            </div>
            <div className="st-progress-track h-1.5">
              <div
                className="st-progress-fill"
                style={{ width: `${Math.max(5, pct)}%` }}
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
        <span className="font-sans font-bold text-xs text-[#111318] dark:text-white">
          {val ? formatINR(val) : '—'}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#626A78] dark:text-[#9AA3B2]">
          {val ? formatDate(val) : 'Flexible'}
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
            onClick={() => {
              setSelectedProject(row);
              setClosureModalOpen(true);
            }}
            className="p-1 rounded text-[#9299A6] hover:text-emerald-600 transition-colors"
            title="11-Step Closure Protocol"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-[#9299A6] hover:text-[#315CFF] transition-colors"
            title="Edit Project"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setProjectToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-[#9299A6] hover:text-rose-600 transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E9EE] dark:border-[#222733]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">
            Projects & Deliveries
          </h1>
          <p className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
            Active engineering sprints, milestone schedules, and formal compliance sign-offs.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Total Deliveries
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {totalProjects}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            In Progress
          </span>
          <div className="text-xl font-bold text-[#315CFF] mt-1">{inProgressProjects}</div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Contract Pipeline
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {formatINR(totalBudget)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Team Capacity
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Optimal
          </div>
        </div>
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

      {/* SIDE DRAWER: Project Workspace Detail */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={selectedProject?.name || 'Project Workspace'}
        subtitle={selectedProject?.clientName ? `Client: ${selectedProject.clientName}` : 'Engineering sprint'}
        width="max-w-xl"
        footer={
          selectedProject && (
            <>
              <button
                type="button"
                onClick={() => setClosureModalOpen(true)}
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
            {/* Header Workspace Block */}
            <div className="p-4 rounded-lg border border-[#E7E9EE] dark:border-[#222733] bg-white dark:bg-[#10131A] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111318] dark:text-white">
                    {selectedProject.name}
                  </h3>
                  <div className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
                    {selectedProject.clientName || 'Direct Engagement'}
                  </div>
                </div>
                <StatusBadge status={selectedProject.status || 'In Progress'} />
              </div>

              {/* Progress & Quick Actions */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#626A78] dark:text-[#9AA3B2]">Completion Status</span>
                  <span className="text-[#315CFF]">{selectedProject.progress || 0}%</span>
                </div>
                <div className="st-progress-track h-2">
                  <div
                    className="st-progress-fill bg-[#315CFF]"
                    style={{ width: `${Math.max(5, selectedProject.progress || 0)}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E7E9EE] dark:border-[#222733]">
                <button
                  onClick={() => navigate('/projects/tasks')}
                  className="st-btn-secondary st-btn-sm"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Tasks</span>
                </button>
                <button
                  onClick={() => navigate('/projects/milestones')}
                  className="st-btn-secondary st-btn-sm"
                >
                  <Layers className="w-3 h-3" />
                  <span>Milestones</span>
                </button>
                <div className="ml-auto flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#315CFF] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#10131A]">
                    AV
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#10131A]">
                    BL
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace Tabs */}
            <div className="flex border-b border-[#E7E9EE] dark:border-[#222733] text-xs">
              {['overview', 'financials', 'compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-3 font-semibold capitalize transition-all border-b-2 -mb-[1px] ${
                    activeTab === tab
                      ? 'border-[#315CFF] text-[#315CFF]'
                      : 'border-transparent text-[#9299A6] hover:text-[#111318] dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="st-card p-3.5 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Target Delivery:</span>
                    <span className="font-semibold text-[#111318] dark:text-white">
                      {selectedProject.deadline || 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Project Lead:</span>
                    <span className="font-medium text-[#111318] dark:text-white">
                      {selectedProject.projectManager || 'Aaditya Vishnoi'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Priority:</span>
                    <span className="font-medium text-[#111318] dark:text-white">
                      {selectedProject.priority || 'Medium'}
                    </span>
                  </div>
                </div>

                {selectedProject.description && (
                  <div className="st-card p-3.5">
                    <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider mb-1.5">
                      Scope & Technical Objectives
                    </h4>
                    <p className="text-[#626A78] dark:text-[#9AA3B2] leading-relaxed whitespace-pre-wrap">
                      {selectedProject.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Financial Relationship (Section 34) */}
            {activeTab === 'financials' && (
              <div className="st-card p-4 space-y-3">
                <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider">
                  Project Financial Overview
                </h4>
                <div className="space-y-2 divide-y divide-[#F0F2F5] dark:divide-[#191E2A]">
                  <div className="flex justify-between pt-1">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Contract Value:</span>
                    <span className="font-bold text-[#111318] dark:text-white">
                      {formatINR(selectedProject.budget || 250000)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Invoiced:</span>
                    <span className="font-semibold text-[#111318] dark:text-white">
                      {formatINR((selectedProject.budget || 250000) * 0.7)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Collected:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR((selectedProject.budget || 250000) * 0.5)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Outstanding:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {formatINR((selectedProject.budget || 250000) * 0.2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Expenses:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatINR((selectedProject.budget || 250000) * 0.16)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#111318] dark:text-white font-bold">Estimated Margin:</span>
                    <span className="font-bold text-[#315CFF]">
                      {formatINR((selectedProject.budget || 250000) * 0.44)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Compliance & Closure Protocol */}
            {activeTab === 'compliance' && (
              <div className="st-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider">
                    Closure Sign-off Protocol
                  </h4>
                  <button
                    onClick={() => setClosureModalOpen(true)}
                    className="text-xs text-[#315CFF] font-semibold hover:underline"
                  >
                    Open Checklist
                  </button>
                </div>
                <p className="text-[#626A78] dark:text-[#9AA3B2] text-[11px]">
                  All projects must complete the 11-step closure sign-off prior to archiving.
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
                    : 'bg-white dark:bg-[#10131A] border-[#E7E9EE] dark:border-[#222733] text-[#626A78] dark:text-[#9AA3B2] hover:bg-slate-50 dark:hover:bg-[#151923]'
                }`}
              >
                <div
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border border-[#CBD0DC] dark:border-slate-600'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-[#111318] dark:text-white">
                    {idx + 1}. {step.label}
                  </div>
                  <div className="text-[11px] text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* SIDE DRAWER: Create / Edit Project */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        subtitle="Manage client delivery contract & milestones"
        width="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="st-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" form="project-form" className="st-btn-primary">
              {editingProject ? 'Save Changes' : 'Launch Delivery'}
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSaveProject} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Brainlink Studio Enterprise Redesign"
              className="st-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Client Corporate Account
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Acme Technologies"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Contract Budget (INR)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="250000"
                className="st-input font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Progress Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="st-input font-sans"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Description & Deliverable Scope
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
