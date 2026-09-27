import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  PhoneCall,
  Mail,
  MessageSquare,
  Sparkles,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import Drawer from '../../components/ui/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getActivities, logActivity } from '../../services/crmService';

export default function Activities() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      setDrawerOpen(false);
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

  const filterOptions = [
    { id: 'ALL', label: 'All Events' },
    { id: 'Call', label: 'Calls' },
    { id: 'Email', label: 'Emails' },
    { id: 'Meeting', label: 'Meetings' },
    { id: 'Deal', label: 'Deals' },
    { id: 'Invoice', label: 'Invoices' },
    { id: 'Project', label: 'Projects' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>CRM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Activities</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Audit Feed & Interactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time chronological timeline of client touchpoints, calls, negotiations, and system events
          </p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTypeFilter(opt.id)}
            className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
              typeFilter === opt.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline Container */}
      <div className="st-card p-5">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading audit feed...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">No activity records found matching filter.</p>
          </div>
        ) : (
          <ActivityTimeline activities={filteredActivities} />
        )}
      </div>

      {/* Slide-over Drawer for Log Activity */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Business Activity"
        subtitle="Record touchpoints, executive phone calls, client emails, or internal notes"
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
              Save Activity
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Touchpoint Channel
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="st-select"
              >
                <option value="Call">Phone Call</option>
                <option value="Meeting">Formal Meeting</option>
                <option value="Email">Email Sent</option>
                <option value="Note">Internal Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Entity / Client
              </label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                placeholder="e.g. Nexus Tech Ltd or Vikram"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Activity Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Architecture review & SLA scoping call"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Summary, Objections & Next Action
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key meeting takeaways, technical decisions, budget confirmation, or follow-up due date..."
                className="st-textarea"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
