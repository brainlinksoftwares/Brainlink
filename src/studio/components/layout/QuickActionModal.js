import React, { useState } from 'react';
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
  Plus,
  CheckSquare,
} from 'lucide-react';
import { createLead } from '../../services/crmService';
import { createDeal } from '../../services/salesService';
import { createProject } from '../../services/projectService';
import { recordPayment, createExpense } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuickActionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [selectedAction, setSelectedAction] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const actions = [
    { id: 'lead', title: 'New Lead', icon: Users, color: 'text-blue-600 bg-blue-50', path: '/studio/crm/leads' },
    { id: 'deal', title: 'New Deal', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50', path: '/studio/sales/pipeline' },
    { id: 'client', title: 'New Client', icon: Building2, color: 'text-cyan-600 bg-cyan-50', path: '/studio/clients' },
    { id: 'project', title: 'New Project', icon: FolderGit2, color: 'text-amber-600 bg-amber-50', path: '/studio/projects' },
    { id: 'task', title: 'New Task', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50', path: '/studio/projects/tasks' },
    { id: 'invoice', title: 'New Invoice', icon: Receipt, color: 'text-purple-600 bg-purple-50', path: '/studio/finance/invoices' },
    { id: 'payment', title: 'Record Payment', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50', path: '/studio/finance/payments' },
    { id: 'expense', title: 'Add Expense', icon: DollarSign, color: 'text-rose-600 bg-rose-50', path: '/studio/finance/expenses' },
    { id: 'proposal', title: 'New Proposal', icon: FileCheck2, color: 'text-blue-600 bg-blue-50', path: '/studio/sales/proposals' },
    { id: 'meeting', title: 'Schedule Meeting', icon: Calendar, color: 'text-orange-600 bg-orange-50', path: '/studio/sales/meetings' },
    { id: 'document', title: 'Upload Document', icon: FileText, color: 'text-slate-600 bg-slate-100', path: '/studio/documents' },
  ];

  const handleSelect = (action) => {
    navigate(action.path);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Quick Action"
      subtitle="Quickly initiate workflows, create records, or record transactions from anywhere"
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleSelect(act)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-blue-400 hover:shadow-sm transition-all duration-200 text-center group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${act.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
