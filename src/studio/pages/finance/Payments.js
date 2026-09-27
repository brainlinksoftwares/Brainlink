import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  Building2,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);

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
    setModalOpen(true);
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
      toast.success('Payment recorded and updated in financial ledger');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-blue-600 text-xs">{val || 'PAY-001'}</span>
          <div className="text-xs font-semibold text-slate-900 mt-0.5">{row.clientName || 'Client'}</div>
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      label: 'Linked Invoice',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
          {val || 'Direct Payment'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Collected',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-emerald-600">{formatINR(val)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {val}
        </span>
      ),
    },
    {
      key: 'transactionReference',
      label: 'Ref / UTR',
      render: (val) => <span className="font-mono text-xs text-slate-600">{val || '—'}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Received On',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Payments Received
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total cash settlement collected: <strong className="text-emerald-600 font-bold">{formatINR(totalCollected)}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchKey={['paymentId', 'clientName', 'invoiceNumber', 'transactionReference']}
        searchPlaceholder="Search payments by ID, client, invoice, UTR..."
        exportFileName="brainlink_payments"
        loading={loading}
        emptyMessage="No payments recorded yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment Inflow"
        subtitle="Auto-updates invoice balances and appends to the financial ledger"
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
              Record Payment
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Select Invoice</label>
            <select
              value={formData.invoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Direct Client Payment (No invoice)</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.clientCompany || inv.clientName} (Bal: {formatINR(inv.outstandingAmount !== undefined ? inv.outstandingAmount : inv.total)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount Received (INR ₹) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI</option>
              <option value="Card">Corporate Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Payment Gateway">Payment Gateway</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Bank UTR</label>
            <input
              type="text"
              value={formData.transactionReference}
              onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
              placeholder="e.g. HDFC/NEFT/981273981273"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
