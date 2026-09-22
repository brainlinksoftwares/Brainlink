import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { teamService } from '../services/teamService';
import { analyticsService, DashboardMetrics } from '../services/analyticsService';
import { EmptyState } from '../components/common/EmptyState';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leads, followUps, users] = await Promise.all([
        leadService.getAllLeads(),
        followUpService.getAllFollowUps(),
        teamService.getAllUsers(),
      ]);
      const data = analyticsService.calculateMetrics(leads, followUps, users);
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = leadService.subscribe(loadData);
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = metrics && metrics.totalLeads > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Sales &amp; Pipeline Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          In-depth channel attribution, conversion velocity, and team performance metrics
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics records yet"
          description="Analytics and conversion ratios are computed dynamically from actual closed leads and customer touchpoints in your CRM."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Attribution Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Channel Attribution</h3>
              <p className="text-xs text-slate-500">Lead generation channels producing top inquiries</p>
            </div>

            <div className="space-y-3">
              {metrics?.leadsBySource.map((s) => (
                <div key={s.source}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-800">{s.source}</span>
                    <span className="text-slate-500">
                      {s.count} leads ({s.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${s.percentage}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Stage Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Stage Distribution</h3>
              <p className="text-xs text-slate-500">Current volume distribution across sales stages</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metrics?.leadsByStatus.map((st) => (
                <div key={st.status} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium block truncate">{st.status}</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">{st.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lifecycle Funnel Drop-off</h3>
              <p className="text-xs text-slate-500">
                Conversion drop-off across standard qualification milestones
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {metrics?.funnelData.map((f, i) => (
                <div
                  key={f.stage}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-center flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Stage {i + 1}
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-2">{f.stage}</p>
                  <span className="text-xl font-bold text-blue-600 mt-1">{f.count}</span>
                  <span className="text-[10px] text-slate-400 mt-2">
                    {metrics.totalLeads > 0
                      ? `${Math.round((f.count / metrics.totalLeads) * 100)}% of pipeline`
                      : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
