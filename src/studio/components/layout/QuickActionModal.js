import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import {
  Users,
  Building2,
  TrendingUp,
  FolderGit2,
  Receipt,
  CreditCard,
  FileCheck2,
  Calendar,
  FileText,
  DollarSign,
  CheckSquare,
} from 'lucide-react';

import { useStudioPath } from '../../context/StudioBaseContext';

export default function QuickActionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const toPath = useStudioPath();

  const actions = [
    { id: 'lead', title: 'New Lead', icon: Users, path: '/crm/leads', tone: 'blue' },
    { id: 'deal', title: 'New Deal', icon: TrendingUp, path: '/sales/pipeline', tone: 'violet' },
    { id: 'client', title: 'New Client', icon: Building2, path: '/clients', tone: 'cyan' },
    { id: 'project', title: 'New Project', icon: FolderGit2, path: '/projects', tone: 'blue' },
    { id: 'task', title: 'New Task', icon: CheckSquare, path: '/projects/tasks', tone: 'emerald' },
    { id: 'invoice', title: 'New Invoice', icon: Receipt, path: '/finance/invoices', tone: 'violet' },
    { id: 'payment', title: 'Record Payment', icon: CreditCard, path: '/finance/payments', tone: 'emerald' },
    { id: 'expense', title: 'Add Expense', icon: DollarSign, path: '/finance/expenses', tone: 'rose' },
    { id: 'proposal', title: 'New Proposal', icon: FileCheck2, path: '/sales/proposals', tone: 'amber' },
    { id: 'meeting', title: 'Schedule Meeting', icon: Calendar, path: '/sales/meetings', tone: 'cyan' },
    { id: 'document', title: 'Upload Document', icon: FileText, path: '/documents', tone: 'slate' },
  ];

  const handleSelect = (action) => {
    navigate(toPath(action.path));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New"
      subtitle="Jump straight into creating a record"
      maxWidth="max-w-xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleSelect(act)}
              className="st-card st-card-interactive flex flex-col items-start gap-3 p-3.5 text-left group"
            >
              <span className={`st-icon-chip st-tone-${act.tone} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[13px] font-semibold text-[var(--st-text-primary)]">{act.title}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
