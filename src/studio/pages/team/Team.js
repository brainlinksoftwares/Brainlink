import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Building2,
  Trash2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const DEPARTMENTS = [
  'Engineering',
  'Design & UI/UX',
  'Product & Strategy',
  'Sales & BD',
  'Finance & Operations',
  'Executive Leadership',
];

export default function Team() {
  const { userProfile, role } = useAuth();
  const toast = useToast();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Fullstack Engineer',
    department: 'Engineering',
    type: 'Employee', // Employee, Intern, Contractor
    status: 'Active',
  });

  const loadTeam = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'team_members'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0) {
        // Fallback default team roster
        setTeamMembers([
          {
            id: 'tm-1',
            name: 'Aaditya Vishnoi',
            email: 'vishnoiaaditya29@gmail.com',
            role: 'Founder & CEO',
            department: 'Executive Leadership',
            type: 'Employee',
            status: 'Active',
          },
          {
            id: 'tm-2',
            name: 'Operations Lead',
            email: 'ceo.brainlink@gmail.com',
            role: 'Head of Operations',
            department: 'Finance & Operations',
            type: 'Employee',
            status: 'Active',
          },
        ]);
      } else {
        setTeamMembers(data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await addDoc(collection(db, 'team_members'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      toast.success(`Added ${formData.name} to team directory`);
      setModalOpen(false);
      await loadTeam();
    } catch (err) {
      toast.error('Failed to add team member');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Member Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">{row.role || 'Engineer'}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
          {val || 'Engineering'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Engagement Type',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-600 font-semibold">{val}</span>,
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Team Directory & Departments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Engineers, consultants, interns, and operational leaders across Brainlink Softwares
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teamMembers}
        searchKey={['name', 'email', 'department', 'role']}
        searchPlaceholder="Search team directory by name, role, department..."
        filterKey="department"
        filterOptions={DEPARTMENTS.map(d => ({ label: d, value: d }))}
        exportFileName="brainlink_team"
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Team Member"
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
              Save Member
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Engagement Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Employee">Full-time Employee</option>
              <option value="Intern">Intern</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
