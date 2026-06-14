'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import styles from './dashboard.module.css'

interface SidebarProps {
  session: {
    userId: string
    role: string
    fullName: string
    email: string
  }
}

const menuItems: Record<string, Array<{ label: string; href: string; icon: string; section?: string }>> = {
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard/student', icon: '🏠', section: 'Main' },
    { label: 'New Application', href: '/dashboard/student/new-application', icon: '📝', section: 'Main' },
    { label: 'My Applications', href: '/dashboard/student/applications', icon: '📋', section: 'Main' },
    { label: 'Profile', href: '/dashboard/student/profile', icon: '👤', section: 'Account' },
  ],
  STAFF: [
    { label: 'Dashboard', href: '/dashboard/staff', icon: '🏠', section: 'Main' },
    { label: 'New Applications', href: '/dashboard/staff/applications', icon: '📥', section: 'Main' },
    { label: 'Under Review', href: '/dashboard/staff/under-review', icon: '📋', section: 'Main' },
  ],
  REGISTRAR: [
    { label: 'Dashboard', href: '/dashboard/registrar', icon: '🏠', section: 'Main' },
    { label: 'Applications', href: '/dashboard/registrar/applications', icon: '📋', section: 'Main' },
    { label: 'Courses', href: '/dashboard/registrar/courses', icon: '📚', section: 'Management' },
    { label: 'Exam Periods', href: '/dashboard/registrar/exam-periods', icon: '📅', section: 'Management' },
    { label: 'Reports', href: '/dashboard/registrar/reports', icon: '📊', section: 'Management' },
  ],
  FINANCE: [
    { label: 'Dashboard', href: '/dashboard/finance', icon: '🏠', section: 'Main' },
    { label: 'Finance Reviews', href: '/dashboard/finance/applications', icon: '📋', section: 'Main' },
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '🏠', section: 'Main' },
    { label: 'Applications', href: '/dashboard/admin/applications', icon: '📋', section: 'Main' },
    { label: 'Users', href: '/dashboard/admin/users', icon: '👥', section: 'Management' },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: '📚', section: 'Management' },
    { label: 'Exam Periods', href: '/dashboard/admin/exam-periods', icon: '📅', section: 'Management' },
    { label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: '🔍', section: 'System' },
  ],
}

const roleLabels: Record<string, string> = {
  STUDENT: 'Student',
  STAFF: 'Exam Division',
  REGISTRAR: 'Asst. Registrar',
  FINANCE: 'Finance Officer',
  SUPER_ADMIN: 'Administrator',
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const items = menuItems[session.role] || []
  const initials = session.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Group items by section
  const sections = items.reduce<Record<string, typeof items>>((acc, item) => {
    const section = item.section || 'Main'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarLogo}>SAB</div>
        <div className={styles.sidebarBrandText}>
          <h2>Exam Portal</h2>
          <p>Applied Accounting</p>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section} className={styles.navSection}>
            <div className={styles.navSectionLabel}>{section}</div>
            {sectionItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{session.fullName}</div>
            <div className={styles.userRole}>{roleLabels[session.role]}</div>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className={styles.logoutBtn}>
            <span className={styles.navIcon}>🚪</span>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
