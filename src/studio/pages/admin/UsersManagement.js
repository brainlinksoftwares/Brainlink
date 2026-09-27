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
  ChevronRight,
  ShieldAlert,
  Users,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
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
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
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
    setEditDrawerOpen(true);
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
      setEditDrawerOpen(false);
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
      setCreateDrawerOpen(false);
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

  // Metrics
  const totalUsers = users.length;
  const superAdmins = users.filter(u => u.role === ROLES.SUPER_ADMIN).length;
  const operationsStaff = users.filter(u => [ROLES.ADMIN, ROLES.FINANCE].includes(u.role)).length;
  const salesStaff = users.filter(u => [ROLES.SALES_MANAGER, ROLES.SALES_EXECUTIVE].includes(u.role)).length;

  const columns = [
    {
      key: 'displayName',
      label: 'Staff Member & Email',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {(val || row.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {val || row.email?.split('@')[0]}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Assigned RBAC Role',
      sortable: true,
      render: (val) => {
        let badge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        if (val === 'SUPER_ADMIN') badge = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 font-semibold';
        else if (val === 'ADMIN') badge = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
        else if (val === 'SALES_MANAGER') badge = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
        else if (val === 'FINANCE') badge = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';

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
      label: 'Privileges',
      render: (val = []) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {val.length} granular rules
        </span>
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Privileges</span>
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
            <span>System</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Access Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            User Directory & RBAC Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-Based Access Control matrix: provision corporate accounts, define operational scopes, and enforce principle of least privilege
          </p>
        </div>

        <button
          onClick={() => setCreateDrawerOpen(true)}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Account</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={Users}
          subtext="Indexed identities"
        />
        <StatCard
          label="Super Administrators"
          value={superAdmins}
          icon={ShieldAlert}
          subtext="Full root privilege"
        />
        <StatCard
          label="Operations & Finance"
          value={operationsStaff}
          icon={Shield}
          subtext="Commercial authority"
        />
        <StatCard
          label="Sales Organization"
          value={salesStaff}
          icon={UserCheck}
          subtext="Pipeline & CRM access"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey={['displayName', 'email', 'role']}
        searchPlaceholder="Search accounts by name, email, or role..."
        filterKey="role"
        filterOptions={Object.values(ROLES).map(r => ({ label: r, value: r }))}
        onRowClick={(u) => handleOpenEdit(u)}
        exportFileName="brainlink_rbac_users"
        loading={loading}
      />

      {/* Slide-over Drawer for Permissions Editing */}
      <Drawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title={`Configure Role: ${selectedUser?.displayName || selectedUser?.email}`}
        subtitle="Manage assigned operational role or toggle fine-grained security capabilities"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditDrawerOpen(false)}
              className="st-btn-secondary px-3.5 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveUser}
              className="st-btn-primary px-4 py-1.5 text-xs shadow-sm"
            >
              Save Authorization
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Operational Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="st-select font-medium"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Granular Capabilities Matrix
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = formData.permissions.includes(perm);
                return (
                  <label
                    key={perm}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span className="font-mono text-[11px] truncate">{perm}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Drawer>

      {/* Slide-over Drawer for Provisioning New Account */}
      <Drawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Provision Staff Account"
        subtitle="Create credentials and assign initial RBAC security clearance"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateDrawerOpen(false)}
              className="st-btn-secondary px-3.5 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateUser}
              className="st-btn-primary px-4 py-1.5 text-xs shadow-sm"
            >
              Provision Account
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal / Staff Name *
            </label>
            <input
              type="text"
              required
              value={createFormData.displayName}
              onChange={(e) => setCreateFormData({ ...createFormData, displayName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="st-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corporate Email Address *
            </label>
            <input
              type="email"
              required
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="rahul@brainlink.in"
              className="st-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="••••••••••••"
              className="st-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Operational Role
            </label>
            <select
              value={createFormData.role}
              onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
              className="st-select font-medium"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
