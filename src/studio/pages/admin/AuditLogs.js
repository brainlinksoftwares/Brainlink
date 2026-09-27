import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  Lock,
  User,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
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

  // Metrics
  const totalEvents = logs.length;
  const uniqueActors = new Set(logs.map(l => l.user).filter(Boolean)).size;
  const uniqueEntities = new Set(logs.map(l => l.entity).filter(Boolean)).size;
  const recentMutations = logs.filter(l => Boolean(l.previousValue)).length;

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp (UTC / IST)',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Authorized Actor',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'System'}</span>
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Operation Executed',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Target Entity',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
          {val}{row.entityId ? ` (${row.entityId.slice(0, 8)})` : ''}
        </span>
      ),
    },
    {
      key: 'newValue',
      label: 'Audit Mutation Payload',
      render: (val, row) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-md truncate">
          {row.previousValue ? (
            <span>
              <span className="text-slate-400 line-through mr-1.5 font-mono">{row.previousValue}</span>
              <strong className="text-slate-900 dark:text-white font-mono">{val}</strong>
            </span>
          ) : (
            <span className="font-mono">{val || '—'}</span>
          )}
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
            <span className="text-slate-900 dark:text-white font-medium">Audit Logs</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              System Audit Trails
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <Lock className="w-3 h-3" /> Immutable Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sequenced timeline recording all privileged actions, data mutations, and security changes
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Audit Records"
          value={totalEvents}
          icon={Activity}
          subtext="Indexed compliance events"
        />
        <StatCard
          label="Unique Authorized Actors"
          value={uniqueActors}
          icon={User}
          subtext="Active operators"
        />
        <StatCard
          label="Monitored Entities"
          value={uniqueEntities}
          icon={ShieldCheck}
          subtext="Data models in registry"
        />
        <StatCard
          label="State Modifications"
          value={recentMutations}
          icon={Zap}
          subtext="Payload state deltas"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={logs}
        searchKey={['action', 'user', 'entity', 'newValue']}
        searchPlaceholder="Search audit events by action, user, entity, or payload..."
        exportFileName="brainlink_audit_logs"
        loading={loading}
        emptyMessage="No audit logs recorded yet."
      />
    </div>
  );
}
