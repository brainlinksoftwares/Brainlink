import { analyticsService } from '../services/analyticsService';
import { Lead, FollowUp, User } from '../types';

describe('Analytics Calculation Suite', () => {
  const mockLeads: Lead[] = [
    {
      id: 'l1',
      name: 'Lead 1',
      company: 'C1',
      email: 'l1@c1.com',
      phone: '111',
      service: 'Web Apps',
      requirement: 'Req 1',
      source: 'Google',
      status: 'New',
      priority: 'Medium',
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'l2',
      name: 'Lead 2',
      company: 'C2',
      email: 'l2@c2.com',
      phone: '222',
      service: 'Mobile Apps',
      requirement: 'Req 2',
      source: 'LinkedIn',
      status: 'Qualified',
      budget: '₹1,00,000 – ₹5,00,000',
      priority: 'High',
      assignedTo: 'u1',
      createdAt: '2026-03-02T10:00:00Z',
      updatedAt: '2026-03-02T10:00:00Z',
    },
    {
      id: 'l3',
      name: 'Lead 3',
      company: 'C3',
      email: 'l3@c3.com',
      phone: '333',
      service: 'SaaS',
      requirement: 'Req 3',
      source: 'Google',
      status: 'Won',
      budget: '₹5,00,000 – ₹15,00,000',
      priority: 'Urgent',
      assignedTo: 'u1',
      createdAt: '2026-03-03T10:00:00Z',
      updatedAt: '2026-03-03T10:00:00Z',
    },
  ];

  const mockUsers: User[] = [
    {
      id: 'u1',
      name: 'Sales Rep 1',
      email: 'rep1@brainlink.in',
      role: 'sales',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockFollowUps: FollowUp[] = [];

  test('calculates accurate aggregate KPIs from real leads', () => {
    const metrics = analyticsService.calculateMetrics(mockLeads, mockFollowUps, mockUsers);

    expect(metrics.totalLeads).toBe(3);
    expect(metrics.newLeads).toBe(1);
    expect(metrics.qualifiedLeads).toBe(1);
    expect(metrics.convertedLeads).toBe(1);
    expect(metrics.lostLeads).toBe(0);
    // 1 won out of 3 total = 33%
    expect(metrics.conversionRate).toBe(33);
  });

  test('breaks down sources and percentages properly', () => {
    const metrics = analyticsService.calculateMetrics(mockLeads, mockFollowUps, mockUsers);

    const google = metrics.leadsBySource.find((s) => s.source === 'Google');
    expect(google).toBeDefined();
    expect(google?.count).toBe(2);
    expect(google?.percentage).toBe(67); // 2/3 = 67%
  });
});
