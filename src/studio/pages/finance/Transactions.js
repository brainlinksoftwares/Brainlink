import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Calendar,
  Lock,
  ChevronRight,
  DollarSign,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTransactions } from '../../services/financeService';

export default function Transactions() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(200);
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const totalEntries = transactions.length;
  const paymentInflows = transactions
    .filter(t => t.type === 'PAYMENT_RECEIVED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const expenseOutflows = transactions
    .filter(t => t.type === 'EXPENSE_ADDED')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const invoiceTranches = transactions.filter(t => t.type === 'INVOICE_CREATED').length;

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp (UTC / IST)',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Financial Event',
      sortable: true,
      render: (val) => {
        let style = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        let Icon = ShieldAlert;

        if (val === 'PAYMENT_RECEIVED') {
          style = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          Icon = ArrowDownLeft;
        } else if (val === 'INVOICE_CREATED') {
          style = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
          Icon = Receipt;
        } else if (val === 'EXPENSE_ADDED') {
          style = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
          Icon = ArrowUpRight;
        } else if (val === 'INVOICE_CANCELLED' || val === 'EXPENSE_REVERSED') {
          style = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            <Icon className="w-3 h-3" />
            <span>{val.replace(/_/g, ' ')}</span>
          </span>
        );
      },
    },
    {
      key: 'reference',
      label: 'Reference No',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Narrative',
      render: (val) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-sm truncate">
          {val}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Ledger Delta',
      sortable: true,
      align: 'right',
      render: (val) => {
        const num = Number(val) || 0;
        const isPositive = num > 0;
        return (
          <span className={`font-mono font-medium text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? `+${formatINR(num)}` : `-${formatINR(Math.abs(num))}`}
          </span>
        );
      },
    },
    {
      key: 'user',
      label: 'Auditor ID',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {val || 'system'}
        </span>
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
            <span className="text-slate-900 dark:text-white font-medium">Audit Ledger</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              Immutable Financial Ledger
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <Lock className="w-3 h-3" /> Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade double-entry ledger capturing all tax invoices, incoming payments, and operating expenditure
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Ledger Records"
          value={totalEntries}
          icon={Lock}
          subtext="Cryptographically sequenced"
        />
        <StatCard
          label="Total Reconciled Inflow"
          value={formatINR(paymentInflows)}
          icon={ArrowDownLeft}
          subtext="Net settlements captured"
        />
        <StatCard
          label="Total Ledger Outflows"
          value={formatINR(expenseOutflows)}
          icon={ArrowUpRight}
          subtext="Disbursed operating debits"
        />
        <StatCard
          label="Invoices Dispatched"
          value={invoiceTranches}
          icon={Receipt}
          subtext="Tax-compliant billings"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey={['reference', 'description', 'user', 'type']}
        searchPlaceholder="Search ledger by reference, description, author..."
        filterKey="type"
        filterOptions={[
          { label: 'Payments Received', value: 'PAYMENT_RECEIVED' },
          { label: 'Invoices Created', value: 'INVOICE_CREATED' },
          { label: 'Expenses Added', value: 'EXPENSE_ADDED' },
          { label: 'Invoices Cancelled', value: 'INVOICE_CANCELLED' },
          { label: 'Expenses Reversed', value: 'EXPENSE_REVERSED' },
        ]}
        exportFileName="brainlink_transactions_ledger"
        loading={loading}
        emptyMessage="No financial ledger transactions recorded yet."
      />
    </div>
  );
}
