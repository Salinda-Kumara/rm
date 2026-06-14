// Role-Based Access Control (RBAC) Configuration

export type Permission =
  | 'application:create'
  | 'application:read:own'
  | 'application:read:all'
  | 'application:update:own'
  | 'application:review'
  | 'application:approve'
  | 'application:delete'
  | 'user:read:own'
  | 'user:read:all'
  | 'user:create'
  | 'user:update'
  | 'user:deactivate'
  | 'course:read'
  | 'course:create'
  | 'course:update'
  | 'course:delete'
  | 'exam-period:read'
  | 'exam-period:create'
  | 'exam-period:update'
  | 'report:view'
  | 'audit:view'
  | 'upload:file'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  STUDENT: [
    'application:create',
    'application:read:own',
    'application:update:own',
    'user:read:own',
    'course:read',
    'exam-period:read',
    'upload:file',
  ],
  STAFF: [
    'application:read:all',
    'application:review',
    'user:read:own',
    'course:read',
    'exam-period:read',
  ],
  FINANCE: [
    'application:read:all',
    'application:review',
    'user:read:own',
    'course:read',
    'exam-period:read',
  ],
  REGISTRAR: [
    'application:read:all',
    'application:approve',
    'application:delete',
    'user:read:all',
    'course:read',
    'course:create',
    'course:update',
    'exam-period:read',
    'exam-period:create',
    'exam-period:update',
    'report:view',
  ],
  SUPER_ADMIN: [
    'application:create',
    'application:read:own',
    'application:read:all',
    'application:update:own',
    'application:review',
    'application:approve',
    'application:delete',
    'user:read:own',
    'user:read:all',
    'user:create',
    'user:update',
    'user:deactivate',
    'course:read',
    'course:create',
    'course:update',
    'course:delete',
    'exam-period:read',
    'exam-period:create',
    'exam-period:update',
    'report:view',
    'audit:view',
    'upload:file',
  ],
}

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

// Route-to-role mapping for middleware
export const ROUTE_ROLES: Record<string, string[]> = {
  '/dashboard/student': ['STUDENT'],
  '/dashboard/staff': ['STAFF'],
  '/dashboard/registrar': ['REGISTRAR'],
  '/dashboard/finance': ['FINANCE'],
  '/dashboard/admin': ['SUPER_ADMIN'],
}

export function getRoleDashboardPath(role: string): string {
  switch (role) {
    case 'STUDENT':
      return '/dashboard/student'
    case 'STAFF':
      return '/dashboard/staff'
    case 'REGISTRAR':
      return '/dashboard/registrar'
    case 'FINANCE':
      return '/dashboard/finance'
    case 'SUPER_ADMIN':
      return '/dashboard/admin'
    default:
      return '/login'
  }
}
