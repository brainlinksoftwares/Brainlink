import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { clientService } from '../services/clientService';
import { Project, Client, ProjectStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { DEFAULT_SERVICES } from '../config/crmConfig';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project modal
  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [service, setService] = useState('Website Development');
  const [value, setValue] = useState<number>(100000);
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [assignedTeamStr, setAssignedTeamStr] = useState('Brainlink Engineering');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        projectService.getAllProjects(),
        clientService.getAllClients(),
      ]);
      setProjects(p);
      setClients(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = projectService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    if (!user) return;
    await projectService.updateProjectStatus(projectId, newStatus, { id: user.id, name: user.name });
    loadData();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name || !user) return;
    const matchedClient = clients.find((c) => c.id === clientId);

    await projectService.createProject(
      {
        clientId,
        clientName: matchedClient?.company || 'Client',
        name,
        service,
        value,
        status,
        startDate,
        expectedCompletion: expectedCompletion || undefined,
        assignedTeam: assignedTeamStr.split(',').map((s) => s.trim()).filter(Boolean),
        notes,
      },
      { id: user.id, name: user.name }
    );

    setShowModal(false);
    setName('');
    setNotes('');
    loadData();
  };

  const getStatusStyle = (st: ProjectStatus) => {
    switch (st) {
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Hold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Client Delivery Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deliverable milestones, timeline delivery and contract execution
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects logged yet"
          description="Track active development deliverables for your clients. Create a new project or convert a Won lead into an engagement."
          actionLabel="Create Project"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Client: <span className="text-slate-800">{p.clientName}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${getStatusStyle(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-semibold text-slate-800">{p.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project Value:</span>
                    <span className="font-bold text-slate-900">
                      ₹{p.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeline:</span>
                    <span className="font-medium text-slate-700">
                      {new Date(p.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}{' '}
                      &rarr;{' '}
                      {p.expectedCompletion
                        ? new Date(p.expectedCompletion).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Team:</span>
                    <span className="font-medium text-slate-700">{p.assignedTeam.join(', ') || 'Team'}</span>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2">
                    "{p.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Update Status:</span>
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as ProjectStatus)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Deliverable Project</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Telemedicine Mobile Application"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {DEFAULT_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Value (₹)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Completion</label>
                  <input
                    type="date"
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Team</label>
                <input
                  type="text"
                  value={assignedTeamStr}
                  onChange={(e) => setAssignedTeamStr(e.target.value)}
                  placeholder="Comma separated team names"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Scope</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key milestones or architecture notes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
