import React from 'react';

const STATUS_STYLES = {
  // Leads & Pipeline
  'new': 'bg-slate-100 text-slate-700 border-slate-200',
  'contacted': 'bg-blue-50 text-blue-700 border-blue-200',
  'qualified': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'meeting': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'meeting scheduled': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'proposal': 'bg-purple-50 text-purple-700 border-purple-200',
  'proposal sent': 'bg-purple-50 text-purple-700 border-purple-200',
  'negotiation': 'bg-amber-50 text-amber-700 border-amber-200',
  'won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'lost': 'bg-rose-50 text-rose-700 border-rose-200',

  // Project & Task Statuses
  'planning': 'bg-slate-100 text-slate-700 border-slate-200',
  'active': 'bg-blue-50 text-blue-700 border-blue-200',
  'in progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'on hold': 'bg-amber-50 text-amber-700 border-amber-200',
  'at risk': 'bg-rose-50 text-rose-700 border-rose-200',
  'delayed': 'bg-rose-50 text-rose-700 border-rose-200',
  'review': 'bg-purple-50 text-purple-700 border-purple-200',
  'blocked': 'bg-rose-50 text-rose-700 border-rose-200',
  'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'cancelled': 'bg-slate-200 text-slate-700 border-slate-300',
  'todo': 'bg-slate-100 text-slate-700 border-slate-200',

  // Invoices & Payments
  'draft': 'bg-slate-100 text-slate-700 border-slate-200',
  'sent': 'bg-blue-50 text-blue-700 border-blue-200',
  'partially paid': 'bg-amber-50 text-amber-700 border-amber-200',
  'paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'overdue': 'bg-rose-50 text-rose-700 border-rose-200',

  // Priority
  'high': 'bg-rose-50 text-rose-700 border-rose-200',
  'urgent': 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
  'medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'low': 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const key = String(status).toLowerCase().trim();
  const style = STATUS_STYLES[key] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
