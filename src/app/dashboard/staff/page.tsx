import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function StaffDashboard() {
  await requireRole(['STAFF'])

  const [totalPending, totalReviewed, totalToday] = await Promise.all([
    prisma.application.count({ where: { status: 'SUBMITTED' } }),
    prisma.application.count({ where: { status: { in: ['UNDER_REVIEW', 'FINANCE_APPROVED', 'FINANCE_REJECTED'] } } }),
    prisma.application.count({
      where: {
        status: 'SUBMITTED',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  const recentApplications = await prisma.application.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true } },
      subjects: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Exam Division Dashboard</h1>
          <p className={styles.pageSubtitle}>Review and process student applications</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>⏳</div>
          <div className={styles.statValue}>{totalPending}</div>
          <div className={styles.statLabel}>New Applications</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📋</div>
          <div className={styles.statValue}>{totalReviewed}</div>
          <div className={styles.statLabel}>Under Review</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>📥</div>
          <div className={styles.statValue}>{totalToday}</div>
          <div className={styles.statLabel}>Received Today</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>New Applications</h2>
          <Link href="/dashboard/staff/applications" className={styles.btnSecondary}>View All</Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✅</div>
            <h3 className={styles.emptyTitle}>All Caught Up</h3>
            <p className={styles.emptyText}>No new applications.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>SAB Reg. No</th>
                <th>Submitted</th>
                <th>Subjects</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.user.fullName}</td>
                  <td>{app.user.sabRegistrationNo}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.subjects.length} subject(s)</td>
                  <td>
                    <Link href={`/dashboard/staff/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
