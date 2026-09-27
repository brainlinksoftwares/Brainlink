import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-1 border-b border-[var(--st-border)] mb-5 overflow-x-auto studio-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-3 h-10 text-[13px] whitespace-nowrap bg-transparent border-0 cursor-pointer transition-colors ${
              isActive
                ? 'font-semibold text-[var(--st-text-primary)]'
                : 'font-medium text-[var(--st-text-muted)] hover:text-[var(--st-text-primary)]'
            }`}
          >
            {Icon && (
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--st-accent-text)]' : ''}`} />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 min-w-[20px] h-5 inline-flex items-center justify-center rounded-full text-[10.5px] font-semibold ${
                  isActive
                    ? 'bg-[var(--st-accent-subtle)] text-[var(--st-accent-text)]'
                    : 'bg-[var(--st-surface-sunken)] text-[var(--st-text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-[image:var(--st-gradient)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
