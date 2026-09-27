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
  ChevronRight,
  UserCheck,
  Code,
  LineChart,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      setDrawerOpen(false);
      await loadTeam();
    } catch (err) {
      toast.error('Failed to add team member');
    }
  };

  // Metrics
  const totalStaff = teamMembers.length;
  const engineeringCount = teamMembers.filter(m => m.department === 'Engineering').length;
  const executiveCount = teamMembers.filter(m => ['Executive Leadership', 'Product & Strategy'].includes(m.department)).length;
  const activeCount = teamMembers.filter(m => m.status === 'Active').length;

  const columns = [
    {
      key: 'name',
      label: 'Staff Member & Role',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{row.role || 'Staff Engineer'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          {val || 'Engineering'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Engagement',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {val || 'Employee'}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Work Email',
      sortable: true,
      render: (val) => (
        <a
          href={`mailto:${val}`}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{val}</span>
        </a>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>System</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Team Roster</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Staff & Engineering Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal organization roster, department allocations, employee engagement tiers, and direct coordinates
          </p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Team Members"
          value={totalStaff}
          icon={Users}
          subtext="Active organization size"
        />
        <StatCard
          label="Software Engineering"
          value={engineeringCount}
          icon={Code}
          subtext="Developers & architects"
        />
        <StatCard
          label="Product & Leadership"
          value={executiveCount}
          icon={Shield}
          subtext="Executive management"
        />
        <StatCard
          label="Active Status"
          value={activeCount}
          icon={UserCheck}
          subtext="Current staff roster"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={teamMembers}
        searchKey={['name', 'email', 'role', 'department']}
        searchPlaceholder="Search staff by name, email, role, or department..."
        exportFileName="brainlink_team_roster"
        loading={loading}
        emptyMessage="No team members registered yet."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Staff Member"
        subtitle="Provision a new internal employee, contractor, or intern record"
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
              Register Member
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@brainlink.in"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="st-select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Engagement Model
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="st-select"
              >
                <option value="Employee">Full-Time Employee</option>
                <option value="Contractor">Technical Contractor</option>
                <option value="Intern">Software Engineering Intern</option>
                <option value="Advisor">Advisor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
        </form>
      </Drawer>
    </div>
  );
}
