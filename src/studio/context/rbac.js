// Brainlink Studio RBAC & Permission Matrix

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  FINANCE: 'FINANCE',
  DEVELOPER: 'DEVELOPER',
  DESIGNER: 'DESIGNER',
  HR: 'HR',
  INTERN: 'INTERN',
  CLIENT: 'CLIENT',
};

export const SUPER_ADMIN_EMAILS = [
  'vishnoiaaditya29@gmail.com',
  'ceo.brainlink@gmail.com',
];

export const ALL_PERMISSIONS = [
  'crm.view',
  'crm.create',
  'crm.edit',
  'crm.delete',
  'sales.view',
  'sales.create',
  'sales.edit',
  'sales.delete',
  'projects.view',
  'projects.create',
  'projects.edit',
  'projects.delete',
  'finance.view',
  'finance.create',
  'finance.edit',
  'finance.delete',
  'invoice.create',
  'invoice.edit',
  'invoice.send',
  'invoice.cancel',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'settings.manage',
  'audit.view',
];

export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  ADMIN: [
    'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'finance.view', 'finance.create', 'finance.edit', 'finance.delete',
    'invoice.create', 'invoice.edit', 'invoice.send', 'invoice.cancel',
    'users.view', 'users.create', 'users.edit',
    'settings.manage', 'audit.view',
  ],
  SALES_MANAGER: [
    'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
    'invoice.create', 'invoice.edit', 'invoice.send',
    'projects.view',
  ],
  SALES_EXECUTIVE: [
    'crm.view', 'crm.create', 'crm.edit',
    'sales.view', 'sales.create', 'sales.edit',
    'projects.view',
  ],
  PROJECT_MANAGER: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'finance.view',
    'crm.view',
  ],
  FINANCE: [
    'finance.view', 'finance.create', 'finance.edit', 'finance.delete',
    'invoice.create', 'invoice.edit', 'invoice.send', 'invoice.cancel',
    'projects.view', 'crm.view',
  ],
  DEVELOPER: [
    'projects.view', 'projects.edit',
  ],
  DESIGNER: [
    'projects.view', 'projects.edit',
  ],
  HR: [
    'users.view', 'users.create', 'users.edit',
    'projects.view',
  ],
  INTERN: [
    'projects.view',
  ],
  CLIENT: [
    'client.portal',
  ],
};

export function isUserSuperAdmin(email) {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function hasPermission(userRole, userPermissions, requiredPermission) {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  if (Array.isArray(userPermissions) && userPermissions.includes(requiredPermission)) {
    return true;
  }
  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
  return defaultPerms.includes(requiredPermission);
}
