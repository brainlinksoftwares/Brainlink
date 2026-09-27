import React from 'react';
import {
  Calendar,
  PhoneCall,
  Mail,
  FileText,
  Clock,
  Sparkles,
  CreditCard,
  FolderGit2,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function ActivityTimeline({
  activities = [],
  emptyMessage = 'No activity recorded yet.',
  limit,
}) {
  const getIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'call':
        return <PhoneCall className="w-3 h-3 text-[#315CFF]" />;
      case 'email':
        return <Mail className="w-3 h-3 text-indigo-500" />;
      case 'meeting':
        return <Calendar className="w-3 h-3 text-amber-500" />;
      case 'payment':
        return <CreditCard className="w-3 h-3 text-emerald-500" />;
      case 'deal':
      case 'statuschange':
        return <Sparkles className="w-3 h-3 text-[#315CFF]" />;
      case 'invoice':
        return <FileText className="w-3 h-3 text-purple-500" />;
      case 'project':
        return <FolderGit2 className="w-3 h-3 text-cyan-500" />;
      default:
        return <Clock className="w-3 h-3 text-[#9299A6]" />;
    }
  };

  const items = limit ? activities.slice(0, limit) : activities;

  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[#9299A6]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E7E9EE] dark:before:bg-[#222733]">
      {items.map((act) => (
        <div key={act.id} className="relative group">
          {/* Node Icon Indicator */}
          <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#10131A] border border-[#E7E9EE] dark:border-[#222733] flex items-center justify-center group-hover:border-[#315CFF] transition-colors shadow-2xs">
            {getIcon(act.type)}
          </div>

          <div className="bg-white dark:bg-[#10131A] rounded-lg border border-[#E7E9EE] dark:border-[#222733] p-2.5 transition-colors hover:border-[#CBD0DC] dark:hover:border-[#333C4E]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#111318] dark:text-white">
                {act.title}
              </span>
              <span className="text-[10px] text-[#9299A6] shrink-0 font-medium">
                {formatDateTime(act.createdAt)}
              </span>
            </div>
            {act.description && (
              <p className="text-[11px] text-[#626A78] dark:text-[#9AA3B2] mt-0.5 leading-relaxed">
                {act.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#9299A6]">
              <span className="font-medium text-[#626A78] dark:text-[#9AA3B2]">
                {act.user || 'System'}
              </span>
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
