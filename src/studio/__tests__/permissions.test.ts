import { hasPermission, canAccessLead, canDeleteLead } from '../config/permissions';

describe('Permissions & RBAC Security Suite', () => {
  test('Admin has full system permissions', () => {
    expect(hasPermission('admin', 'leads:view_all')).toBe(true);
    expect(hasPermission('admin', 'leads:delete')).toBe(true);
    expect(hasPermission('admin', 'team:manage')).toBe(true);
    expect(hasPermission('admin', 'settings:manage')).toBe(true);
    expect(hasPermission('admin', 'leads:import')).toBe(true);
  });

  test('Manager has team lead view, assignment, and client conversion permissions, but not team/settings management', () => {
    expect(hasPermission('manager', 'leads:view_all')).toBe(true);
    expect(hasPermission('manager', 'leads:assign')).toBe(true);
    expect(hasPermission('manager', 'leads:convert_client')).toBe(true);
    expect(hasPermission('manager', 'leads:delete')).toBe(false);
    expect(hasPermission('manager', 'team:manage')).toBe(false);
    expect(hasPermission('manager', 'settings:manage')).toBe(false);
  });

  test('Sales role has assigned leads view and update permissions only', () => {
    expect(hasPermission('sales', 'leads:view_assigned')).toBe(true);
    expect(hasPermission('sales', 'leads:create')).toBe(true);
    expect(hasPermission('sales', 'leads:delete')).toBe(false);
    expect(hasPermission('sales', 'team:manage')).toBe(false);
    expect(hasPermission('sales', 'leads:assign')).toBe(false);
  });

  test('canAccessLead correctly enforces sales isolation', () => {
    const lead1 = { assignedTo: 'usr_sales_1' };
    const lead2 = { assignedTo: 'usr_sales_2' };
    const unassignedLead = { assignedTo: undefined };

    // Admin & Manager see everything
    expect(canAccessLead('admin', 'usr_admin', lead1)).toBe(true);
    expect(canAccessLead('manager', 'usr_mgr', lead1)).toBe(true);

    // Sales can only see their own assigned lead or unassigned
    expect(canAccessLead('sales', 'usr_sales_1', lead1)).toBe(true);
    expect(canAccessLead('sales', 'usr_sales_1', lead2)).toBe(false);
    expect(canAccessLead('sales', 'usr_sales_1', unassignedLead)).toBe(true);
  });

  test('canDeleteLead only allows admin', () => {
    expect(canDeleteLead('admin')).toBe(true);
    expect(canDeleteLead('manager')).toBe(false);
    expect(canDeleteLead('sales')).toBe(false);
  });
});
