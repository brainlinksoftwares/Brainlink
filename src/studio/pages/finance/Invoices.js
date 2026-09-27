import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Plus,
  Download,
  CreditCard,
  Building2,
  Trash2,
  Ban,
  FileCheck2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
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

  // Drawers and Modals
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
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
      { description: 'Cloud Architecture & Next.js SaaS Engineering', hsn: '998314', quantity: 1, rate: 250000 },
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

  const loadData = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
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
    setCreateDrawerOpen(true);
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
  const isIntra = formData.taxType === 'intra';
  const taxRate = Number(formData.taxRate) || 18;
  const cgst = isIntra ? (taxable * (taxRate / 2)) / 100 : 0;
  const sgst = isIntra ? (taxable * (taxRate / 2)) / 100 : 0;
  const igst = !isIntra ? (taxable * taxRate) / 100 : 0;
  const totalTax = cgst + sgst + igst;
  const grandTotal = taxable + totalTax;

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formData.clientCompany) {
      toast.error('Client company is required');
      return;
    }

    try {
      const payload = {
        ...formData,
        subtotal,
        taxableAmount: taxable,
        cgst,
        sgst,
        igst,
        taxAmount: totalTax,
        total: grandTotal,
        discount: Number(formData.discount) || 0,
      };

      await createInvoice(payload, userProfile?.email);
      toast.success('Invoice generated & registered');
      setCreateDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to create invoice');
    }
  };

  const handleDownloadPDF = async (inv) => {
    try {
      toast.info('Generating GST Tax Invoice PDF...');
      const settings = await getCompanySettings();
      await generateInvoicePDF(inv, settings);
      toast.success('Downloaded PDF successfully');
    } catch (err) {
      toast.error('Failed to generate PDF document');
    }
  };

  const handleRowClick = (inv) => {
    setSelectedInvoice(inv);
    setPreviewDrawerOpen(true);
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    const outstanding = inv.outstandingAmount !== undefined ? inv.outstandingAmount : (inv.total - (inv.paidAmount || 0));
    setPaymentFormData({
      amount: outstanding || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      transactionReference: '',
      notes: '',
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await recordPayment(
        {
          invoiceId: selectedInvoice.id,
          invoiceNumber: selectedInvoice.invoiceNumber,
          clientId: selectedInvoice.clientId,
          clientName: selectedInvoice.clientName || selectedInvoice.clientCompany,
          amount: Number(paymentFormData.amount) || 0,
          paymentDate: paymentFormData.paymentDate,
          paymentMethod: paymentFormData.paymentMethod,
          transactionReference: paymentFormData.transactionReference,
          notes: paymentFormData.notes,
        },
        userProfile?.email
      );

      toast.success('Payment recorded & auto-reconciled!');
      setPaymentModalOpen(false);
      setPreviewDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  const handleCancelInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await cancelInvoice(selectedInvoice.id, cancelReason, userProfile?.email);
      toast.success(`Invoice ${selectedInvoice.invoiceNumber} cancelled`);
      setCancelModalOpen(false);
      setPreviewDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to cancel invoice');
    }
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          {val}
        </span>
      ),
    },
    {
      key: 'clientCompany',
      label: 'Client',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-xs text-slate-900 dark:text-white">{val || row.clientName}</div>
          <div className="text-[11px] text-slate-400">{row.clientGstin ? `GST: ${row.clientGstin}` : 'Unregistered'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'Sent'} />,
    },
    {
      key: 'total',
      label: 'Total Amount',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {formatINR(val || 0)}
        </span>
      ),
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const out = val !== undefined ? val : (row.total || 0) - (row.paidAmount || 0);
        return (
          <span className={`font-mono text-xs font-semibold ${out > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatINR(out)}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {row.status !== 'Paid' && row.status !== 'Cancelled' && (
            <button
              onClick={() => handleOpenPayment(row)}
              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Record Payment"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            GST Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full Indian GST compliance (CGST/SGST/IGST), reconciliation, and branded PDF generation.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="st-btn-primary st-btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Main Invoices Table */}
      <DataTable
        columns={columns}
        data={invoices}
        searchKey={['invoiceNumber', 'clientCompany', 'clientName']}
        searchPlaceholder="Search invoices by number or client..."
        filterKey="status"
        filterOptions={[
          { label: 'Sent', value: 'Sent' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Overdue', value: 'Overdue' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        onRowClick={handleRowClick}
        loading={loading}
        exportFileName="brainlink_invoices"
      />

      {/* SIDE DRAWER: Create GST Invoice */}
      <Drawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="New GST Tax Invoice"
        subtitle="Generates compliant Indian tax invoice with CGST/SGST or IGST"
        width="max-w-2xl"
        footer={
          <>
            <button type="button" onClick={() => setCreateDrawerOpen(false)} className="st-btn-secondary">
              Cancel
            </button>
            <button type="submit" form="invoice-form" className="st-btn-primary">
              Issue Invoice ({formatINR(grandTotal)})
            </button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
          {/* Client Selection */}
          <div className="st-card p-3 space-y-3">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Client & Billing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Select Registered Client
                </label>
                <select
                  value={formData.clientCompany}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="st-select w-full"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.companyName}>
                      {c.companyName} ({c.primaryContact})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Client GSTIN
                </label>
                <input
                  type="text"
                  value={formData.clientGstin}
                  onChange={(e) => setFormData({ ...formData, clientGstin: e.target.value })}
                  placeholder="29AAAAA0000A1Z5"
                  className="st-input font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="st-input"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="st-input"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="st-card p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Services & Deliverables
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="st-btn-secondary st-btn-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-md border border-slate-200 dark:border-slate-700/60">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Service description"
                      className="st-input st-input-sm"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                      placeholder="SAC/HSN"
                      className="st-input st-input-sm font-mono"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="st-input st-input-sm font-mono text-center"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      placeholder="Rate"
                      className="st-input st-input-sm font-mono text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={formData.items.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discount Options */}
          <div className="st-card p-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                GST Tax Jurisdiction
              </label>
              <select
                value={formData.taxType}
                onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                className="st-select w-full"
              >
                <option value="intra">Intra-State (CGST 9% + SGST 9%)</option>
                <option value="inter">Inter-State (IGST 18%)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Discount (INR)
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0"
                className="st-input font-mono"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-lg space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {Number(formData.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-{formatINR(Number(formData.discount))}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Value:</span>
              <span>{formatINR(taxable)}</span>
            </div>
            {isIntra ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span>
                  <span>{formatINR(cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span>
                  <span>{formatINR(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-500">
                <span>IGST (18%):</span>
                <span>{formatINR(igst)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Invoice Amount:</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </form>
      </Drawer>

      {/* SIDE DRAWER: Professional Document Preview (Section 24) */}
      <Drawer
        isOpen={previewDrawerOpen}
        onClose={() => setPreviewDrawerOpen(false)}
        title={selectedInvoice?.invoiceNumber || 'Invoice Preview'}
        subtitle={`Issued to ${selectedInvoice?.clientCompany || selectedInvoice?.clientName}`}
        width="max-w-2xl"
        footer={
          selectedInvoice && (
            <>
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="st-btn-secondary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              {selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Cancelled' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCancelModalOpen(true);
                    }}
                    className="st-btn-danger st-btn-sm"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(selectedInvoice)}
                    className="st-btn-primary"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </>
              )}
            </>
          )
        }
      >
        {selectedInvoice && (
          <div className="space-y-5 text-xs">
            {/* Document Header */}
            <div className="st-card p-5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    BRAINLINK SOFTWARES
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    GSTIN: 07AABCU9603R1ZM • Noida, UP, India
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoice.status || 'Sent'} />
                  </div>
                </div>
              </div>

              {/* Billed To / Dates */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <div className="text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Billed To:
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedInvoice.clientCompany || selectedInvoice.clientName}
                  </div>
                  <div className="text-slate-500">{selectedInvoice.billingAddress || 'India'}</div>
                  {selectedInvoice.clientGstin && (
                    <div className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      GSTIN: {selectedInvoice.clientGstin}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-400">Issue Date: </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedInvoice.invoiceDate || selectedInvoice.createdAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date: </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedInvoice.dueDate || 'Upon receipt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-semibold uppercase text-slate-400">
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">SAC</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                    {(selectedInvoice.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-sans pr-2 text-slate-800 dark:text-slate-200">
                          {item.description}
                        </td>
                        <td className="py-2.5 text-center text-slate-500">{item.hsn || '998314'}</td>
                        <td className="py-2.5 text-center text-slate-700 dark:text-slate-300">{item.quantity || 1}</td>
                        <td className="py-2.5 text-right text-slate-700 dark:text-slate-300">{formatINR(item.rate || 0)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                          {formatINR((item.quantity || 1) * (item.rate || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <div className="w-64 space-y-1.5 font-mono text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatINR(selectedInvoice.subtotal || selectedInvoice.total)}</span>
                  </div>
                  {selectedInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>GST (18%):</span>
                      <span>{formatINR(selectedInvoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Total:</span>
                    <span>{formatINR(selectedInvoice.total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Paid:</span>
                    <span>{formatINR(selectedInvoice.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                    <span>Balance Due:</span>
                    <span>
                      {formatINR(
                        selectedInvoice.outstandingAmount !== undefined
                          ? selectedInvoice.outstandingAmount
                          : (selectedInvoice.total || 0) - (selectedInvoice.paidAmount || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Customer Payment"
        subtitle={`Appends transaction to immutable financial ledger for ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Amount Received (INR) *
            </label>
            <input
              type="number"
              required
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              className="st-input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentFormData.paymentDate}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                className="st-input"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentFormData.paymentMethod}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                className="st-select w-full"
              >
                <option value="Bank Transfer">NEFT / RTGS / IMPS</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Cheque">Cheque</option>
                <option value="Razorpay">Razorpay Gateway</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Bank UTR / Transaction Reference
            </label>
            <input
              type="text"
              value={paymentFormData.transactionReference}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionReference: e.target.value })}
              placeholder="e.g. UTR1234567890"
              className="st-input font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setPaymentModalOpen(false)} className="st-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="st-btn-primary">
              Confirm & Reconcile
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Invoice Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Tax Invoice"
        subtitle={`Safe cancellation protocol for ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleCancelInvoiceSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Reason for Cancellation *
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Commercial scope revision / Client requested credit note..."
              className="st-textarea"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setCancelModalOpen(false)} className="st-btn-secondary">
              Keep Active
            </button>
            <button type="submit" className="st-btn-danger">
              Cancel Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
