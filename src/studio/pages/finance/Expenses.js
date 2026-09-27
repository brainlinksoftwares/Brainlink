import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Tag,
  CreditCard,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const totalExpenseAmount = expenses
    .filter(e => !e.reversed)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const columns = [
    {
      key: 'expenseId',
      label: 'Expense ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-rose-600 text-xs">{val || 'EXP-001'}</span>
          <div className="text-xs font-semibold text-slate-800 mt-0.5">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor / Provider',
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-slate-700">{val || '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount (INR)',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <span className={`font-bold ${row.reversed ? 'line-through text-slate-400' : 'text-rose-600'}`}>
          {formatINR(val)}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => {
        if (row.reversed) {
          return <span className="text-[10px] text-slate-400 font-semibold uppercase">Reversed</span>;
        }
        return (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setExpenseToReverse(row);
                setDeleteConfirmOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Reverse Expense Voucher"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Operating Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total active expenditures: <strong className="text-rose-600 font-bold">{formatINR(totalExpenseAmount)}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        searchKey={['expenseId', 'description', 'vendor', 'category']}
        searchPlaceholder="Search expenses by ID, vendor, description..."
        filterKey="category"
        filterOptions={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))}
        exportFileName="brainlink_expenses"
        loading={loading}
        emptyMessage="No expenses recorded yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Operating Expense"
        subtitle="Vouchers will be automatically factored into net profitability calculations"
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
              Save Expense
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. AWS Cloud Dedicated TURN Server Hosting"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount (INR ₹) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 28500"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vendor / Payee</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="e.g. Amazon Web Services"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Linked Project (Optional)</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">General Overhead (Not project linked)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Corporate Card">Corporate Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleReverse}
        title="Reverse Expense Voucher"
        message="Are you sure you want to reverse this expense? A reversal transaction will be recorded in the audit ledger."
        confirmText="Reverse Expense"
      />
    </div>
  );
}
