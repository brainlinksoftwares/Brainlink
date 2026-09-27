import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const TONES = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'slate'];

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
  sparkline,
}) {
  const isPositive = trend && (trend.startsWith('+') || trend.startsWith('↑'));
  const isNegative = trend && (trend.startsWith('-') || trend.startsWith('↓'));
  const tone = TONES.includes(color) ? color : 'blue';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`st-kpi-block group text-left w-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-[var(--st-text-secondary)]">{title}</div>
          <div className="mt-2 text-[26px] leading-none font-bold tracking-[-0.03em] text-[var(--st-text-primary)] tabular-nums truncate">
            {value}
          </div>
        </div>
        {Icon && (
          <span className={`st-icon-chip st-tone-${tone}`}>
            <Icon className="w-[17px] h-[17px]" />
          </span>
        )}
      </div>

      {sparkline}

      {(subtext || trend) && (
        <div className="mt-3.5 flex items-center gap-2 text-xs min-w-0">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[11px] px-1.5 py-0.5 rounded-md shrink-0 ${
                isPositive
                  ? 'text-[var(--st-success-text)] bg-[var(--st-success-subtle)]'
                  : isNegative
                  ? 'text-[var(--st-danger-text)] bg-[var(--st-danger-subtle)]'
                  : 'text-[var(--st-text-secondary)] bg-[var(--st-surface-sunken)]'
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtext && <span className="text-[var(--st-text-muted)] text-[11.5px] truncate">{subtext}</span>}
          {onClick && (
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto shrink-0 text-[var(--st-text-disabled)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--st-accent-text)] transition-all duration-200" />
          )}
        </div>
      )}
    </Tag>
  );
}
