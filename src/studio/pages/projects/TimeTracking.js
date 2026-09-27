import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  User,
  FolderGit2,
  CheckCircle2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Users,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(true);
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
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error logging time');
    }
  };

  // Metrics
  const totalLoggedHours = entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
  const uniqueContributors = new Set(entries.map(e => e.user).filter(Boolean)).size;
  const uniqueProjects = new Set(entries.map(e => e.projectName).filter(Boolean)).size;
  const recentLogsCount = entries.filter(e => {
    const d = new Date(e.date);
    const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  }).length;

  const columns = [
    {
      key: 'projectName',
      label: 'Project & Sprint Task',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {val || 'Engineering Project'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {row.taskTitle || 'Sprint Development'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Work Description',
      render: (val) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-md truncate">
          {val || '—'}
        </div>
      ),
    },
    {
      key: 'hours',
      label: 'Logged Effort',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-medium text-slate-900 dark:text-white font-mono text-xs">
          {val} hrs
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Log Date',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Engineer',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'Engineer'}</span>
        </span>
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
            <span className="text-slate-900 dark:text-white font-medium">Time Tracking</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Engineering Effort & Time Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time developer timesheets, sprint billable hours, and task duration tracking
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Effort</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Effort Logged"
          value={`${totalLoggedHours}h`}
          icon={Clock}
          subtext="Cumulative team sprint hours"
        />
        <StatCard
          label="Active Contributors"
          value={uniqueContributors}
          icon={Users}
          subtext="Engineers with logged effort"
        />
        <StatCard
          label="Active Projects"
          value={uniqueProjects}
          icon={Briefcase}
          subtext="Accounts receiving effort"
        />
        <StatCard
          label="Recent Logs (7 Days)"
          value={recentLogsCount}
          icon={TrendingUp}
          subtext="Timesheet submissions"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={entries}
        searchKey={['projectName', 'taskTitle', 'user', 'description']}
        searchPlaceholder="Search time logs by project, task, engineer, or description..."
        exportFileName="brainlink_time_tracking"
        loading={loading}
        emptyMessage="No time logs recorded yet. Click 'Log Effort' to record developer hours."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Engineering Effort"
        subtitle="Record developer hours against assigned project and sprint tasks"
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
              Record Timesheet
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Account
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title / Component
              </label>
              <input
                type="text"
                value={formData.taskTitle}
                onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                placeholder="e.g. Next.js Routing & API Optimization"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effort Logged (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Performed
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Summary & Git Commits
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summary of modules touched, PR reference, test suites executed..."
                className="st-textarea"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
