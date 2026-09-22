import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Users,
  CheckCircle,
} from 'lucide-react';
import { teamService } from '../services/teamService';
import { leadService } from '../services/leadService';
import { User, UserRole, Lead } from '../types';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Add member modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([
        teamService.getAllUsers(),
        leadService.getAllLeads(),
      ]);
      setUsers(u);
      setLeads(l);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = teamService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (!user) return;
    await teamService.updateUserRole(targetUserId, newRole, { id: user.id, name: user.name });
    loadData();
  };

  const handleToggleStatus = async (targetUserId: string) => {
    if (!user) return;
    await teamService.toggleUserStatus(targetUserId, { id: user.id, name: user.name });
    loadData();
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !user) return;
    setModalError(null);

    try {
      await teamService.addUser(
        { name: name.trim(), email: email.trim(), role },
        { id: user.id, name: user.name }
      );
      setShowModal(false);
      setName('');
      setEmail('');
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add team member');
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Team &amp; Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer employee accounts, permissions, and assigned CRM lead allocations
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-center">Assigned Leads</th>
                <th className="py-3 px-3">Date Added</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const assignedCount = leads.filter((l) => l.assignedTo === u.id).length;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-lg border focus:outline-none capitalize ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="sales">Sales</option>
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {u.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      {assignedCount}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          u.status === 'active'
                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Team Member</h3>
            <p className="text-xs text-slate-500">
              New team members can log in using their work email address with standard credentials or Google.
            </p>

            {modalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@brainlink.in"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl capitalize"
                >
                  <option value="sales">Sales (Assigned Leads &amp; Notes)</option>
                  <option value="manager">Manager (Team Leads &amp; Assignment)</option>
                  <option value="admin">Admin (Full Control &amp; Settings)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-xl"
                >
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
