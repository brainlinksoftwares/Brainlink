import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-[#E7E9EE] dark:border-[#222733] mb-5 overflow-x-auto studio-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors -mb-px ${
              isActive
                ? 'border-[#315CFF] text-[#315CFF] dark:text-[#5D80FF]'
                : 'border-transparent text-[#626A78] hover:text-[#111318] dark:text-[#9AA3B2] dark:hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-sans font-semibold ${
                  isActive
                    ? 'bg-[#315CFF]/15 text-[#315CFF] dark:text-[#5D80FF]'
                    : 'bg-[#F6F7F9] text-[#626A78] dark:bg-[#151923] dark:text-[#9AA3B2]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
