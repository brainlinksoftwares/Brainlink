import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Upload,
  Phone,
  Mail,
  Building2,
  Globe,
  MapPin,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
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
  const { userProfile } = useAuth();
  const toast = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer / Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data || []);
    } catch (err) {
      toast.error('Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Lead metrics calculation
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) => l.status === 'Qualified' || l.status === 'Meeting Scheduled' || l.status === 'Proposal Sent'
  ).length;
  const totalBudget = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const wonLeads = leads.filter((l) => l.status === 'Won').length;

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
    setDrawerOpen(true);
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
    setDrawerOpen(true);
  };

  const handleRowClick = (lead) => {
    setActiveLead(lead);
    setActiveTab('overview');
    setDetailDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lead name is required');
      return;
    }

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
        toast.success('Lead updated successfully');
      } else {
        await createLead(formData);
        toast.success('Lead created successfully');
      }
      setDrawerOpen(false);
      loadLeads();
    } catch (err) {
      toast.error('Failed to save lead');
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id);
      toast.success('Lead deleted');
      setDeleteConfirmOpen(false);
      setDetailDrawerOpen(false);
      loadLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const handleOpenConvert = (lead) => {
    setSelectedLeadForConvert(lead);
    setDealFormData({
      name: `${lead.company || lead.name} — Contract`,
      value: lead.budget || 100000,
      expectedClose: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      probability: 60,
    });
    setConvertModalOpen(true);
  };

  const handleConvertDeal = async (e) => {
    e.preventDefault();
    if (!selectedLeadForConvert) return;

    try {
      await createDeal({
        leadId: selectedLeadForConvert.id,
        name: dealFormData.name,
        company: selectedLeadForConvert.company || selectedLeadForConvert.name,
        contactPerson: selectedLeadForConvert.name,
        email: selectedLeadForConvert.email,
        phone: selectedLeadForConvert.phone,
        value: Number(dealFormData.value) || 0,
        stage: 'Qualified',
        probability: Number(dealFormData.probability) || 50,
        expectedClose: dealFormData.expectedClose,
        assignedTo: selectedLeadForConvert.assignedTo || 'Aaditya Vishnoi',
        notes: `Converted from lead ${selectedLeadForConvert.name}`,
      });

      await updateLead(selectedLeadForConvert.id, {
        status: 'Qualified',
        notes: `${selectedLeadForConvert.notes || ''}\n[Converted to deal on ${new Date().toLocaleDateString()}]`,
      });

      toast.success('Converted to Deal in Qualified stage!');
      setConvertModalOpen(false);
      setDetailDrawerOpen(false);
      loadLeads();
    } catch (err) {
      toast.error('Failed to convert deal');
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const records = await parseCSV(file);
      let count = 0;
      for (const rec of records) {
        if (rec.name || rec.Name) {
          await createLead({
            name: rec.name || rec.Name,
            company: rec.company || rec.Company || '',
            email: rec.email || rec.Email || '',
            phone: rec.phone || rec.Phone || '',
            source: rec.source || rec.Source || 'CSV Import',
            budget: Number(rec.budget || rec.Budget || 0),
            status: rec.status || rec.Status || 'New',
          });
          count++;
        }
      }
      toast.success(`Successfully imported ${count} leads`);
      loadLeads();
    } catch (err) {
      toast.error('Failed to parse CSV file');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Lead',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#315CFF]/10 text-[#315CFF] font-semibold text-xs flex items-center justify-center shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-[#111318] dark:text-white hover:text-[#315CFF] transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-[#9299A6] truncate">
              {row.company || 'Direct Prospect'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'New'} />,
    },
    {
      key: 'leadScore',
      label: 'Score',
      sortable: true,
      render: (val) => {
        const score = Number(val) || 50;
        const color =
          score >= 75
            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
            : score >= 40
            ? 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40'
            : 'text-[#626A78] bg-[#F6F7F9] dark:text-[#9AA3B2] dark:bg-[#151923]';
        return (
          <span className={`px-2 py-0.5 rounded font-sans text-[11px] font-semibold ${color}`}>
            {score}
          </span>
        );
      },
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-sans font-semibold text-xs text-[#111318] dark:text-white">
          {val ? formatINR(val) : '—'}
        </span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#626A78] dark:text-[#9AA3B2]">{val || 'Website'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#9299A6]">{val ? formatDate(val) : 'Recent'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenConvert(row)}
            className="p-1 rounded text-[#9299A6] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Convert to Deal"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-[#9299A6] hover:text-[#315CFF] hover:bg-blue-50 dark:hover:bg-[#151923] transition-colors"
            title="Edit Lead"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setLeadToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-[#9299A6] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E9EE] dark:border-[#222733]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">
            Leads Management
          </h1>
          <p className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
            Manage prospects, qualification pipeline, lead scores, and deal conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="st-btn-secondary st-btn-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>

          <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Metric Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Total Inquiries
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">{totalLeads}</div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Qualified Leads
          </span>
          <div className="text-xl font-bold text-[#315CFF] mt-1">{qualifiedLeads}</div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Est. Opportunity
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {formatINR(totalBudget)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Won / Converted
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {wonLeads}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={leads}
        searchKey={['name', 'company', 'email', 'phone']}
        searchPlaceholder="Search leads by name, company, email..."
        filterKey="status"
        filterOptions={LEAD_STATUSES.map((s) => ({ label: s, value: s }))}
        onRowClick={handleRowClick}
        loading={loading}
        exportFileName="brainlink_leads"
      />

      {/* SIDE DRAWER: Create / Edit Lead Form */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Create Lead'}
        subtitle={
          editingLead ? `Updating record for ${editingLead.name}` : 'Enter prospect information'
        }
        width="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="st-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" form="lead-form" className="st-btn-primary">
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </>
        }
      >
        <form id="lead-form" onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Innovations"
                className="st-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@example.com"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Phone / Mobile
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="st-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="st-select w-full"
              >
                {LEAD_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="st-select w-full"
              >
                {LEAD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Estimated Budget (INR)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. 150000"
                className="st-input font-sans"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Lead Score (0–100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.leadScore}
                onChange={(e) => setFormData({ ...formData, leadScore: e.target.value })}
                className="st-input font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Internal Notes / Requirements
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key deliverables, timeline, or follow-up notes..."
              className="st-textarea"
            />
          </div>
        </form>
      </Drawer>

      {/* SIDE DRAWER: Lead 360 Workspace Detail View */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={activeLead?.name || 'Lead Workspace'}
        subtitle={activeLead?.company ? `${activeLead.company} • Prospect profile` : 'Prospect Profile'}
        width="max-w-xl"
        footer={
          activeLead && (
            <>
              <button
                type="button"
                onClick={() => {
                  setLeadToDelete(activeLead);
                  setDeleteConfirmOpen(true);
                }}
                className="st-btn-danger st-btn-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(activeLead)}
                className="st-btn-secondary st-btn-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenConvert(activeLead)}
                className="st-btn-primary st-btn-sm"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Convert to Deal</span>
              </button>
            </>
          )
        }
      >
        {activeLead && (
          <div className="space-y-4 text-xs">
            {/* Header Badge & Opportunity Bar */}
            <div className="p-3.5 rounded-lg border border-[#E7E9EE] dark:border-[#222733] bg-white dark:bg-[#10131A] flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-[#111318] dark:text-white">
                  {activeLead.name}
                </div>
                <div className="text-xs text-[#626A78] dark:text-[#9AA3B2]">
                  {activeLead.company || 'Independent'} • {activeLead.budget ? formatINR(activeLead.budget) : 'Flexible'}{' '}
                  opportunity
                </div>
              </div>
              <StatusBadge status={activeLead.status || 'New'} />
            </div>

            {/* Workspace Tabs */}
            <div className="flex border-b border-[#E7E9EE] dark:border-[#222733] text-xs">
              {['overview', 'details', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-3 font-semibold capitalize transition-all border-b-2 -mb-[1px] ${
                    activeTab === tab
                      ? 'border-[#315CFF] text-[#315CFF]'
                      : 'border-transparent text-[#9299A6] hover:text-[#111318] dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="st-card p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider">
                    Contact & Communication
                  </h4>
                  <div className="flex items-center gap-2 text-[#111318] dark:text-[#F5F7FA]">
                    <Mail className="w-3.5 h-3.5 text-[#9299A6] shrink-0" />
                    <span>{activeLead.email || 'No email specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#111318] dark:text-[#F5F7FA]">
                    <Phone className="w-3.5 h-3.5 text-[#9299A6] shrink-0" />
                    <span>{activeLead.phone || 'No phone specified'}</span>
                  </div>
                  {activeLead.website && (
                    <div className="flex items-center gap-2 text-[#111318] dark:text-[#F5F7FA]">
                      <Globe className="w-3.5 h-3.5 text-[#9299A6] shrink-0" />
                      <a
                        href={activeLead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#315CFF] hover:underline"
                      >
                        {activeLead.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="st-card p-3.5 space-y-2">
                  <h4 className="text-[11px] font-semibold text-[#9299A6] uppercase tracking-wider">
                    Commercials & Source
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Budget:</span>
                    <span className="font-semibold text-[#111318] dark:text-white">
                      {activeLead.budget ? formatINR(activeLead.budget) : 'Open'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Lead Score:</span>
                    <span className="font-semibold text-[#315CFF]">
                      {activeLead.leadScore || 50}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Acquisition Channel:</span>
                    <span className="text-[#111318] dark:text-white">{activeLead.source || 'Website'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#626A78] dark:text-[#9AA3B2]">Owner:</span>
                    <span className="text-[#111318] dark:text-white">{activeLead.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="st-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#626A78] dark:text-[#9AA3B2]">Industry:</span>
                  <span className="font-medium text-[#111318] dark:text-white">{activeLead.industry || 'Technology'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#626A78] dark:text-[#9AA3B2]">Priority:</span>
                  <span className="font-medium text-[#111318] dark:text-white">{activeLead.priority || 'Medium'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#626A78] dark:text-[#9AA3B2]">Created Date:</span>
                  <span className="font-medium text-[#111318] dark:text-white">{formatDate(activeLead.createdAt)}</span>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="st-card p-3.5">
                <p className="text-[#626A78] dark:text-[#9AA3B2] whitespace-pre-wrap leading-relaxed">
                  {activeLead.notes || 'No internal notes recorded.'}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Convert to Deal Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Active Deal"
        subtitle={`Creates an opportunity in the Qualified stage for ${selectedLeadForConvert?.name}`}
      >
        <form onSubmit={handleConvertDeal} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              value={dealFormData.name}
              onChange={(e) => setDealFormData({ ...dealFormData, name: e.target.value })}
              className="st-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Value (INR) *
              </label>
              <input
                type="number"
                required
                value={dealFormData.value}
                onChange={(e) => setDealFormData({ ...dealFormData, value: e.target.value })}
                className="st-input font-sans"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Target Close Date
              </label>
              <input
                type="date"
                value={dealFormData.expectedClose}
                onChange={(e) => setDealFormData({ ...dealFormData, expectedClose: e.target.value })}
                className="st-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E9EE] dark:border-[#222733]">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="st-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="st-btn-primary">
              Confirm & Open Deal
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
