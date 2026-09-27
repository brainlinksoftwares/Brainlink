import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Calendar,
  Lock,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
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

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 font-mono">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Event Type',
      sortable: true,
      render: (val) => {
        let style = 'bg-slate-100 text-slate-700';
        let Icon = ShieldAlert;

        if (val === 'PAYMENT_RECEIVED') {
          style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          Icon = ArrowDownLeft;
        } else if (val === 'INVOICE_CREATED') {
          style = 'bg-blue-50 text-blue-700 border-blue-200';
        } else if (val === 'EXPENSE_ADDED') {
          style = 'bg-rose-50 text-rose-700 border-rose-200';
          Icon = ArrowUpRight;
        } else if (val === 'INVOICE_CANCELLED' || val === 'EXPENSE_REVERSED') {
          style = 'bg-amber-50 text-amber-700 border-amber-200';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
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
      render: (val) => <span className="font-mono text-xs font-bold text-slate-900">{val || '—'}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <div className="text-xs text-slate-600 max-w-sm">{val}</div>,
    },
    {
      key: 'amount',
      label: 'Ledger Amount',
      sortable: true,
      align: 'right',
      render: (val) => {
        const num = Number(val) || 0;
        const isPositive = num > 0;
        return (
          <span className={`font-mono font-bold text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? `+ ${formatINR(num)}` : `- ${formatINR(Math.abs(num))}`}
          </span>
        );
      },
    },
    {
      key: 'user',
      label: 'Recorded By',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 font-medium">{val || 'system'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Financial Audit Ledger
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
              <Lock className="w-3 h-3" /> Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 26 compliance: append-only auditable ledger recording all inflows, billings, and operating expenses
          </p>
        </div>
      </div>

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
