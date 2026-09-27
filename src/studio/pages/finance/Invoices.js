import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Download,
  CreditCard,
  Building2,
  Trash,
  AlertTriangle,
  Ban,
  FileCheck2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  cancelInvoice,
  recordPayment,
} from '../../services/financeService';
import { getClients } from '../../services/clientService';
import { getProjects } from '../../services/projectService';
import { generateInvoicePDF } from '../../services/pdfService';
import { getCompanySettings } from '../../services/settingsService';

export default function Invoices() {
  const { userProfile, role } = useAuth();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Invoice Builder Form
  const [formData, setFormData] = useState({
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientGstin: '',
    billingAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxType: 'intra', // 'intra' (CGST+SGST) or 'inter' (IGST)
    taxRate: 18,
    discount: 0,
    status: 'Sent',
    items: [
      { description: 'Fullstack Web Application Development & AI Architecture', hsn: '998314', quantity: 1, rate: 350000 },
    ],
  });

  // Payment Form
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, clientData, projData] = await Promise.all([
        getInvoices(),
        getClients(),
        getProjects(),
      ]);
      setInvoices(invData);
      setClients(clientData);
      setProjects(projData);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingInvoice(null);
    const defClient = clients[0] || {};
    setFormData({
      clientName: defClient.primaryContact || defClient.companyName || '',
      clientCompany: defClient.companyName || '',
      clientEmail: defClient.email || '',
      clientGstin: defClient.gstin || '',
      billingAddress: defClient.billingAddress || '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      taxType: 'intra',
      taxRate: 18,
      discount: 0,
      status: 'Sent',
      items: [
        { description: 'Cloud Architecture & Next.js SaaS Engineering', hsn: '998314', quantity: 1, rate: 250000 },
      ],
    });
    setModalOpen(true);
  };

  const handleClientSelect = (companyName) => {
    const cl = clients.find(c => c.companyName === companyName);
    if (cl) {
      setFormData({
        ...formData,
        clientCompany: cl.companyName,
        clientName: cl.primaryContact || cl.companyName,
        clientEmail: cl.email || '',
        clientGstin: cl.gstin || '',
        billingAddress: cl.billingAddress || '',
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'rate' ? Number(value) : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', hsn: '998314', quantity: 1, rate: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== index),
    });
  };

  // Live calculation
  const subtotal = formData.items.reduce((s, it) => s + (it.quantity || 1) * (it.rate || 0), 0);
  const taxable = Math.max(0, subtotal - (Number(formData.discount) || 0));
  const taxAmount = Math.round((taxable * (Number(formData.taxRate) || 18)) / 100);
  const totalInvoiceVal = taxable + taxAmount;

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formData.clientName && !formData.clientCompany) {
      toast.error('Client details are required');
      return;
    }

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, formData, userProfile?.email);
        toast.success('Invoice updated');
      } else {
        await createInvoice(formData, userProfile?.email);
        toast.success('Invoice issued & logged to financial ledger');
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Error saving invoice');
    }
  };

  const handleDownloadPDF = async (inv) => {
    try {
      const company = await getCompanySettings();
      generateInvoicePDF(inv, company);
      toast.success(`Downloaded ${inv.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error('Failed to generate PDF invoice');
    }
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentFormData({
      amount: inv.outstandingAmount !== undefined ? inv.outstandingAmount : inv.total,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      transactionReference: '',
      notes: `Settlement for invoice ${inv.invoiceNumber}`,
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    try {
      await recordPayment(
        {
          ...paymentFormData,
          invoiceId: selectedInvoiceForPayment.id,
          invoiceNumber: selectedInvoiceForPayment.invoiceNumber,
          clientName: selectedInvoiceForPayment.clientName,
        },
        userProfile?.email
      );

      toast.success('Payment recorded and reconciled against invoice');
      setPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  const handleCancelInvoiceConfirm = async () => {
    if (!invoiceToCancel) return;
    try {
      await cancelInvoice(invoiceToCancel.id, cancelReason, userProfile?.email);
      toast.success('Invoice cancelled and reversal logged in financial ledger');
      setCancelModalOpen(false);
      setInvoiceToCancel(null);
      setCancelReason('');
      await loadData();
    } catch (err) {
      toast.error('Failed to cancel invoice');
    }
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice No',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-blue-600 text-xs">{val}</span>
          <div className="text-xs text-slate-500 mt-0.5">{row.clientCompany || row.clientName}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Invoice & Due Date',
      render: (_, row) => (
        <div className="text-xs space-y-0.5 text-slate-600">
          <div>Issued: {formatDate(row.invoiceDate)}</div>
          <div className="text-slate-400">Due: {formatDate(row.dueDate)}</div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Billed Amount',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div className="text-right">
          <div className="font-bold text-slate-900">{formatINR(val)}</div>
          <div className="text-[10px] text-slate-400">Taxable: {formatINR(row.taxableAmount || row.subtotal)}</div>
        </div>
      ),
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      sortable: true,
      align: 'right',
      render: (val = 0, row) => (
        <div className="text-right">
          <div className={`font-bold ${val > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatINR(val)}
          </div>
          <div className="text-[10px] text-slate-400">Paid: {formatINR(row.paidAmount || 0)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => {
        const isCancelled = row.status === 'Cancelled';
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleDownloadPDF(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download Tax Invoice PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            {!isCancelled && row.status !== 'Paid' && (
              <button
                onClick={() => handleOpenPayment(row)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Record Client Payment"
              >
                <CreditCard className="w-4 h-4" />
              </button>
            )}

            {!isCancelled && (
              <button
                onClick={() => {
                  setInvoiceToCancel(row);
                  setCancelModalOpen(true);
                }}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cancel Invoice (Financial Safe Reversal)"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
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
            GST Invoices & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indian GST-compliant tax invoices, auto-reconciled ledger accounting & branded PDF creation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKey={['invoiceNumber', 'clientName', 'clientCompany']}
        searchPlaceholder="Search invoices by number, client..."
        filterKey="status"
        filterOptions={['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].map(s => ({ label: s, value: s }))}
        onRowClick={(inv) => handleDownloadPDF(inv)}
        exportFileName="brainlink_invoices"
        loading={loading}
        emptyMessage="No invoices generated yet."
      />

      {/* Invoice Generator Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInvoice ? 'Edit Tax Invoice' : 'Issue GST Tax Invoice'}
        subtitle="Calculates subtotal, discount, CGST/SGST (intra-state) or IGST (inter-state), and total"
        maxWidth="max-w-3xl"
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
              onClick={handleSaveInvoice}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Issue Invoice
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Client</label>
              <select
                value={formData.clientCompany}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select or Type Below</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.companyName}>{c.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client Legal Name *</label>
              <input
                type="text"
                required
                value={formData.clientCompany || formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client GSTIN</label>
              <input
                type="text"
                value={formData.clientGstin}
                onChange={(e) => setFormData({ ...formData, clientGstin: e.target.value.toUpperCase() })}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GST Tax Type</label>
              <select
                value={formData.taxType}
                onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="intra">Intra-State (CGST 9% + SGST 9%)</option>
                <option value="inter">Inter-State (IGST 18%)</option>
              </select>
            </div>
          </div>

          {/* Line items */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Invoice Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={it.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description of Services / Software Deliverables"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={it.hsn}
                    onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                    placeholder="HSN/SAC"
                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center font-mono"
                  />
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={it.rate}
                    onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                    className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-right"
                    placeholder="Rate"
                  />
                  <div className="w-24 text-right font-semibold text-slate-800 text-xs">
                    {formatINR((it.quantity || 1) * (it.rate || 0))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-slate-100 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex items-center justify-between w-72">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between w-72">
              <span className="text-slate-500">Discount:</span>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-24 px-2 py-1 border border-slate-200 rounded text-right text-xs"
              />
            </div>
            <div className="flex items-center justify-between w-72">
              <span className="text-slate-500">Taxable Value:</span>
              <span className="font-semibold text-slate-800">{formatINR(taxable)}</span>
            </div>
            <div className="flex items-center justify-between w-72">
              <span className="text-slate-500">
                {formData.taxType === 'intra' ? 'CGST (9%) + SGST (9%)' : 'IGST (18%)'}:
              </span>
              <span className="font-semibold text-slate-800">{formatINR(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between w-72 pt-2 border-t border-slate-200 text-sm font-bold">
              <span className="text-slate-900">Total Invoice (INR):</span>
              <span className="text-blue-600">{formatINR(totalInvoiceVal)}</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Client Payment"
        subtitle={`Settlement for ${selectedInvoiceForPayment?.invoiceNumber}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRecordPayment}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Record Payment
            </button>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Amount (INR ₹) *</label>
            <input
              type="number"
              required
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentFormData.paymentMethod}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
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
              value={paymentFormData.paymentDate}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Reference / UTR</label>
            <input
              type="text"
              value={paymentFormData.transactionReference}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionReference: e.target.value })}
              placeholder="e.g. HDFC/NEFT/123456"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={paymentFormData.notes}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
              placeholder="Milestone settlement notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* Safe Invoice Cancellation Modal (Section 37) */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Invoice (Safe Financial Audit)"
        subtitle={`Invoice ${invoiceToCancel?.invoiceNumber} will be marked Cancelled and reversed in the ledger.`}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCancelInvoiceConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Confirm Cancellation
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            In compliance with business audit regulations, invoices cannot be silently deleted. Cancelling will log an audited reversal in the Transaction Ledger.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Cancellation *</label>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Scope revision or re-billing"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
