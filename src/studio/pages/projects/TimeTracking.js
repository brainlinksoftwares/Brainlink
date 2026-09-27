import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  User,
  FolderGit2,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTimeEntries, addTimeEntry, getProjects, getTasks } from '../../services/projectService';

export default function TimeTracking() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    taskTitle: '',
    hours: 4,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [times, projs, tks] = await Promise.all([getTimeEntries(), getProjects(), getTasks()]);
      setEntries(times);
      setProjects(projs);
      setTasks(tks);
    } catch (err) {
      toast.error('Failed to load time logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    const defProj = projects[0] || {};
    setFormData({
      projectId: defProj.id || '',
      projectName: defProj.name || '',
      taskTitle: '',
      hours: 4,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.hours || Number(formData.hours) <= 0) {
      toast.error('Please enter valid hours');
      return;
    }

    try {
      await addTimeEntry(formData, userProfile?.displayName || userProfile?.email);
      toast.success('Time entry recorded');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error logging time');
    }
  };

  const totalLoggedHours = entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);

  const columns = [
    {
      key: 'projectName',
      label: 'Project & Task',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val || 'Engineering Project'}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.taskTitle || 'General Engineering Sprint'}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Work Logged',
      render: (val) => <div className="text-xs text-slate-600 max-w-sm truncate">{val || '—'}</div>,
    },
    {
      key: 'hours',
      label: 'Duration',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{val} hrs</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Team Member',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-slate-700">{val}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Team Effort & Time Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total sprint effort logged: <strong className="text-blue-600 font-bold">{totalLoggedHours} hours</strong>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Hours</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        searchKey={['projectName', 'taskTitle', 'description', 'user']}
        searchPlaceholder="Search time logs by project, task, developer..."
        exportFileName="brainlink_time_entries"
        loading={loading}
        emptyMessage="No time logs recorded yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Work Hours"
        subtitle="Record development, UI/UX, or technical effort against a project"
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
              Save Time Log
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Project *</label>
            <select
              value={formData.projectId}
              onChange={(e) => {
                const proj = projects.find(p => p.id === e.target.value);
                setFormData({ ...formData, projectId: e.target.value, projectName: proj?.name || '' });
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
            <label className="block font-semibold text-slate-700 mb-1">Task / Ticket Name</label>
            <input
              type="text"
              value={formData.taskTitle}
              onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              placeholder="e.g. Turn Server Relays Configuration"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hours Spent *</label>
            <input
              type="number"
              step="0.5"
              required
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Description of Work</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of bugs resolved or features coded..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
