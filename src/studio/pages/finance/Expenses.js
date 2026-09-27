import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Tag,
  CreditCard,
  ChevronRight,
  Receipt,
  Server,
  Users,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getExpenses, createExpense, deleteExpense } from '../../services/financeService';
import { getProjects } from '../../services/projectService';

const EXPENSE_CATEGORIES = [
  'Software',
  'Hosting',
  'Advertising',
  'Office',
  'Travel',
  'Salary',
  'Contractor',
  'Equipment',
  'Marketing',
  'Miscellaneous',
];

export default function Expenses() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToReverse, setExpenseToReverse] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Software',
    description: '',
    amount: '',
    tax: 0,
    vendor: '',
    projectId: '',
    paymentMethod: 'Corporate Card',
    date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, projData] = await Promise.all([getExpenses(), getProjects()]);
      setExpenses(expData);
      setProjects(projData);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      category: 'Software',
      description: '',
      amount: '',
      tax: 0,
      vendor: '',
      projectId: '',
      paymentMethod: 'Corporate Card',
      date: new Date().toISOString().split('T')[0],
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Description and amount are required');
      return;
    }

    try {
      await createExpense(formData, userProfile?.email);
      toast.success('Expense recorded and appended to financial ledger');
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Failed to record expense');
    }
  };

  const handleReverse = async () => {
    if (!expenseToReverse) return;
    try {
      await deleteExpense(expenseToReverse.id, userProfile?.email);
      toast.success('Expense marked as reversed in ledger');
      setDeleteConfirmOpen(false);
      setExpenseToReverse(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to reverse expense');
    }
  };

  // Metrics
  const activeExpenses = expenses.filter(e => !e.reversed);
  const totalExpenseAmount = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const cloudHosting = activeExpenses
    .filter(e => ['Hosting', 'Software'].includes(e.category))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const contractorPayroll = activeExpenses
    .filter(e => ['Salary', 'Contractor'].includes(e.category))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalActiveVouchers = activeExpenses.length;

  const columns = [
    {
      key: 'expenseId',
      label: 'Expense ID & Narrative',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{row.description}</div>
            <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {val || 'EXP-001'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {val}
        </span>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor / Provider',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{val || '—'}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Debit Amount',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div className="text-right">
          <span className={`font-mono text-xs font-medium ${row.reversed ? 'line-through text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
            -{formatINR(val)}
          </span>
          {row.reversed && (
            <div className="text-[10px] text-amber-600 font-semibold">Reversed</div>
          )}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Source',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Voucher Date',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {!row.reversed && (
            <button
              onClick={() => {
                setExpenseToReverse(row);
                setDeleteConfirmOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
              title="Reverse Expense Voucher"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
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
            <span>Finance</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Expenses</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Operational Expenses & Outflow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operating expenditure, cloud infrastructure costs, contractor invoices, and compliance debit tracking
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Operating Outflow"
          value={formatINR(totalExpenseAmount)}
          icon={DollarSign}
          subtext="Net confirmed debits"
        />
        <StatCard
          label="Cloud & SaaS"
          value={formatINR(cloudHosting)}
          icon={Server}
          subtext="Hosting & subscriptions"
        />
        <StatCard
          label="Talent & Payroll"
          value={formatINR(contractorPayroll)}
          icon={Users}
          subtext="Salaries & contractor fees"
        />
        <StatCard
          label="Active Vouchers"
          value={totalActiveVouchers}
          icon={Receipt}
          subtext="Reconciled expense lines"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={expenses}
        searchKey={['expenseId', 'description', 'vendor', 'category']}
        searchPlaceholder="Search expenses by ID, description, vendor, or category..."
        filterKey="category"
        filterOptions={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))}
        exportFileName="brainlink_expenses"
        loading={loading}
        emptyMessage="No operating expenses recorded yet. Click 'Add Expense' to capture overheads."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Record Operating Expense"
        subtitle="Log operational overheads, contractor payments, or cloud infrastructure debits"
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
              Record Debit
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Narrative / Description *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. AWS Production Cloud Infrastructure & Kubernetes Cluster"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expenditure Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="st-select"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="45000"
                className="st-input font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Service Provider
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Amazon Web Services or GitHub"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Allocated Project (Optional)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="st-select"
              >
                <option value="">General Overhead</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="st-select"
              >
                <option value="Corporate Card">Corporate Credit Card</option>
                <option value="Bank Transfer">Bank Wire / RTGS</option>
                <option value="UPI">UPI</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Voucher Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="st-input"
              />
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleReverse}
        title="Reverse Expense Voucher"
        message="Are you sure you want to reverse this operating expense in the audit ledger?"
      />
    </div>
  );
}
