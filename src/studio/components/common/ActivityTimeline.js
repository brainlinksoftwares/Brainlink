import React from 'react';
import {
  Calendar,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  Mail,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/formatters';

export default function ActivityTimeline({ activities = [], emptyMessage = 'No activity recorded yet.' }) {
  const getIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'deal':
      case 'statuschange':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
      case 'invoice':
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
      case 'project':
        return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs group-hover:border-blue-500 transition-colors">
            {getIcon(act.type)}
          </div>

          <div className="bg-white rounded-lg border border-slate-200/70 p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800">{act.title}</span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {formatDateTime(act.createdAt)}
              </span>
            </div>
            {act.description && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.description}</p>
            )}
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="font-medium text-slate-600">{act.user || 'System'}</span>
              {act.entityType && (
                <>
                  <span>•</span>
                  <span className="capitalize">{act.entityType}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
