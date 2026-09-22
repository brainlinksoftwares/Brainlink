import { UserRole } from '../types';

export type PermissionAction =
  | 'leads:view_all'
  | 'leads:view_assigned'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'leads:assign'
  | 'leads:import'
  | 'leads:export'
  | 'leads:convert_client'
  | 'followups:manage'
  | 'tasks:manage'
  | 'clients:view'
  | 'clients:manage'
  | 'projects:view'
  | 'projects:manage'
  | 'analytics:view_all'
  | 'analytics:view_team'
  | 'team:manage'
  | 'settings:manage'
  | 'activities:view_all';

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'leads:view_all',
    'leads:view_assigned',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:assign',
    'leads:import',
    'leads:export',
    'leads:convert_client',
    'followups:manage',
    'tasks:manage',
    'clients:view',
    'clients:manage',
    'projects:view',
    'projects:manage',
    'analytics:view_all',
    'analytics:view_team',
    'team:manage',
    'settings:manage',
    'activities:view_all',
  ],
  manager: [
    'leads:view_all', // can see team leads
    'leads:view_assigned',
    'leads:create',
    'leads:edit',
    'leads:assign',
    'leads:convert_client',
    'followups:manage',
    'tasks:manage',
    'clients:view',
    'clients:manage',
    'projects:view',
    'analytics:view_team',
    'activities:view_all',
  ],
  sales: [
    'leads:view_assigned',
    'leads:create',
    'leads:edit', // for assigned leads
    'followups:manage',
    'tasks:manage',
    'clients:view',
    'projects:view',
  ],
};

/**
 * Centrally check permissions across the application
 */
export function hasPermission(role?: UserRole | null, action?: PermissionAction): boolean {
  if (!role || !action) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(action);
}

/**
 * Check if the user has access to a specific lead
 */
export function canAccessLead(
  role: UserRole,
  userId: string,
  lead: { assignedTo?: string }
): boolean {
  if (role === 'admin' || role === 'manager') return true;
  if (role === 'sales') {
    return !lead.assignedTo || lead.assignedTo === userId;
  }
  return false;
}

/**
 * Check if the user can delete or archive a lead
 */
export function canDeleteLead(role: UserRole): boolean {
  return role === 'admin';
}
