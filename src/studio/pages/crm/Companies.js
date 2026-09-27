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
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../../services/crmService';

export default function Companies() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{val}</span>
          </div>
          {row.website && (
            <a
              href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3 h-3" />
              <span>{row.website}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
          {val || 'Technology'}
        </span>
      ),
    },
    {
      key: 'taxDetails',
      label: 'GSTIN / PAN',
      render: (_, row) => (
        <div className="text-xs space-y-0.5 font-mono text-slate-600">
          <div>GST: {row.gstin || '—'}</div>
          <div>PAN: {row.pan || '—'}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="text-xs space-y-0.5 text-slate-600">
          <div className="font-medium text-slate-800">{row.primaryContact || '—'}</div>
          {row.email && <div>{row.email}</div>}
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCompanyToDelete(row);
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
            Client & Vendor Companies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered organizations, corporate GSTIN accounts, and billing addresses
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        searchKey={['name', 'industry', 'gstin', 'pan', 'primaryContact']}
        searchPlaceholder="Search by company, GSTIN, PAN, primary contact..."
        onRowClick={(comp) => handleOpenEdit(comp)}
        exportFileName="brainlink_companies"
        loading={loading}
        emptyMessage="No companies recorded yet. Add corporate accounts."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'New Company'}
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
              Save Company
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Nova Health Systems Pvt Ltd"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://novahealth.co"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="29ABCDE1234F1Z5"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">PAN</label>
            <input
              type="text"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Contact</label>
            <input
              type="text"
              value={formData.primaryContact}
              onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
            <textarea
              rows={2}
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.name}"?`}
      />
    </div>
  );
}
