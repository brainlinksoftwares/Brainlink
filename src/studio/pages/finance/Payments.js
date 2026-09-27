import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  Building2,
  Receipt,
  FileCheck2,
  ChevronRight,
  DollarSign,
  ArrowDownLeft,
  CheckCircle2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPayments, recordPayment, getInvoices } from '../../services/financeService';

export default function Payments() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: '',
    invoiceNumber: '',
    clientName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [payData, invData] = await Promise.all([getPayments(), getInvoices()]);
      setPayments(payData);
      setInvoices(invData.filter(i => i.status !== 'Cancelled'));
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    const unpaidInv = invoices.find(i => (i.outstandingAmount || i.total) > 0) || invoices[0] || {};
    setFormData({
      invoiceId: unpaidInv.id || '',
      invoiceNumber: unpaidInv.invoiceNumber || '',
      clientName: unpaidInv.clientCompany || unpaidInv.clientName || '',
      amount: unpaidInv.outstandingAmount !== undefined ? unpaidInv.outstandingAmount : (unpaidInv.total || ''),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      transactionReference: '',
      notes: '',
    });
    setDrawerOpen(true);
  };

  const handleInvoiceSelect = (invId) => {
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setFormData({
        ...formData,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientCompany || inv.clientName || '',
        amount: inv.outstandingAmount !== undefined ? inv.outstandingAmount : inv.total,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Valid payment amount is required');
      return;
    }

    try {
      await recordPayment(formData, userProfile?.email);
      toast.success('Payment recorded and reconciled in ledger');
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  // Metrics
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const bankTransfers = payments
    .filter(p => p.paymentMethod === 'Bank Transfer')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const upiPayments = payments
    .filter(p => p.paymentMethod === 'UPI')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalTransactions = payments.length;

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID & Client',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {row.clientName || 'Client Account'}
            </div>
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {val || 'PAY-001'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      label: 'Linked Invoice',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium">
          {val || 'Direct Settlement'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Collected',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono text-xs">
          +{formatINR(val)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          {val}
        </span>
      ),
    },
    {
      key: 'transactionReference',
      label: 'UTR / Ref',
      render: (val) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Received On',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
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
            <span className="text-slate-900 dark:text-white font-medium">Payments</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Settlement & Inflow Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified cash receipts, bank UTR reference matching, and real-time invoice balance reconciliation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Inflow</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Cash Inflow"
          value={formatINR(totalCollected)}
          icon={DollarSign}
          subtext="Cumulative collections"
        />
        <StatCard
          label="Bank Wire / RTGS"
          value={formatINR(bankTransfers)}
          icon={Building2}
          subtext="Institutional settlement"
        />
        <StatCard
          label="UPI Collections"
          value={formatINR(upiPayments)}
          icon={CreditCard}
          subtext="Instant transfer volume"
        />
        <StatCard
          label="Settled Tranches"
          value={totalTransactions}
          icon={CheckCircle2}
          subtext="Reconciled transactions"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={payments}
        searchKey={['paymentId', 'clientName', 'invoiceNumber', 'transactionReference']}
        searchPlaceholder="Search payments by ID, client, invoice, or UTR..."
        exportFileName="brainlink_payments"
        loading={loading}
        emptyMessage="No payment settlements recorded yet. Click 'Record Inflow' to capture receipts."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Record Payment Inflow"
        subtitle="Auto-updates outstanding balances and records transaction in the company ledger"
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
              Reconcile Inflow
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Invoice (Optional)
              </label>
              <select
                value={formData.invoiceId}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="st-select"
              >
                <option value="">Direct Client Payment (No invoice linked)</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.clientCompany || inv.clientName} (Outstanding: {formatINR(inv.outstandingAmount !== undefined ? inv.outstandingAmount : inv.total)})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Payer Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Apex Global Solutions Pvt Ltd"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Received (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="250000"
                className="st-input font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Settlement Channel
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="st-select"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI Transfer</option>
                <option value="Card">Corporate Credit Card</option>
                <option value="Payment Gateway">Payment Gateway (Razorpay/Stripe)</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank UTR / Transaction Ref
              </label>
              <input
                type="text"
                value={formData.transactionReference}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                placeholder="HDFC/NEFT/20260927001"
                className="st-input font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Reconciliation Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="TDS deductions withheld, conversion fees, or banking remarks..."
                className="st-textarea"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
