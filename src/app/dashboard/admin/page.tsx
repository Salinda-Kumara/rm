import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function AdminDashboard() {
  await requireRole(['SUPER_ADMIN'])

  const [totalUsers, totalApps, totalCourses, totalPending] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
    prisma.course.count(),
    prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fullName: true, email: true, role: true, createdAt: true, isActive: true },
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSubtitle}>System overview and management</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>👥</div>
          <div className={styles.statValue}>{totalUsers}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>📋</div>
          <div className={styles.statValue}>{totalApps}</div>
          <div className={styles.statLabel}>Total Applications</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>⏳</div>
          <div className={styles.statValue}>{totalPending}</div>
          <div className={styles.statLabel}>Pending Applications</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardRed}`}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>📚</div>
          <div className={styles.statValue}>{totalCourses}</div>
          <div className={styles.statLabel}>Active Courses</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Users</h2>
          <Link href="/dashboard/admin/users" className={styles.btnSecondary}>Manage Users</Link>
        </div>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th></tr></thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td><span className={styles.badge}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><span className={`${styles.badge} ${u.isActive ? styles.badgeApproved : styles.badgeRejected}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
