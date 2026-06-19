import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function RegistrarDashboard() {
  await requireRole(['REGISTRAR'])

  const [pendingApproval, totalApproved, totalRejected, totalAll] = await Promise.all([
    prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
    prisma.application.count({ where: { status: 'APPROVED' } }),
    prisma.application.count({ where: { status: 'REJECTED' } }),
    prisma.application.count(),
  ])

  const recentApps = await prisma.application.findMany({
    where: { status: { in: ['UNDER_REVIEW', 'SUBMITTED'] } },
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true } },
      subjects: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Registrar Dashboard</h1>
          <p className={styles.pageSubtitle}>Examination application management & approvals</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>⏳</div>
          <div className={styles.statValue}>{pendingApproval}</div>
          <div className={styles.statLabel}>Awaiting Approval</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>✅</div>
          <div className={styles.statValue}>{totalApproved}</div>
          <div className={styles.statLabel}>Approved</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardRed}`}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>❌</div>
          <div className={styles.statValue}>{totalRejected}</div>
          <div className={styles.statLabel}>Rejected</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📋</div>
          <div className={styles.statValue}>{totalAll}</div>
          <div className={styles.statLabel}>Total Applications</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Applications Requiring Attention</h2>
          <Link href="/dashboard/registrar/applications" className={styles.btnSecondary}>View All</Link>
        </div>
        {recentApps.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✅</div>
            <h3 className={styles.emptyTitle}>All Processed</h3>
            <p className={styles.emptyText}>No pending applications.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Student</th><th>SAB Reg.</th><th>Date</th><th>Subjects</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id}>
                  <td>{app.user.fullName}</td>
                  <td>{app.user.sabRegistrationNo}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.subjects.length}</td>
                  <td><span className={`${styles.badge} ${app.status === 'SUBMITTED' ? styles.badgeSubmitted : styles.badgeUnderReview}`}>{app.status.replace('_', ' ')}</span></td>
                  <td><Link href={`/dashboard/registrar/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
