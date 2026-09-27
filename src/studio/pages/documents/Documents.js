import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Calendar,
  Eye,
  Tag,
  Lock,
  Globe,
  Upload,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getDocuments,
  createDocumentRecord,
  deleteDocumentRecord,
  DOCUMENT_CATEGORIES,
} from '../../services/documentService';

export default function Documents() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Contracts',
    clientName: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '1.4 MB',
    version: 'v1.0',
    isPublicToClient: false,
    tags: 'legal, signed',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Contracts',
      clientName: '',
      fileUrl: '',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      version: 'v1.0',
      isPublicToClient: false,
      tags: '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Document title is required');
      return;
    }

    try {
      await createDocumentRecord(formData, userProfile?.email);
      toast.success('Document registered in vault');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('Failed to register document');
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocumentRecord(docToDelete.id, userProfile?.email);
      toast.success('Document deleted');
      setDeleteConfirmOpen(false);
      setDocToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Document Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{val}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {row.docId || 'DOC-001'} • {row.fileType || 'PDF'} ({row.fileSize || '1.0 MB'}) • {row.version || 'v1.0'}
          </div>
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
      key: 'isPublicToClient',
      label: 'Visibility',
      sortable: true,
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          val ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {val ? <Globe className="w-3 h-3 text-blue-600" /> : <Lock className="w-3 h-3 text-slate-500" />}
          <span>{val ? 'Client Portal' : 'Internal Only'}</span>
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'Author',
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-slate-700">{val || 'Aaditya'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date Added',
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
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Open File"
            >
              <Eye className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => {
              setDocToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Corporate Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 28 compliant storage for master agreements, scopes, certificates, and handover documents
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        searchKey={['title', 'category', 'clientName', 'uploadedBy']}
        searchPlaceholder="Search documents by title, category, client..."
        filterKey="category"
        filterOptions={DOCUMENT_CATEGORIES.map(c => ({ label: c, value: c }))}
        exportFileName="brainlink_documents"
        loading={loading}
        emptyMessage="No documents found in vault."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Document to Vault"
        subtitle="Upload or link legal agreements, scope briefs, and delivery certificates"
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
              Save Document
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Master Services Agreement (MSA) - Nova Health Systems"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="e.g. Nova Health Systems"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Document Link / Storage URL</label>
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="https://firebasestorage.googleapis.com/... or Google Drive Link"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="v1.0"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isPublicToClient"
              checked={formData.isPublicToClient}
              onChange={(e) => setFormData({ ...formData, isPublicToClient: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublicToClient" className="font-semibold text-slate-700 cursor-pointer">
              Visible in Client Portal
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document from the vault?"
      />
    </div>
  );
}
