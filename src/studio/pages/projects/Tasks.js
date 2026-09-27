import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  LayoutList,
  Columns,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTasks, createTask, updateTask, deleteTask, getProjects } from '../../services/projectService';

const TASK_STATUSES = ['Todo', 'In Progress', 'Review', 'Blocked', 'Completed'];

export default function Tasks() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    projectName: '',
    description: '',
    assignedTo: 'Aaditya Vishnoi',
    priority: 'Medium',
    status: 'Todo',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedHours: 10,
    actualHours: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, projData] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tasksData);
      setProjects(projData);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingTask(null);
    const defProj = projects[0] || {};
    setFormData({
      title: '',
      projectId: defProj.id || '',
      projectName: defProj.name || '',
      description: '',
      assignedTo: userProfile?.displayName || 'Aaditya Vishnoi',
      priority: 'Medium',
      status: 'Todo',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 8,
      actualHours: 0,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData, userProfile?.email);
        toast.success(`Updated task: ${formData.title}`);
      } else {
        await createTask(formData, userProfile?.email);
        toast.success(`Created task: ${formData.title}`);
      }
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error saving task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus }, userProfile?.email);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id, userProfile?.email);
      toast.success('Task deleted');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const blockedCount = tasks.filter(t => t.status === 'Blocked').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  const columns = [
    {
      key: 'title',
      label: 'Task & Sprint Item',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {row.projectName || 'General Work Package'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assignee',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'Unassigned'}</span>
        </span>
      ),
    },
    {
      key: 'hours',
      label: 'Logged / Est Hours',
      render: (_, row) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span className="font-medium text-slate-900 dark:text-white">{row.actualHours || 0}h</span>
          <span className="text-slate-400"> / {row.estimatedHours || 0}h</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Deadline',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
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
              setEditingTask(row);
              setFormData(row);
              setDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Task"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setTaskToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Task"
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
            <span className="text-slate-900 dark:text-white font-medium">Tasks</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Engineering & Sprint Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sprint work packages, architecture tasks, bug tickets, and developer effort logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          icon={CheckSquare}
          subtext="Sprint tickets"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          subtext="Under active development"
        />
        <StatCard
          label="Blocked Items"
          value={blockedCount}
          icon={AlertCircle}
          subtext="Requires intervention"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          subtext="Sprint verified deliverables"
        />
      </div>

      {/* Task Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {TASK_STATUSES.map((status) => {
            const statusTasks = tasks.filter(t => t.status === status);
            return (
              <div
                key={status}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col min-h-[460px]"
              >
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{status}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {statusTasks.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center text-[11px] text-slate-400">
                      Empty
                    </div>
                  ) : (
                    statusTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setEditingTask(t);
                          setFormData(t);
                          setDrawerOpen(true);
                        }}
                        className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-3 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {t.title}
                          </span>
                          <StatusBadge status={t.priority} />
                        </div>

                        {t.projectName && (
                          <div className="text-[10px] text-slate-500 truncate">
                            {t.projectName}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="truncate max-w-[100px]">{t.assignedTo || 'Unassigned'}</span>
                          <span>{t.actualHours || 0}/{t.estimatedHours || 0}h</span>
                        </div>

                        {/* Quick Status Select */}
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          searchKey={['title', 'projectName', 'assignedTo']}
          searchPlaceholder="Search tasks by title, project, assignee..."
          filterKey="status"
          filterOptions={TASK_STATUSES.map(s => ({ label: s, value: s }))}
          onRowClick={(t) => {
            setEditingTask(t);
            setFormData(t);
            setDrawerOpen(true);
          }}
          exportFileName="brainlink_tasks"
          loading={loading}
          emptyMessage="No tasks found matching criteria."
        />
      )}

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingTask ? `Edit Task: ${formData.title}` : 'Create Engineering Task'}
        subtitle="Specify sprint deliverables, hours, assigned engineer, and priority"
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Implement OAuth Sign-In & JWT Session Validation"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => {
                  const proj = projects.find(p => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    projectName: proj?.name || '',
                  });
                }}
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
                Assigned Engineer
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
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
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="st-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Effort (Hours)
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Hours Spent
              </label>
              <input
                type="number"
                value={formData.actualHours}
                onChange={(e) => setFormData({ ...formData, actualHours: Number(e.target.value) })}
                className="st-input font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Acceptance Criteria & Technical Notes
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Definition of done, pull request link, edge cases to verify..."
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
        title="Delete Task"
        message="Are you sure you want to delete this task from the backlog?"
      />
    </div>
  );
}
