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
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'title',
      label: 'Meeting & Client',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">{row.client || 'Prospective Client'}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800">{formatDate(val)}</div>
          <div className="text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.time || '14:00'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'meetingType',
      label: 'Type',
      sortable: true,
      render: (val) => {
        const isOnline = val === 'Online';
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {isOnline ? <Video className="w-3 h-3 text-blue-600" /> : <Phone className="w-3 h-3 text-slate-600" />}
            <span>{val}</span>
          </span>
        );
      },
    },
    {
      key: 'agenda',
      label: 'Agenda / Next Action',
      render: (val, row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          {val || row.nextAction || '—'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setMeetingToDelete(row);
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
            Sales & Discovery Meetings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate video calls, stakeholder presentations, and sprint reviews
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={meetings}
        searchKey={['title', 'client', 'agenda']}
        searchPlaceholder="Search meetings by title, client..."
        onRowClick={(m) => {
          setEditingMeeting(m);
          setFormData(m);
          setModalOpen(true);
        }}
        exportFileName="brainlink_meetings"
        loading={loading}
        emptyMessage="No upcoming meetings scheduled."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMeeting ? 'Edit Meeting' : 'Schedule Discovery Meeting'}
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
              Save Schedule
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Architecture Blueprint Review & Timeline Finalization"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client / Lead Name</label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="e.g. Zenith Tech"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meeting Format</label>
            <select
              value={formData.meetingType}
              onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Online">Online (Google Meet / Zoom)</option>
              <option value="Phone">Phone Call</option>
              <option value="In-person">In-person</option>
            </select>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Agenda & Meeting Notes</label>
            <textarea
              rows={2}
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Meeting"
        message="Are you sure you want to cancel and remove this scheduled meeting?"
      />
    </div>
  );
}
