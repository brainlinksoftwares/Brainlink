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
  ShieldCheck,
  TrendingUp,
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
      setClients(data || []);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'Active' || !c.status).length;
  const totalLTV = clients.reduce((sum, c) => sum + (Number(c.totalBilled) || 0), 0);

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
        await createClient(formData);
        toast.success('Corporate client registered');
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
      toast.success('Client removed');
      setDeleteConfirmOpen(false);
      loadClients();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Corporate Client',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#315CFF]/10 text-[#315CFF] font-bold text-xs flex items-center justify-center shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-[#111318] dark:text-white hover:text-[#315CFF] transition-colors">
              {val}
            </span>
            <div className="text-[11px] text-[#9299A6] truncate">
              {row.primaryContact ? `Attn: ${row.primaryContact}` : row.email || 'Corporate'}
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
        <span className="font-mono text-xs text-[#626A78] dark:text-[#9AA3B2]">
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
        <span className="font-sans font-bold text-xs text-[#111318] dark:text-white">
          {val ? formatINR(val) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Onboarded',
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
            onClick={() => navigate(`/clients/${row.id}`)}
            className="p-1 rounded text-[#9299A6] hover:text-[#315CFF] transition-colors"
            title="Open Client Workspace"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-[#9299A6] hover:text-[#315CFF] transition-colors"
            title="Edit Client"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setClientToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-[#9299A6] hover:text-rose-600 transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E9EE] dark:border-[#222733]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">
            Client Directory
          </h1>
          <p className="text-xs text-[#626A78] dark:text-[#9AA3B2] mt-0.5">
            Manage corporate client accounts, billing credentials, and 360 engagement workspaces.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Client</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Total Clients
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {totalClients}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Active Accounts
          </span>
          <div className="text-xl font-bold text-[#315CFF] mt-1">{activeClients}</div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Total Revenue LTV
          </span>
          <div className="text-xl font-bold text-[#111318] dark:text-white mt-1">
            {formatINR(totalLTV)}
          </div>
        </div>
        <div className="st-kpi-block py-3 px-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
            Client Retention
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            96.8%
          </div>
        </div>
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
        title={editingClient ? 'Edit Client Profile' : 'New Corporate Client'}
        subtitle="Manage client credentials & billing identity"
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
            <button type="submit" form="client-form" className="st-btn-primary">
              {editingClient ? 'Save Changes' : 'Register Client'}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Company Legal Name *
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
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@acme.com"
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
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
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="07AABCU9603R1ZM"
                className="st-input font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="st-input font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#626A78] dark:text-[#9AA3B2] font-medium mb-1">
              Billing & Office Address
            </label>
            <textarea
              rows={2}
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Full registered company address for tax invoices..."
              className="st-textarea"
            />
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete "${clientToDelete?.companyName}"?`}
      />
    </div>
  );
}
