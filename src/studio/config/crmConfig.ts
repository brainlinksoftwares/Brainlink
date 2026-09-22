import { LeadPriority, LeadStatus, FollowUpType } from '../types';

export const DEFAULT_LEAD_STATUSES: { key: LeadStatus; label: string; color: string; bg: string; border: string }[] = [
  { key: 'New', label: 'New', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'Contacted', label: 'Contacted', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'Qualified', label: 'Qualified', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'Proposal Sent', label: 'Proposal Sent', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'Negotiation', label: 'Negotiation', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'Won', label: 'Won', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'Lost', label: 'Lost', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  { key: 'On Hold', label: 'On Hold', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
];

export const DEFAULT_LEAD_PRIORITIES: { key: LeadPriority; label: string; color: string; dotColor: string }[] = [
  { key: 'Low', label: 'Low', color: 'text-slate-600 bg-slate-100 border-slate-200', dotColor: 'bg-slate-400' },
  { key: 'Medium', label: 'Medium', color: 'text-blue-700 bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' },
  { key: 'High', label: 'High', color: 'text-amber-700 bg-amber-50 border-amber-200', dotColor: 'bg-amber-500' },
  { key: 'Urgent', label: 'Urgent', color: 'text-rose-700 bg-rose-50 border-rose-200', dotColor: 'bg-rose-500' },
];

export const DEFAULT_LEAD_SOURCES = [
  'Website',
  'Google',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Referral',
  'Cold Outreach',
  'Email',
  'IndiaMART',
  'Justdial',
  'Upwork',
  'Fiverr',
  'Other',
];

export const DEFAULT_SERVICES = [
  'Website Development',
  'Web Applications',
  'Mobile App Development',
  'SaaS Development',
  'CRM Development',
  'ERP Development',
  'E-commerce Development',
  'UI/UX Design',
  'Software Maintenance',
  'Digital Solutions',
  'Technical Consulting',
];

export const FOLLOW_UP_TYPES: FollowUpType[] = [
  'Call',
  'WhatsApp',
  'Email',
  'Meeting',
  'Demo',
  'Proposal Follow-up',
  'Other',
];

export const BUDGET_RANGES = [
  'Under ₹25,000',
  '₹25,000 – ₹1,00,000',
  '₹1,00,000 – ₹5,00,000',
  '₹5,00,000 – ₹15,00,000',
  '₹15,00,000+',
  'Custom / Enterprise',
];

export const TIMELINE_OPTIONS = [
  'Immediate (< 1 week)',
  '1 – 2 weeks',
  '2 – 4 weeks',
  '1 – 3 months',
  'Flexible',
];

export const COMPANY_SIZE_OPTIONS = [
  '1-10 employees (Startup / Small)',
  '11-50 employees (Growing SME)',
  '51-200 employees (Mid-Market)',
  '201-500 employees',
  '500+ employees (Enterprise)',
];
