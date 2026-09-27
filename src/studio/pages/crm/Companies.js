import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Globe,
  Mail,
  Phone,
  FileText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../../services/crmService';

export default function Companies() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Technology',
    gstin: '',
    pan: '',
    billingAddress: '',
    shippingAddress: '',
    primaryContact: '',
    email: '',
    phone: '',
    notes: '',
  });

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      website: '',
      industry: 'Technology',
      gstin: '',
      pan: '',
      billingAddress: '',
      shippingAddress: '',
      primaryContact: '',
      email: '',
      phone: '',
      notes: '',
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || '',
      website: comp.website || '',
      industry: comp.industry || 'Technology',
      gstin: comp.gstin || '',
      pan: comp.pan || '',
      billingAddress: comp.billingAddress || '',
      shippingAddress: comp.shippingAddress || '',
      primaryContact: comp.primaryContact || '',
      email: comp.email || '',
      phone: comp.phone || '',
      notes: comp.notes || '',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Company name is required');
      return;
    }

    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData, userProfile?.email);
        toast.success(`Updated company: ${formData.name}`);
      } else {
        await createCompany(formData, userProfile?.email);
        toast.success(`Created company: ${formData.name}`);
      }
      setDrawerOpen(false);
      await loadCompanies();
    } catch (err) {
      toast.error('Error saving company');
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete.id, userProfile?.email);
      toast.success('Company deleted');
      setDeleteConfirmOpen(false);
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (err) {
      toast.error('Failed to delete company');
    }
  };

  // Metrics
  const totalCompanies = companies.length;
  const gstRegistered = companies.filter(c => Boolean(c.gstin)).length;
  const techCompanies = companies.filter(c => (c.industry || '').toLowerCase().includes('tech')).length;

  const columns = [
    {
      key: 'name',
      label: 'Corporate Account',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            {row.website ? (
              <a
                href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{row.website.replace(/^https?:\/\//, '')}</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-400">No domain recorded</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Vertical',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
          {val || 'Technology'}
        </span>
      ),
    },
    {
      key: 'taxDetails',
      label: 'GSTIN / PAN',
      render: (_, row) => (
        <div className="text-xs space-y-0.5 font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-sans font-medium">GST:</span>
            <span className="font-medium text-slate-900 dark:text-slate-200">{row.gstin || 'Unregistered'}</span>
          </div>
          {row.pan && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="text-[10px] text-slate-400 font-sans">PAN:</span>
              <span>{row.pan}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Liaison & Email',
      render: (_, row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-800 dark:text-slate-200">{row.primaryContact || '—'}</div>
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 truncate block transition-colors"
            >
              {row.email}
            </a>
          )}
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
            title="Edit Company"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setCompanyToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Company"
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
            <span className="text-slate-900 dark:text-white font-medium">Companies</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Corporate Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registered legal entities, Indian GST compliance IDs, and billing headquarters
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Company</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Corporate Accounts"
          value={totalCompanies}
          icon={Building2}
          subtext="Indexed organizations"
        />
        <StatCard
          label="GST Registered"
          value={gstRegistered}
          icon={ShieldCheck}
          subtext="Tax-compliant invoicing"
        />
        <StatCard
          label="Technology Sector"
          value={techCompanies}
          icon={Briefcase}
          subtext="Core strategic segment"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={companies}
        searchKey={['name', 'industry', 'gstin', 'pan', 'primaryContact']}
        searchPlaceholder="Search companies by legal name, GSTIN, PAN, or contact..."
        onRowClick={(comp) => handleOpenEdit(comp)}
        exportFileName="brainlink_companies"
        loading={loading}
        emptyMessage="No corporate accounts recorded yet. Click 'New Company' to register an account."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCompany ? `Edit Company: ${formData.name}` : 'Register Corporate Account'}
        subtitle="Manage tax identifiers, legal registration, and billing location"
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
              {editingCompany ? 'Save Changes' : 'Register Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Global Solutions Pvt Ltd"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://apexglobal.in"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry Vertical
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="st-select"
              >
                <option value="Technology">Technology & SaaS</option>
                <option value="Healthcare">Healthcare & Biotech</option>
                <option value="Fintech">Fintech & Banking</option>
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="Manufacturing">Manufacturing & Industrial</option>
                <option value="Consulting">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN Number (15-character)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="29ABCDE1234F1Z5"
                className="st-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate PAN
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="st-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Liaison
              </label>
              <input
                type="text"
                value={formData.primaryContact}
                onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                placeholder="e.g. Ramesh Chandra"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Billing Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="accounts@apexglobal.in"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 80 4123 4567"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Billing Address
              </label>
              <textarea
                rows={2}
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                placeholder="Full registered address for GST invoices..."
                className="st-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Account Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special billing instructions, payment terms, or enterprise caveats..."
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
        title="Delete Company"
        message={`Are you sure you want to delete corporate account "${companyToDelete?.name}"?`}
      />
    </div>
  );
}
