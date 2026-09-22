import React from 'react';
import { LeadPriority, LeadStatus, FollowUpStatus, TaskStatus } from '../../types';
import { DEFAULT_LEAD_STATUSES, DEFAULT_LEAD_PRIORITIES } from '../../config/crmConfig';

interface StatusBadgeProps {
  status: LeadStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = DEFAULT_LEAD_STATUSES.find((s) => s.key === status) || {
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: LeadPriority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const cfg = DEFAULT_LEAD_PRIORITIES.find((p) => p.key === priority) || {
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    dotColor: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${cfg.color} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dotColor}`} />
      {priority}
    </span>
  );
};

export const FollowUpStatusBadge: React.FC<{ status: FollowUpStatus | string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Pending', label: 'Pending' },
    completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Completed', label: 'Completed' },
    rescheduled: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Rescheduled', label: 'Rescheduled' },
    cancelled: { bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'Cancelled', label: 'Cancelled' },
  };
  const current = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Pending: 'bg-slate-100 text-slate-700 border-slate-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
};
