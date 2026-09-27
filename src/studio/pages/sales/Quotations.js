import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Download,
  Trash,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getQuotations, createQuotation, updateQuotation, deleteQuotation } from '../../services/salesService';
import { generateQuotationPDF } from '../../services/pdfService';
import { getCompanySettings } from '../../services/settingsService';

export default function Quotations() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingQuot, setEditingQuot] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quotToDelete, setQuotToDelete] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    validUntil: '',
    discount: 0,
    tax: 0,
    status: 'Draft',
    items: [
      { description: 'Phase 1: Architecture Blueprint & Cloud Schema', quantity: 1, unitPrice: 250000 },
    ],
  });

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await getQuotations();
      setQuotations(data);
    } catch (err) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleOpenCreate = () => {
    setEditingQuot(null);
    setFormData({
      clientName: '',
      projectName: '',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discount: 0,
      tax: 0,
      status: 'Draft',
      items: [
        { description: 'Phase 1: Architecture Blueprint & UI/UX Design System', quantity: 1, unitPrice: 350000 },
      ],
    });
    setDrawerOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== index),
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, it) => sum + (it.quantity || 1) * (it.unitPrice || 0), 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName) {
      toast.error('Client name is required');
      return;
    }

    const subtotal = calculateSubtotal();
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    const total = subtotal - discount + tax;

    const payload = {
      ...formData,
      subtotal,
      discount,
      tax,
      total,
    };

    try {
      if (editingQuot) {
        await updateQuotation(editingQuot.id, payload, userProfile?.email);
        toast.success('Quotation updated');
      } else {
        await createQuotation(payload, userProfile?.email);
        toast.success('Quotation generated');
      }
      setDrawerOpen(false);
      await loadQuotations();
    } catch (err) {
      toast.error('Failed to save quotation');
    }
  };

  const handleDownloadPDF = async (quot) => {
    try {
      const company = await getCompanySettings();
      generateQuotationPDF(quot, company);
      toast.success('Downloaded Quotation PDF');
    } catch (err) {
      toast.error('Could not generate PDF');
    }
  };

  const handleDelete = async () => {
    if (!quotToDelete) return;
    try {
      await deleteQuotation(quotToDelete.id, userProfile?.email);
      toast.success('Quotation deleted');
      setDeleteConfirmOpen(false);
      setQuotToDelete(null);
      await loadQuotations();
    } catch (err) {
      toast.error('Failed to delete quotation');
    }
  };

  // Metrics
  const totalQuotations = quotations.length;
  const grossQuoted = quotations.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const convertedCount = quotations.filter(q => ['Accepted', 'Converted'].includes(q.status)).length;
  const convertedVolume = quotations
    .filter(q => ['Accepted', 'Converted'].includes(q.status))
    .reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  const columns = [
    {
      key: 'quotationNumber',
      label: 'Quotation ID & Project',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">
              {row.projectName || 'Software Development'}
            </div>
            <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {val || 'QUOT-2026-0001'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Account',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{val}</span>
      ),
    },
    {
      key: 'total',
      label: 'Quoted Total',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-medium text-slate-900 dark:text-white font-mono text-xs">
          {formatINR(val)}
        </span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
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
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditingQuot(row);
              setFormData(row);
              setDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Quotation"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setQuotToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Quotation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const subtotal = calculateSubtotal();
  const netTotal = subtotal - (Number(formData.discount) || 0) + (Number(formData.tax) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Sales</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Quotations</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Commercial Quotations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Itemized pricing estimates, deliverable cost breakdowns, and formal PDF generation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Quotations"
          value={totalQuotations}
          icon={FileText}
          subtext="Indexed documents"
        />
        <StatCard
          label="Gross Quoted Value"
          value={formatINR(grossQuoted)}
          icon={DollarSign}
          subtext="Total estimated value"
        />
        <StatCard
          label="Converted to Deals"
          value={convertedCount}
          icon={CheckCircle2}
          subtext="Accepted commercial terms"
        />
        <StatCard
          label="Converted Volume"
          value={formatINR(convertedVolume)}
          icon={Receipt}
          subtext="Won quotation revenue"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={quotations}
        searchKey={['quotationNumber', 'clientName', 'projectName']}
        searchPlaceholder="Search quotations by number, client, project..."
        filterKey="status"
        filterOptions={['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'].map(s => ({ label: s, value: s }))}
        onRowClick={(q) => {
          setEditingQuot(q);
          setFormData(q);
          setDrawerOpen(true);
        }}
        exportFileName="brainlink_quotations"
        loading={loading}
        emptyMessage="No commercial quotations recorded yet. Click 'New Quotation' to create an estimate."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingQuot ? `Edit Quotation: ${formData.quotationNumber || 'Estimate'}` : 'Generate Commercial Quotation'}
        subtitle="Itemized milestone pricing, tax rules, and client terms"
        size="lg"
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
              {editingQuot ? 'Save Changes' : 'Generate Quotation'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Apex Health Systems"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project / Deliverable Title
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Telehealth Mobile App & Backend"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="st-select"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Itemized Scope & Pricing
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
                    placeholder="Milestone or feature deliverable description"
                    className="flex-1 st-input"
                  />
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 st-input text-center font-mono"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={it.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-28 st-input text-right font-mono"
                    placeholder="Unit Price"
                  />
                  <div className="w-28 text-right font-medium text-slate-900 dark:text-white font-mono text-xs">
                    {formatINR((it.quantity || 1) * (it.unitPrice || 0))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-end space-y-2 text-xs">
            <div className="flex items-center justify-between w-64 text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white font-mono">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between w-64 text-slate-600 dark:text-slate-400">
              <span>Discount (₹):</span>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-24 st-input py-1 text-right font-mono"
              />
            </div>
            <div className="flex items-center justify-between w-64 text-slate-600 dark:text-slate-400">
              <span>Tax / GST (₹):</span>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="w-24 st-input py-1 text-right font-mono"
              />
            </div>
            <div className="flex items-center justify-between w-64 pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold">
              <span className="text-slate-900 dark:text-white">Net Quoted:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{formatINR(netTotal)}</span>
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Quotation"
        message="Are you sure you want to delete this commercial quotation?"
      />
    </div>
  );
}
