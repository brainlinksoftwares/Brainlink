import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Video,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { leadService } from '../services/leadService';
import { FollowUp, FollowUpType, Lead } from '../types';
import { useAuth } from '../context/AuthContext';
import { FollowUpStatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { FOLLOW_UP_TYPES } from '../config/crmConfig';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grouped, setGrouped] = useState<{
    today: FollowUp[];
    upcoming: FollowUp[];
    overdue: FollowUp[];
    completed: FollowUp[];
  }>({ today: [], upcoming: [], overdue: [], completed: [] });

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick schedule modal
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [type, setType] = useState<FollowUpType>('Call');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [g, allLeads] = await Promise.all([
        followUpService.getGroupedFollowUps(),
        leadService.getAllLeads(),
      ]);
      setGrouped(g);
      setLeads(allLeads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = followUpService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleComplete = async (id: string) => {
    if (!user) return;
    const note = prompt('Completion note (optional):') || '';
    await followUpService.completeFollowUp(id, note, { id: user.id, name: user.name });
    loadData();
  };

  const handleReschedule = async (id: string) => {
    if (!user) return;
    const newDate = prompt('Enter new date/time (YYYY-MM-DDTHH:MM):');
    if (!newDate) return;
    await followUpService.rescheduleFollowUp(id, newDate, { id: user.id, name: user.name });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this follow-up?')) {
      await followUpService.deleteFollowUp(id);
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !scheduledAt || !user) return;
    const matchedLead = leads.find((l) => l.id === selectedLeadId);

    await followUpService.createFollowUp(
      {
        leadId: selectedLeadId,
        leadName: matchedLead?.name || 'Prospect',
        leadCompany: matchedLead?.company || '',
        assignedTo: matchedLead?.assignedTo || user.id,
        assignedToName: matchedLead?.assignedToName || user.name,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || 'Follow-up discussion',
      },
      { id: user.id, name: user.name }
    );

    setShowModal(false);
    setSelectedLeadId('');
    setScheduledAt('');
    setNotes('');
    loadData();
  };

  const currentList = grouped[activeTab];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Follow-up Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Never miss a client touchpoint, discovery call, or proposal follow-up
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Follow-up
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('today')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'today'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Today ({grouped.today.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'upcoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming ({grouped.upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'overdue'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Overdue ({grouped.overdue.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({grouped.completed.length})
        </button>
      </div>

      {/* Follow-up Cards */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={`No ${activeTab} follow-ups`}
          description={`Your ${activeTab} queue is clear. Keep your prospects engaged by scheduling timely checkpoints.`}
          actionLabel="Schedule Follow-up"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {item.leadName || 'Lead Prospect'}
                      </span>
                      <FollowUpStatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.leadCompany || 'Individual'} &bull; Type:{' '}
                      <span className="font-semibold text-slate-700">{item.type}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/leads/${item.leadId}`)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    title="Open Lead"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                  {item.notes || 'No description provided'}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    Scheduled:{' '}
                    <strong className="text-slate-700">
                      {new Date(item.scheduledAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </strong>
                  </span>
                  <span>Assigned: {item.assignedToName || 'Team'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                {item.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => handleReschedule(item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
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

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Lead Follow-up</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lead</label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="">Select lead...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.company || 'Direct'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FollowUpType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {FOLLOW_UP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agenda / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Discuss tech stack and delivery timelines"
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
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
