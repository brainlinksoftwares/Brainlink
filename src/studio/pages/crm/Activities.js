import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  PhoneCall,
  Mail,
  MessageSquare,
  Sparkles,
  Filter,
} from 'lucide-react';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getActivities, logActivity } from '../../services/crmService';

export default function Activities() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    type: 'Call',
    title: '',
    description: '',
    entityType: 'lead',
    entityName: '',
  });

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await getActivities(100);
      setActivities(data);
    } catch (err) {
      toast.error('Failed to load activity timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Activity title is required');
      return;
    }

    try {
      await logActivity({
        ...formData,
        userEmail: userProfile?.displayName || userProfile?.email,
      });
      toast.success('Activity logged to timeline');
      setModalOpen(false);
      setFormData({
        type: 'Call',
        title: '',
        description: '',
        entityType: 'lead',
        entityName: '',
      });
      await loadActivities();
    } catch (err) {
      toast.error('Failed to log activity');
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (typeFilter === 'ALL') return true;
    return String(act.type).toLowerCase() === typeFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Activities & Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit feed of client interactions, calls, emails, and milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Call">Phone Calls</option>
            <option value="Email">Emails</option>
            <option value="Meeting">Meetings</option>
            <option value="Deal">Deals</option>
            <option value="Invoice">Invoices</option>
            <option value="Project">Projects</option>
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading timeline...</div>
        ) : (
          <ActivityTimeline activities={filteredActivities} />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Business Activity"
        subtitle="Record notes, calls, follow-up touchpoints, or client emails"
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
              Log to Feed
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Call">Phone Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email Sent</option>
                <option value="Note">Internal Note</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Entity</label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                placeholder="e.g. Zenith Tech or Rohan"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Activity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Discovery call regarding cloud migration roadmap"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Summary & Next Steps</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key decisions, client questions, deliverables agreed upon..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
