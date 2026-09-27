import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
}) {
  const isPositive = trend && (trend.startsWith('+') || trend.startsWith('↑'));
  const isNegative = trend && (trend.startsWith('-') || trend.startsWith('↓'));

  return (
    <div
      onClick={onClick}
      className={`st-kpi-block ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#626A78] dark:text-[#9AA3B2]">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-[#F6F7F9] dark:bg-[#151923] text-[#626A78] dark:text-[#9AA3B2] flex items-center justify-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-2.5">
        <div className="text-[26px] font-bold tracking-tight text-[#111318] dark:text-white font-sans tabular-nums leading-none">
          {value}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                  : isNegative
                  ? 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                  : 'text-[#626A78] bg-[#F6F7F9] dark:text-[#9AA3B2] dark:bg-[#151923]'
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-[#626A78] dark:text-[#9AA3B2] text-[11px] truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
