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
  Sparkles,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'title',
      label: 'Task Details',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.projectName || 'General Task'}</div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assignee',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {val || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'hours',
      label: 'Est / Act Hours',
      render: (_, row) => (
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-800">{row.actualHours || 0}h</span> / {row.estimatedHours || 0}h
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
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setEditingTask(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTaskToDelete(row);
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
            Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sprint work packages, bug backlogs, code review tickets, and effort tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-600 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {TASK_STATUSES.map((status) => {
            const statusTasks = tasks.filter(t => t.status === status);
            return (
              <div
                key={status}
                className="bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col min-h-[400px]"
              >
                <div className="p-3 border-b border-slate-200/80 bg-white rounded-t-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{status}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                  {statusTasks.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                      Empty
                    </div>
                  ) : (
                    statusTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setEditingTask(t);
                          setFormData(t);
                          setModalOpen(true);
                        }}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {t.title}
                          </span>
                          <StatusBadge status={t.priority} />
                        </div>

                        {t.projectName && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            {t.projectName}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{t.assignedTo || 'Unassigned'}</span>
                          <span>{t.actualHours || 0}/{t.estimatedHours || 0}h</span>
                        </div>

                        {/* Quick Status Dropdown */}
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="w-full text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
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
            setModalOpen(true);
          }}
          exportFileName="brainlink_tasks"
          loading={loading}
          emptyMessage="No tasks found."
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
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
              Save Task
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement OAuth Sign-In & JWT Session Validation"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project</label>
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
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Developer / Engineer</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
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
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Hours</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Actual Hours Spent</label>
            <input
              type="number"
              value={formData.actualHours}
              onChange={(e) => setFormData({ ...formData, actualHours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Task Description / Acceptance Criteria</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />
    </div>
  );
}
