import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Download,
  Upload,
  Phone,
  Mail,
  Building2,
  Sparkles,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate, parseCSV } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getLeads, createLead, updateLead, deleteLead } from '../../services/crmService';
import { createDeal } from '../../services/salesService';

const LEAD_SOURCES = [
  'Website',
  'WhatsApp',
  'Instagram',
  'LinkedIn',
  'Referral',
  'Google',
  'Facebook',
  'Ads',
  'Cold Outreach',
  'Existing Client',
  'Other',
];

const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export default function Leads() {
  const { userProfile, role } = useAuth();
  const toast = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    source: 'Website',
    industry: 'Technology',
    location: '',
    requirement: '',
    budget: '',
    assignedTo: 'Aaditya Vishnoi',
    leadScore: 50,
    status: 'New',
    priority: 'Medium',
    notes: '',
  });

  const [dealFormData, setDealFormData] = useState({
    name: '',
    value: '',
    expectedClose: '',
    probability: 50,
  });

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      toast.error('Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      whatsapp: '',
      website: '',
      source: 'Website',
      industry: 'Technology',
      location: '',
      requirement: '',
      budget: '',
      assignedTo: userProfile?.displayName || 'Aaditya Vishnoi',
      leadScore: 50,
      status: 'New',
      priority: 'Medium',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      website: lead.website || '',
      source: lead.source || 'Website',
      industry: lead.industry || 'Technology',
      location: lead.location || '',
      requirement: lead.requirement || '',
      budget: lead.budget || '',
      assignedTo: lead.assignedTo || '',
      leadScore: lead.leadScore || 50,
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      notes: lead.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lead name is required');
      return;
    }

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData, userProfile?.email);
        toast.success(`Updated lead: ${formData.name}`);
      } else {
        await createLead(formData, userProfile?.email);
        toast.success(`Created lead: ${formData.name}`);
      }
      setModalOpen(false);
      await loadLeads();
    } catch (err) {
      toast.error(err.message || 'Error saving lead');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id, userProfile?.email);
      toast.success('Lead deleted successfully');
      setDeleteConfirmOpen(false);
      setLeadToDelete(null);
      await loadLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const handleOpenConvert = (lead) => {
    setSelectedLeadForConvert(lead);
    setDealFormData({
      name: `${lead.company || lead.name} Project`,
      value: lead.budget || '',
      expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      probability: 60,
    });
    setConvertModalOpen(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLeadForConvert) return;

    try {
      await createDeal(
        {
          name: dealFormData.name,
          company: selectedLeadForConvert.company || selectedLeadForConvert.name,
          contactName: selectedLeadForConvert.name,
          email: selectedLeadForConvert.email,
          phone: selectedLeadForConvert.phone,
          value: Number(dealFormData.value) || 0,
          probability: Number(dealFormData.probability) || 50,
          stage: 'Proposal',
          expectedClose: dealFormData.expectedClose,
          leadId: selectedLeadForConvert.id,
          owner: selectedLeadForConvert.assignedTo || userProfile?.displayName,
        },
        userProfile?.email
      );

      // Update lead status to Proposal Sent
      await updateLead(selectedLeadForConvert.id, { status: 'Proposal Sent' }, userProfile?.email);

      toast.success('Lead successfully converted to Deal in Sales Pipeline!');
      setConvertModalOpen(false);
      setSelectedLeadForConvert(null);
      await loadLeads();
    } catch (err) {
      toast.error('Failed to convert lead to deal');
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCSV(text);
        let count = 0;
        for (const row of parsed) {
          if (row.name || row.Name) {
            await createLead(
              {
                name: row.name || row.Name,
                company: row.company || row.Company || '',
                email: row.email || row.Email || '',
                phone: row.phone || row.Phone || '',
                budget: Number(row.budget || row.Budget) || 0,
                status: row.status || row.Status || 'New',
                source: row.source || row.Source || 'Website',
              },
              userProfile?.email
            );
            count++;
          }
        }
        toast.success(`Imported ${count} leads from CSV`);
        await loadLeads();
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const columns = [
    {
      key: 'name',
      label: 'Lead Name & Company',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{row.company || 'Direct Contact'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Details',
      render: (_, row) => (
        <div className="text-xs space-y-0.5">
          {row.email && (
            <div className="text-slate-600 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="text-slate-600 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-800">{formatINR(val)}</span>,
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
          {val || 'Direct'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenConvert(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Convert to Deal"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Lead"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setLeadToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Leads Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture, qualify, score, and convert prospective business inquiries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>

          {/* New Lead Button */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <DataTable
        columns={columns}
        data={leads}
        searchKey={['name', 'company', 'email', 'phone']}
        searchPlaceholder="Search leads by name, company, email..."
        filterKey="status"
        filterOptions={LEAD_STATUSES.map(s => ({ label: s, value: s }))}
        onRowClick={(lead) => handleOpenEdit(lead)}
        exportFileName="brainlink_leads"
        loading={loading}
        emptyMessage="No leads found in database. Add a lead to get started."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        subtitle="Record lead details, requirement specifications, and estimated budget"
        maxWidth="max-w-2xl"
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
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead / Contact Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rohan Sharma"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Zenith Tech Solutions"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rohan@example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (INR ₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g. 500000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Project Requirements / Brief</label>
            <textarea
              rows={2}
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="e.g. Next.js SaaS portal with AI chatbot integration and Razorpay"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Discussion notes, meeting pointers..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* Convert Lead to Deal Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Pipeline Deal"
        subtitle={`Launch deal tracking for ${selectedLeadForConvert?.name}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConvertLead}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Convert to Deal
            </button>
          </>
        }
      >
        <form onSubmit={handleConvertLead} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deal Title</label>
            <input
              type="text"
              required
              value={dealFormData.name}
              onChange={(e) => setDealFormData({ ...dealFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deal Value (INR ₹)</label>
              <input
                type="number"
                required
                value={dealFormData.value}
                onChange={(e) => setDealFormData({ ...dealFormData, value: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Close Date</label>
              <input
                type="date"
                value={dealFormData.expectedClose}
                onChange={(e) => setDealFormData({ ...dealFormData, expectedClose: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.name}"?`}
        confirmText="Delete Lead"
        danger={true}
      />
    </div>
  );
}
