import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register']

// Role-based route prefixes
const roleRoutes: Record<string, string[]> = {
  '/dashboard/student': ['STUDENT'],
  '/dashboard/staff': ['STAFF'],
  '/dashboard/registrar': ['REGISTRAR'],
  '/dashboard/finance': ['FINANCE'],
  '/dashboard/admin': ['SUPER_ADMIN'],
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  const isApiRoute = path.startsWith('/api')
  const isPubliclyAccessible =
    isPublicRoute ||
    path.startsWith('/new-application') ||
    path.startsWith('/dashboard/print-application')

  // Get session from cookie
  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // If on public route and authenticated, redirect to dashboard
  if (isPublicRoute && session) {
    const dashboardPath = getDashboardPath(session.role)
    return NextResponse.redirect(new URL(dashboardPath, req.nextUrl))
  }

  // If on protected route and not authenticated
  if (!isPubliclyAccessible && !isApiRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Check role-based access for dashboard routes
  if (session && path.startsWith('/dashboard')) {
    // print-application bypasses role check (accessible to any authenticated role as well)
    if (!path.startsWith('/dashboard/print-application')) {
      const hasAccess = checkRouteAccess(path, session.role)
      if (!hasAccess) {
        const dashboardPath = getDashboardPath(session.role)
        return NextResponse.redirect(new URL(dashboardPath, req.nextUrl))
      }
    }
  }

  // API route protection
  if (isApiRoute && !path.startsWith('/api/auth') && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return response
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'STUDENT': return '/dashboard/student'
    case 'STAFF': return '/dashboard/staff'
    case 'REGISTRAR': return '/dashboard/registrar'
    case 'FINANCE': return '/dashboard/finance'
    case 'SUPER_ADMIN': return '/dashboard/admin'
    default: return '/login'
  }
}

function checkRouteAccess(path: string, role: string): boolean {
  for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (path.startsWith(routePrefix)) {
      return allowedRoles.includes(role)
    }
  }
  return true // Allow access to generic dashboard routes
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|CA\\.jpg).*)'],
}
