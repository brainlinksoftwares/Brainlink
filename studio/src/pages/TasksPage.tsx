import React, { useState, useEffect } from 'react';
import {
  CheckSquare2,
  Plus,
  Calendar,
  Trash2,
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { leadService } from '../services/leadService';
import { teamService } from '../services/teamService';
import { Task, TaskStatus, TaskPriority, Lead, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');

  const loadData = async () => {
    try {
      const [t, l, u] = await Promise.all([
        taskService.getAllTasks(),
        leadService.getAllLeads(),
        teamService.getAllUsers(),
      ]);
      setTasks(t);
      setLeads(l);
      setUsers(u);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = taskService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;
    await taskService.updateTaskStatus(taskId, newStatus, { id: user.id, name: user.name });
    loadData();
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await taskService.deleteTask(taskId);
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !user) return;

    const matchedLead = leads.find((l) => l.id === leadId);
    const assignedUser = users.find((u) => u.id === (assignedTo || user.id));

    await taskService.createTask(
      {
        title,
        description,
        leadId: leadId || undefined,
        leadName: matchedLead?.name || undefined,
        assignedTo: assignedTo || user.id,
        assignedToName: assignedUser?.name || user.name,
        priority,
        status: 'Pending',
        dueDate,
      },
      { id: user.id, name: user.name }
    );

    setShowModal(false);
    setTitle('');
    setDescription('');
    setLeadId('');
    setDueDate('');
    loadData();
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Action Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage proposals, client deliverables, contracts, and internal milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare2}
          title="No tasks recorded"
          description="Create your first task to track milestones, proposal preparation, or technical discovery tasks."
          actionLabel="Add Task"
          onAction={() => setShowModal(true)}
        />
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No tasks match "{statusFilter}".</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="mt-2 text-xs text-blue-600 font-medium"
          >
            Show All Tasks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h3>
                  <PriorityBadge priority={t.priority} size="sm" />
                </div>

                {t.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {t.description}
                  </p>
                )}

                <div className="text-[11px] text-slate-500 space-y-1">
                  {t.leadName && (
                    <p>
                      Linked Lead: <strong className="text-slate-800">{t.leadName}</strong>
                    </p>
                  )}
                  <p>
                    Assigned: <span className="font-semibold text-slate-700">{t.assignedToName}</span>
                  </p>
                  <p className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(t.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Task</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Draft SRS document for client"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific instructions or deliverables"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link to Lead (optional)</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="">None</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="">Myself</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-xl"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
