import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  Lock,
  User,
  Activity,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAuditLogs } from '../../services/auditService';

export default function AuditLogs() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(250);
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load audit logs');
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
      label: 'Logged Timestamp',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 font-mono">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Authorized Actor',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {val || 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action Executed',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
          {val}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Target Entity',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs font-mono text-blue-600">
          {val}{row.entityId ? ` (${row.entityId.slice(0, 8)})` : ''}
        </span>
      ),
    },
    {
      key: 'newValue',
      label: 'Audit Mutation Payload / Details',
      render: (val, row) => (
        <div className="text-xs text-slate-600 max-w-md truncate">
          {row.previousValue ? (
            <span>
              <span className="text-slate-400 line-through mr-1.5">{row.previousValue}</span>
              <strong className="text-slate-800">{val}</strong>
            </span>
          ) : (
            val || '—'
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
              System Audit Trails
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
              <Lock className="w-3 h-3" /> Compliance Immutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 29 compliance: every privileged event, data modification, or status change is cryptographically traceable
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchKey={['action', 'user', 'entity', 'newValue']}
        searchPlaceholder="Search audit events by action, user, entity, payload..."
        exportFileName="brainlink_audit_logs"
        loading={loading}
        emptyMessage="No audit logs recorded yet."
      />
    </div>
  );
}
