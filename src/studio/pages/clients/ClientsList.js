import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClients, createClient, updateClient, deleteClient } from '../../services/clientService';

export default function ClientsList() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    primaryContact: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    billingAddress: '',
    industry: 'Technology',
    status: 'Active',
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      companyName: '',
      primaryContact: '',
      email: '',
      phone: '',
      gstin: '',
      pan: '',
      billingAddress: '',
      industry: 'Technology',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName) {
      toast.error('Client company name is required');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData, userProfile?.email);
        toast.success(`Updated client: ${formData.companyName}`);
      } else {
        await createClient(formData, userProfile?.email);
        toast.success(`Created client: ${formData.companyName}`);
      }
      setModalOpen(false);
      await loadClients();
    } catch (err) {
      toast.error('Error saving client');
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id, userProfile?.email);
      toast.success('Client archived');
      setDeleteConfirmOpen(false);
      setClientToDelete(null);
      await loadClients();
    } catch (err) {
      toast.error('Failed to archive client');
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Client Company',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{val}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{row.primaryContact || 'Stakeholder'}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Official Contact',
      render: (_, row) => (
        <div className="text-xs space-y-0.5 text-slate-600">
          {row.email && <div>{row.email}</div>}
          {row.phone && <div>{row.phone}</div>}
        </div>
      ),
    },
    {
      key: 'onboardingProgress',
      label: 'Onboarding',
      sortable: true,
      render: (val = 0) => (
        <div className="w-28 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>{val}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                val === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
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
            onClick={() => navigate(`/studio/clients/${row.id}`)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View 360 Client Profile"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingClient(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setClientToDelete(row);
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
            Clients Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts directory, onboarded corporate profiles, and 360-degree relationship overviews
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        searchKey={['companyName', 'primaryContact', 'email', 'phone']}
        searchPlaceholder="Search clients by company, contact, email..."
        filterKey="status"
        filterOptions={['Active', 'Onboarding', 'Inactive', 'Archived'].map(s => ({ label: s, value: s }))}
        onRowClick={(c) => navigate(`/studio/clients/${c.id}`)}
        exportFileName="brainlink_clients"
        loading={loading}
        emptyMessage="No clients registered yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? 'Edit Client Profile' : 'Register New Client'}
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
              Save Client
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
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Contact Name</label>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
        title="Archive Client"
        message={`Are you sure you want to archive "${clientToDelete?.companyName}"? Historical invoices and project milestones will be safely preserved.`}
        confirmText="Archive Client"
      />
    </div>
  );
}
