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
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
      setModalOpen(false);
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

  const columns = [
    {
      key: 'quotationNumber',
      label: 'Quotation No',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-blue-600 text-xs">{val || 'QUOT-2026-0001'}</span>
          <div className="text-xs font-semibold text-slate-800 mt-0.5">{row.projectName || 'Software Development'}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      key: 'total',
      label: 'Quoted Total',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{formatINR(val)}</span>,
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(val)}
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
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingQuot(row);
              setFormData(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setQuotToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const subtotal = calculateSubtotal();
  const netTotal = subtotal - (Number(formData.discount) || 0) + (Number(formData.tax) || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Quotations System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Itemized price quotations, commercial estimates, and branded PDF generation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

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
          setModalOpen(true);
        }}
        exportFileName="brainlink_quotations"
        loading={loading}
        emptyMessage="No quotations generated yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuot ? 'Edit Quotation' : 'Create Quotation'}
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
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Quotation
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Telehealth Mobile App"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Quotation Line Items</span>
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
                    placeholder="Item description / milestone deliverable"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
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
                    value={it.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-right"
                    placeholder="Unit Price"
                  />
                  <div className="w-28 text-right font-semibold text-slate-800 text-xs">
                    {formatINR((it.quantity || 1) * (it.unitPrice || 0))}
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
            <div className="flex items-center justify-between w-64">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between w-64">
              <span className="text-slate-500">Discount:</span>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-24 px-2 py-1 border border-slate-200 rounded text-right text-xs"
              />
            </div>
            <div className="flex items-center justify-between w-64 pt-2 border-t border-slate-100 text-sm font-bold">
              <span className="text-slate-900">Total Quoted:</span>
              <span className="text-blue-600">{formatINR(netTotal)}</span>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Quotation"
        message="Are you sure you want to permanently delete this quotation?"
      />
    </div>
  );
}
