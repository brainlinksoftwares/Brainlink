import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  UserCheck,
  Shield,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getContacts, createContact, updateContact, deleteContact } from '../../services/crmService';

export default function Contacts() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    designation: '',
    company: '',
    relationship: 'Decision Maker',
    notes: '',
    tags: '',
  });

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      designation: '',
      company: '',
      relationship: 'Decision Maker',
      notes: '',
      tags: '',
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingContact(c);
    setFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      whatsapp: c.whatsapp || '',
      designation: c.designation || '',
      company: c.company || '',
      relationship: c.relationship || 'Decision Maker',
      notes: c.notes || '',
      tags: Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || '',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Contact name is required');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      if (editingContact) {
        await updateContact(editingContact.id, payload, userProfile?.email);
        toast.success(`Updated contact: ${formData.name}`);
      } else {
        await createContact(payload, userProfile?.email);
        toast.success(`Created contact: ${formData.name}`);
      }
      setDrawerOpen(false);
      await loadContacts();
    } catch (err) {
      toast.error('Error saving contact');
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact(contactToDelete.id, userProfile?.email);
      toast.success('Contact removed');
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
      await loadContacts();
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  // Metrics
  const totalContacts = contacts.length;
  const decisionMakers = contacts.filter(c => c.relationship === 'Decision Maker').length;
  const uniqueCompanies = new Set(contacts.map(c => c.company).filter(Boolean)).size;
  const technicalChampions = contacts.filter(c => c.relationship === 'Technical Champion').length;

  const columns = [
    {
      key: 'name',
      label: 'Stakeholder',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.designation || 'Executive'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Organization',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{val || 'Independent'}</span>
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Direct Contact',
      render: (_, row) => (
        <div className="text-xs space-y-1">
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1.5 truncate max-w-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{row.email}</span>
            </a>
          )}
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{row.phone}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'relationship',
      label: 'Influence & Role',
      sortable: true,
      render: (val) => {
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        if (val === 'Decision Maker') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
        if (val === 'Technical Champion') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
        if (val === 'Procurement') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';

        return (
          <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border font-medium ${badgeColor}`}>
            {val || 'General'}
          </span>
        );
      },
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
            title="Edit Contact"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setContactToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Contact"
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
            <span>CRM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Contacts</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Stakeholder Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key executives, technical champions, and procurement leads across your accounts
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Contact</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Contacts"
          value={totalContacts}
          icon={Users}
          subtext="Indexed stakeholders"
        />
        <StatCard
          label="Decision Makers"
          value={decisionMakers}
          icon={Shield}
          subtext="Primary sign-off authority"
        />
        <StatCard
          label="Associated Companies"
          value={uniqueCompanies}
          icon={Building2}
          subtext="Corporate client accounts"
        />
        <StatCard
          label="Tech Champions"
          value={technicalChampions}
          icon={UserCheck}
          subtext="Internal project advocates"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={contacts}
        searchKey={['name', 'email', 'company', 'designation']}
        searchPlaceholder="Search stakeholders by name, email, company, or designation..."
        onRowClick={(c) => handleOpenEdit(c)}
        exportFileName="brainlink_contacts"
        loading={loading}
        emptyMessage="No stakeholders recorded yet. Click 'New Contact' to create your first entry."
      />

      {/* Slide-over Drawer for Contact Form */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingContact ? `Edit Contact: ${formData.name}` : 'New Stakeholder Contact'}
        subtitle="Manage stakeholder coordinates, influence category, and relationship details"
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
              {editingContact ? 'Save Changes' : 'Create Contact'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikram Malhotra"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Chief Technology Officer"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Nexus Tech Ltd"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Direct Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vikram@nexustech.io"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship Role
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="st-select"
              >
                <option value="Decision Maker">Decision Maker (C-Level / VP)</option>
                <option value="Technical Champion">Technical Champion (Lead Eng / Architect)</option>
                <option value="Procurement">Procurement & Finance</option>
                <option value="End User">End User / Operational Lead</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Enterprise, VIP, Cloud Transformation"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Notes & Preferences
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Key drivers, preferred communication channels, background..."
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
        title="Delete Contact"
        message={`Are you sure you want to delete stakeholder "${contactToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
