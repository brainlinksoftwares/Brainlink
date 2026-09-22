import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Send,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { teamService } from '../services/teamService';
import { followUpService } from '../services/followUpService';
import { activityService } from '../services/activityService';
import { clientService } from '../services/clientService';
import { useAuth } from '../context/AuthContext';
import { Lead, Activity, FollowUp, User, LeadStatus, LeadPriority, FollowUpType } from '../types';
import { StatusBadge, PriorityBadge, FollowUpStatusBadge } from '../components/common/StatusBadge';
import { DEFAULT_LEAD_STATUSES, FOLLOW_UP_TYPES } from '../config/crmConfig';

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, checkPermission } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Note authoring state
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Follow-up modal state
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fuDate, setFuDate] = useState('');
  const [fuType, setFuType] = useState<FollowUpType>('Call');
  const [fuNotes, setFuNotes] = useState('');

  // Client conversion modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [contractValue, setContractValue] = useState<number>(100000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [conversionNotes, setConversionNotes] = useState('');

  const loadAll = async () => {
    if (!id) return;
    try {
      const [leadData, acts, fus, team] = await Promise.all([
        leadService.getLeadById(id),
        activityService.getActivitiesForEntity('lead', id),
        followUpService.getFollowUpsForLead(id),
        teamService.getAllUsers(),
      ]);
      setLead(leadData);
      setActivities(acts);
      setFollowUps(fus);
      setUsers(team);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const unsubLead = leadService.subscribe(loadAll);
    const unsubAct = activityService.subscribe(loadAll);
    return () => {
      unsubLead();
      unsubAct();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Lead Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This lead may have been deleted or the link is invalid.
        </p>
        <button
          onClick={() => navigate('/leads')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
        >
          Back to Leads Table
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!user) return;
    await leadService.updateLeadStatus(lead.id, newStatus, { id: user.id, name: user.name });
    if (newStatus === 'Won') {
      setShowConvertModal(true);
    }
  };

  const handlePriorityChange = async (newPriority: LeadPriority) => {
    if (!user) return;
    await leadService.updateLead(lead.id, { priority: newPriority }, { id: user.id, name: user.name });
  };

  const handleAssigneeChange = async (newUserId: string) => {
    if (!user) return;
    const assignedUser = users.find((u) => u.id === newUserId);
    await leadService.updateLead(
      lead.id,
      {
        assignedTo: newUserId,
        assignedToName: assignedUser?.name || '',
      },
      { id: user.id, name: user.name }
    );
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;
    setNoteSubmitting(true);
    try {
      await activityService.logActivity({
        entityType: 'lead',
        entityId: lead.id,
        type: 'note_added',
        description: `Note: "${newNote.trim()}"`,
        actorId: user.id,
        actorName: user.name,
      });
      setNewNote('');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuDate || !user) return;
    await followUpService.createFollowUp(
      {
        leadId: lead.id,
        leadName: lead.name,
        leadCompany: lead.company,
        assignedTo: lead.assignedTo || user.id,
        assignedToName: lead.assignedToName || user.name,
        type: fuType,
        scheduledAt: new Date(fuDate).toISOString(),
        notes: fuNotes || 'Scheduled discussion',
      },
      { id: user.id, name: user.name }
    );
    setShowFollowUpModal(false);
    setFuDate('');
    setFuNotes('');
    loadAll();
  };

  const handleCompleteFollowUp = async (fuId: string) => {
    if (!user) return;
    const notes = prompt('Enter completion notes (optional):') || '';
    await followUpService.completeFollowUp(fuId, notes, { id: user.id, name: user.name });
    loadAll();
  };

  const handleConvertClient = async () => {
    if (!user) return;
    await clientService.convertLeadToClient(
      lead,
      {
        contractValue,
        startDate,
        notes: conversionNotes,
      },
      { id: user.id, name: user.name }
    );
    setShowConvertModal(false);
    navigate('/clients');
  };

  return (
    <div className="space-y-6">
      {/* Top back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {lead.name}
              </h1>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lead.company || 'Individual Client'} &bull; Source: <span className="font-semibold">{lead.source}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lead.status !== 'Won' && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Convert to Client
            </button>
          )}
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Controls + Lead Overview */}
        <div className="space-y-6">
          {/* Quick Stage / Priority Control Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pipeline Management
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Status
              </label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {DEFAULT_LEAD_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={lead.priority}
                onChange={(e) => handlePriorityChange(e.target.value as LeadPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Team Member
              </label>
              <select
                value={lead.assignedTo || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact &amp; Business Info
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline truncate">
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${lead.phone}`} className="text-slate-800 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}

              {lead.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline"
                  >
                    WhatsApp: {lead.whatsapp}
                  </a>
                </div>
              )}

              {lead.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {lead.website}
                  </a>
                </div>
              )}

              {lead.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{lead.location}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Industry:</span>
                <span className="font-medium text-slate-800">{lead.industry || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company Size:</span>
                <span className="font-medium text-slate-800">{lead.companySize || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Budget:</span>
                <span className="font-semibold text-slate-900">{lead.budget || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Timeline:</span>
                <span className="font-medium text-slate-800">{lead.timeline || 'Flexible'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Full Requirement, Activity Timeline, Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirement Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Complete Project Requirement
            </h3>
            <div className="p-4 bg-slate-50/75 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {lead.requirement || 'No detailed requirement provided.'}
            </div>
          </div>

          {/* Follow-ups Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Follow-ups ({followUps.length})
              </h3>
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule New
              </button>
            </div>

            {followUps.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No follow-ups scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3 bg-slate-50/60 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{fu.type}</span>
                        <FollowUpStatusBadge status={fu.status} />
                      </div>
                      <p className="text-slate-600 mt-1">{fu.notes}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Scheduled: {new Date(fu.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>

                    {fu.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteFollowUp(fu.id)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note Input Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Log Note / Activity
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log discussion notes, call summary, or customer requests..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={noteSubmitting || !newNote.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Note
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Immutable Activity Timeline
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No activities logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-900">{act.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        By <span className="font-semibold text-slate-600">{act.actorName}</span> &bull;{' '}
                        {new Date(act.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Lead Follow-up</h3>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Type
                </label>
                <select
                  value={fuType}
                  onChange={(e) => setFuType(e.target.value as FollowUpType)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {FOLLOW_UP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fuDate}
                  onChange={(e) => setFuDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objective / Agenda
                </label>
                <textarea
                  rows={2}
                  value={fuNotes}
                  onChange={(e) => setFuNotes(e.target.value)}
                  placeholder="e.g. Discuss tech architecture proposal"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Client Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <Trophy className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Convert Lead to Client</h3>
            </div>
            <p className="text-xs text-slate-500">
              Convert "{lead.name}" ({lead.company}) into an active client record.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contract Value (₹ INR)
                </label>
                <input
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contract / Handover Notes
                </label>
                <textarea
                  rows={2}
                  value={conversionNotes}
                  onChange={(e) => setConversionNotes(e.target.value)}
                  placeholder="Terms agreed, milestone targets, or kickoff details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertClient}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Confirm Client Conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
