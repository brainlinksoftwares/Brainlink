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
      className={`st-card p-4 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''
      }`}
    >
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
          {value}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold text-xs ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
