import { Lead, FollowUp, User } from '../types';

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  followupsDue: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number; // percentage
  pipelineValue: number; // estimated INR
  leadsOverTime: { date: string; count: number }[];
  leadsBySource: { source: string; count: number; percentage: number }[];
  leadsByStatus: { status: string; count: number }[];
  funnelData: { stage: string; count: number; dropRate?: number }[];
  teamPerformance: {
    userId: string;
    userName: string;
    totalAssigned: number;
    wonCount: number;
    conversionRate: number;
  }[];
}

/**
 * Calculates budget estimate numbers from strings like "₹25,000 – ₹1,00,000"
 */
function parseEstimatedBudget(budgetStr?: string): number {
  if (!budgetStr) return 50000; // default estimated average
  const cleaned = budgetStr.replace(/[^0-9]/g, '');
  if (!cleaned) return 50000;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 50000 : Math.min(num, 2000000);
}

export const analyticsService = {
  calculateMetrics: (
    leads: Lead[],
    followUps: FollowUp[],
    users: User[]
  ): DashboardMetrics => {
    const activeLeads = leads.filter((l) => !l.archived);
    const totalLeads = activeLeads.length;

    let newLeads = 0;
    let qualifiedLeads = 0;
    let convertedLeads = 0;
    let lostLeads = 0;
    let pipelineValue = 0;

    const sourceCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      'Proposal Sent': 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0,
      'On Hold': 0,
    };

    const datesMap: Record<string, number> = {};

    activeLeads.forEach((lead) => {
      // Status breakdown
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;

      if (lead.status === 'New') newLeads++;
      if (lead.status === 'Qualified') qualifiedLeads++;
      if (lead.status === 'Won') convertedLeads++;
      if (lead.status === 'Lost') lostLeads++;

      // Estimated pipeline value for active in-progress deals
      if (['Qualified', 'Proposal Sent', 'Negotiation', 'Won'].includes(lead.status)) {
        pipelineValue += parseEstimatedBudget(lead.budget);
      }

      // Source counts
      const src = lead.source || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;

      // Group by date (YYYY-MM-DD)
      const dateKey = lead.createdAt.split('T')[0];
      datesMap[dateKey] = (datesMap[dateKey] || 0) + 1;
    });

    // Conversion rate: Won / (Won + Lost + others resolved) or Won / Total
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Followups due today or overdue
    const nowTime = new Date().getTime();
    const todayStr = new Date().toISOString().split('T')[0];
    const followupsDue = followUps.filter((f) => {
      if (f.status === 'completed' || f.status === 'cancelled') return false;
      const isToday = f.scheduledAt.split('T')[0] === todayStr;
      const isOverdue = new Date(f.scheduledAt).getTime() < nowTime;
      return isToday || isOverdue;
    }).length;

    // Time series (sorted by date)
    const sortedDates = Object.keys(datesMap).sort();
    const leadsOverTime = sortedDates.slice(-14).map((d) => ({
      date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: datesMap[d],
    }));

    // Sources breakdown
    const leadsBySource = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Status breakdown
    const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // Conversion Funnel
    const funnelStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won'];
    const funnelData = funnelStages.map((st) => ({
      stage: st,
      count: statusCounts[st] || 0,
    }));

    // Team Performance
    const teamMap: Record<string, { total: number; won: number }> = {};
    activeLeads.forEach((lead) => {
      if (lead.assignedTo) {
        if (!teamMap[lead.assignedTo]) teamMap[lead.assignedTo] = { total: 0, won: 0 };
        teamMap[lead.assignedTo].total++;
        if (lead.status === 'Won') teamMap[lead.assignedTo].won++;
      }
    });

    const teamPerformance = users.map((u) => {
      const stats = teamMap[u.id] || { total: 0, won: 0 };
      const rate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0;
      return {
        userId: u.id,
        userName: u.name,
        totalAssigned: stats.total,
        wonCount: stats.won,
        conversionRate: rate,
      };
    });

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      followupsDue,
      convertedLeads,
      lostLeads,
      conversionRate,
      pipelineValue,
      leadsOverTime,
      leadsBySource,
      leadsByStatus,
      funnelData,
      teamPerformance,
    };
  },
};
