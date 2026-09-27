import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  Trash2,
  Edit,
  ChevronRight,
  Users,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from '../../services/salesService';

export default function Meetings() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    meetingType: 'Online',
    participants: '',
    agenda: '',
    outcome: '',
    nextAction: '',
  });

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      client: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      meetingType: 'Online',
      participants: 'Aaditya Vishnoi',
      agenda: '',
      outcome: '',
      nextAction: '',
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMeeting(m);
    setFormData(m);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Meeting title is required');
      return;
    }

    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, formData, userProfile?.email);
        toast.success('Meeting updated');
      } else {
        await createMeeting(formData, userProfile?.email);
        toast.success('Meeting scheduled');
      }
      setDrawerOpen(false);
      await loadMeetings();
    } catch (err) {
      toast.error('Error saving meeting');
    }
  };

  const handleDelete = async () => {
    if (!meetingToDelete) return;
    try {
      await deleteMeeting(meetingToDelete.id, userProfile?.email);
      toast.success('Meeting deleted');
      setDeleteConfirmOpen(false);
      setMeetingToDelete(null);
      await loadMeetings();
    } catch (err) {
      toast.error('Failed to delete meeting');
    }
  };

  // Metrics
  const totalMeetings = meetings.length;
  const onlineCalls = meetings.filter(m => m.meetingType === 'Online').length;
  const inPersonMeetings = meetings.filter(m => m.meetingType === 'In-person').length;
  const phoneMeetings = meetings.filter(m => m.meetingType === 'Phone').length;

  const columns = [
    {
      key: 'title',
      label: 'Session & Client',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.client || 'Prospective Account'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Schedule',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-900 dark:text-white font-mono">{formatDate(val)}</div>
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.time || '14:00'} IST</span>
          </div>
        </div>
      ),
    },
    {
      key: 'meetingType',
      label: 'Channel',
      sortable: true,
      render: (val) => {
        const isOnline = val === 'Online';
        const isPhone = val === 'Phone';
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {isOnline ? (
              <Video className="w-3 h-3 text-blue-600" />
            ) : isPhone ? (
              <Phone className="w-3 h-3 text-emerald-600" />
            ) : (
              <MapPin className="w-3 h-3 text-amber-600" />
            )}
            <span>{val}</span>
          </span>
        );
      },
    },
    {
      key: 'agenda',
      label: 'Objective / Agenda',
      render: (val, row) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-sm truncate">
          {val || row.nextAction || '—'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Meeting"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setMeetingToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Meeting"
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
            <span>Sales</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Meetings</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Sales & Discovery Sessions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate technical discovery calls, sprint retrospectives, and client presentations
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Scheduled"
          value={totalMeetings}
          icon={Calendar}
          subtext="Indexed sessions"
        />
        <StatCard
          label="Video Conferences"
          value={onlineCalls}
          icon={Video}
          subtext="Google Meet / Zoom"
        />
        <StatCard
          label="In-Person Meetings"
          value={inPersonMeetings}
          icon={MapPin}
          subtext="On-site discussions"
        />
        <StatCard
          label="Phone Calls"
          value={phoneMeetings}
          icon={Phone}
          subtext="Quick align touchpoints"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={meetings}
        searchKey={['title', 'client', 'agenda']}
        searchPlaceholder="Search meetings by session title, client, or agenda..."
        onRowClick={(m) => handleOpenEdit(m)}
        exportFileName="brainlink_meetings"
        loading={loading}
        emptyMessage="No discovery sessions scheduled yet. Click 'Schedule Meeting' to create an entry."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingMeeting ? `Edit Meeting: ${formData.title}` : 'Schedule Discovery Meeting'}
        subtitle="Configure calendar timestamp, conference format, and agenda parameters"
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
              {editingMeeting ? 'Save Changes' : 'Schedule Session'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Architecture Review & Cloud Migration Roadmap"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Account
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g. Apex Global Solutions"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Format
              </label>
              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                className="st-select"
              >
                <option value="Online">Online (Google Meet / Zoom)</option>
                <option value="Phone">Phone Call</option>
                <option value="In-person">In-person / On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time (IST)
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Key Participants
              </label>
              <input
                type="text"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                placeholder="Aaditya Vishnoi, CTO, Lead Architect"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenda & Discussion Topics
              </label>
              <textarea
                rows={3}
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="Key technical scope, deliverables, questions to resolve..."
                className="st-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outcome & Next Action
              </label>
              <textarea
                rows={2}
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="Actionable follow-up agreed during session..."
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
        title="Delete Meeting"
        message="Are you sure you want to cancel and remove this scheduled session?"
      />
    </div>
  );
}
