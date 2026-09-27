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

import { useStudioBase } from '../../context/StudioBaseContext';

export default function QuickActionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { basePath } = useStudioBase();

  const actions = [
    { id: 'lead', title: 'New Lead', icon: Users, path: '/crm/leads' },
    { id: 'deal', title: 'New Deal', icon: TrendingUp, path: '/sales/pipeline' },
    { id: 'client', title: 'New Client', icon: Building2, path: '/clients' },
    { id: 'project', title: 'New Project', icon: FolderGit2, path: '/projects' },
    { id: 'task', title: 'New Task', icon: CheckSquare, path: '/projects/tasks' },
    { id: 'invoice', title: 'New Invoice', icon: Receipt, path: '/finance/invoices' },
    { id: 'payment', title: 'Record Payment', icon: CreditCard, path: '/finance/payments' },
    { id: 'expense', title: 'Add Expense', icon: DollarSign, path: '/finance/expenses' },
    { id: 'proposal', title: 'New Proposal', icon: FileCheck2, path: '/sales/proposals' },
    { id: 'meeting', title: 'Schedule Meeting', icon: Calendar, path: '/sales/meetings' },
    { id: 'document', title: 'Upload Document', icon: FileText, path: '/documents' },
  ];

  const handleSelect = (action) => {
    const fullUrl = basePath ? `${basePath}${action.path.startsWith('/') ? action.path : `/${action.path}`}` : action.path;
    navigate(fullUrl);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New"
      subtitle="Select an action to launch drawer or view"
      maxWidth="max-w-xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleSelect(act)}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
