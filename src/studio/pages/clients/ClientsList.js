import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
    setDrawerOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      companyName: client.companyName || '',
      primaryContact: client.primaryContact || '',
      email: client.email || '',
      phone: client.phone || '',
      gstin: client.gstin || '',
      pan: client.pan || '',
      billingAddress: client.billingAddress || '',
      industry: client.industry || 'Technology',
      status: client.status || 'Active',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName) {
      toast.error('Company name is required');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        toast.success('Client updated');
      } else {
        await createClient(formData, userProfile?.email);
        toast.success('Client registered & onboarding initiated');
      }
      setDrawerOpen(false);
      loadClients();
    } catch (err) {
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id);
      toast.success('Client profile archived');
      setDeleteConfirmOpen(false);
      loadClients();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Client Company',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-slate-400 truncate">
              {row.primaryContact ? `Attn: ${row.primaryContact}` : row.email || ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'Active'} />,
    },
    {
      key: 'gstin',
      label: 'GSTIN',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {val || 'Unregistered'}
        </span>
      ),
    },
    {
      key: 'totalBilled',
      label: 'Lifetime Value',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {val ? formatINR(val) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Onboarded',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/clients/${row.id}`)}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Open Client Workspace"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Client"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setClientToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Client"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Client Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your client accounts, corporate billing credentials, and 360 workspaces.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Client</span>
        </button>
      </div>

      {/* Main Clients Table */}
      <DataTable
        columns={columns}
        data={clients}
        searchKey={['companyName', 'primaryContact', 'email', 'gstin']}
        searchPlaceholder="Search clients by company, contact, or GSTIN..."
        filterKey="status"
        filterOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
        ]}
        onRowClick={(c) => navigate(`/clients/${c.id}`)}
        loading={loading}
        exportFileName="brainlink_clients"
      />

      {/* SIDE DRAWER: Create / Edit Client */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingClient ? 'Edit Client' : 'New Client'}
        subtitle="Manage client credentials & corporate profile"
        width="max-w-xl"
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className="st-btn-secondary">
              Cancel
            </button>
            <button type="submit" form="client-form" className="st-btn-primary">
              {editingClient ? 'Save Changes' : 'Create Client'}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Acme Tech Pvt Ltd"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                value={formData.primaryContact}
                onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                placeholder="e.g. Rohan Sharma"
                className="st-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Official Billing Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="accounts@acme.com"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Corporate GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="07AAAAA0000A1Z5"
                className="st-input font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                PAN
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                placeholder="ABCDE1234F"
                className="st-input font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Registered Billing Address
            </label>
            <textarea
              rows={3}
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Unit #, Tech Park, City, State, PIN..."
              className="st-textarea"
            />
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Archive Client"
        message={`Are you sure you want to archive "${clientToDelete?.companyName}"?`}
      />
    </div>
  );
}
