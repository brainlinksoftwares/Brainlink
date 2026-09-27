import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Plus,
  Edit,
  Mail,
  Lock,
  Check,
  KeyRound,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../../context/rbac';
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { logAudit } from '../../services/auditService';

export default function UsersManagement() {
  const { userProfile, role, isSuperAdmin, register } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    role: ROLES.SALES_EXECUTIVE,
    permissions: [],
  });

  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: ROLES.SALES_EXECUTIVE,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || ROLES.SALES_EXECUTIVE,
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
    });
    setEditModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    setFormData({
      role: newRole,
      permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || [],
    });
  };

  const handleTogglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const docRef = doc(db, 'users', selectedUser.id);
      await updateDoc(docRef, {
        role: formData.role,
        permissions: formData.permissions,
        updatedAt: serverTimestamp(),
      });

      await logAudit({
        user: userProfile?.email,
        action: 'Modified User Role & Permissions',
        entity: 'users',
        entityId: selectedUser.id,
        previousValue: selectedUser.role,
        newValue: formData.role,
      });

      toast.success(`Updated permissions for ${selectedUser.displayName || selectedUser.email}`);
      setEditModalOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error('Failed to update user authorization');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createFormData.email || !createFormData.password) {
      toast.error('Email and password required');
      return;
    }

    try {
      await register(
        createFormData.email,
        createFormData.password,
        createFormData.displayName,
        createFormData.role
      );
      toast.success(`Provisioned user account for ${createFormData.email}`);
      setCreateModalOpen(false);
      setCreateFormData({
        email: '',
        password: '',
        displayName: '',
        role: ROLES.SALES_EXECUTIVE,
      });
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to provision account');
    }
  };

  const columns = [
    {
      key: 'displayName',
      label: 'Staff Member',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val || row.email?.split('@')[0]}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Assigned RBAC Role',
      sortable: true,
      render: (val) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (val === 'SUPER_ADMIN') badge = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
        else if (val === 'ADMIN') badge = 'bg-amber-50 text-amber-700 border-amber-200';
        else if (val === 'SALES_MANAGER') badge = 'bg-blue-50 text-blue-700 border-blue-200';
        else if (val === 'FINANCE') badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${badge}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'Active'} />,
    },
    {
      key: 'permissions',
      label: 'Granular Access',
      render: (val = []) => (
        <span className="text-xs text-slate-600 font-medium">
          {val.length} active permissions
        </span>
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manage Access</span>
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
            User Directory & RBAC Security
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 6 RBAC compliance: grant granular privileges across CRM, Sales, Deliveries, and Invoicing
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey={['displayName', 'email', 'role']}
        searchPlaceholder="Search staff by name, email, role..."
        filterKey="role"
        filterOptions={Object.values(ROLES).map(r => ({ label: r, value: r }))}
        onRowClick={(u) => handleOpenEdit(u)}
        exportFileName="brainlink_rbac_users"
        loading={loading}
      />

      {/* Edit Role & Granular Permissions Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Configure Privileges: ${selectedUser?.displayName || selectedUser?.email}`}
        subtitle="Update assigned operational role or toggle granular capabilities"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveUser}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Authorization
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Operational Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white font-semibold"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="block font-bold text-slate-900 mb-2">Granular Permissions Matrix</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = formData.permissions.includes(perm);
                return (
                  <label
                    key={perm}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-mono text-[11px]">{perm}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Provision User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New Staff Account"
        subtitle="Create credentials and assign initial RBAC operational scope"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateUser}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Provision Account
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={createFormData.displayName}
              onChange={(e) => setCreateFormData({ ...createFormData, displayName: e.target.value })}
              placeholder="e.g. Senior Project Manager"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="user@brainlink.in"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
            <select
              value={createFormData.role}
              onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
