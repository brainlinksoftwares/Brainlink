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
  ChevronRight,
  ShieldCheck,
  FolderGit2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import StatCard from '../../components/ui/StatCard';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(true);
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
      setDrawerOpen(false);
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

  // Metrics
  const totalDocuments = documents.length;
  const legalContracts = documents.filter(d => ['Contracts', 'NDA', 'Agreements'].includes(d.category)).length;
  const clientVisible = documents.filter(d => d.isPublicToClient).length;
  const internalVault = documents.filter(d => !d.isPublicToClient).length;

  const columns = [
    {
      key: 'title',
      label: 'Document & Metadata',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white truncate">{val}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
              {row.docId || 'DOC-001'} • {row.fileType || 'PDF'} ({row.fileSize || '1.0 MB'}) • {row.version || 'v1.0'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {val}
        </span>
      ),
    },
    {
      key: 'isPublicToClient',
      label: 'Scope / Visibility',
      sortable: true,
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
            val
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {val ? <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : <Lock className="w-3 h-3 text-slate-400" />}
          <span>{val ? 'Client Portal' : 'Internal Vault'}</span>
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
          {val || 'Aaditya'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(val)}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
              title="View Document"
            >
              <Eye className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => {
              setDocToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>System</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-medium">Documents</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Corporate Document Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized document repository for master services agreements, SOWs, compliance certificates, and client handover bundles
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="st-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Documents"
          value={totalDocuments}
          icon={FileText}
          subtext="Vault assets"
        />
        <StatCard
          label="Contracts & NDAs"
          value={legalContracts}
          icon={ShieldCheck}
          subtext="Executed master agreements"
        />
        <StatCard
          label="Shared with Clients"
          value={clientVisible}
          icon={Globe}
          subtext="Accessible in client portal"
        />
        <StatCard
          label="Internal Vault"
          value={internalVault}
          icon={Lock}
          subtext="Restricted to staff"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={documents}
        searchKey={['title', 'category', 'clientName', 'uploadedBy']}
        searchPlaceholder="Search vault by document title, category, client, or author..."
        filterKey="category"
        filterOptions={DOCUMENT_CATEGORIES.map(c => ({ label: c, value: c }))}
        exportFileName="brainlink_documents"
        loading={loading}
        emptyMessage="No documents stored in vault yet. Click 'Upload Document' to archive contracts."
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Register Document to Vault"
        subtitle="Upload or link legal agreements, scope briefs, and delivery certificates"
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
              Archive Document
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Master Services Agreement (MSA) - Apex Global Solutions"
                className="st-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Classification
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="st-select"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Client
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Apex Global Solutions"
                className="st-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Storage Link / Secure File URL
              </label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://storage.googleapis.com/... or Google Drive URL"
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Version Release
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="v1.0"
                className="st-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Type / Format
              </label>
              <input
                type="text"
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                placeholder="PDF"
                className="st-input font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublicToClient"
                checked={formData.isPublicToClient}
                onChange={(e) => setFormData({ ...formData, isPublicToClient: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <label htmlFor="isPublicToClient" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Publish to Client Portal (Client can download directly)
              </label>
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to permanently delete this document from the vault?"
      />
    </div>
  );
}
