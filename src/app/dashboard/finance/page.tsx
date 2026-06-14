import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function FinanceDashboard() {
  await requireRole(['FINANCE'])

  const [totalPending, totalApproved, totalRejected] = await Promise.all([
    prisma.application.count({ where: { status: 'FINANCE_REVIEW' } }),
    prisma.application.count({ where: { status: 'FINANCE_APPROVED' } }),
    prisma.application.count({ where: { status: 'FINANCE_REJECTED' } }),
  ])

  const recentApplications = await prisma.application.findMany({
    where: { status: 'FINANCE_REVIEW' },
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
          <h1 className={styles.pageTitle}>Finance Dashboard</h1>
          <p className={styles.pageSubtitle}>Verify and process exam application payments</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>⏳</div>
          <div className={styles.statValue}>{totalPending}</div>
          <div className={styles.statLabel}>Pending Finance Review</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>💳</div>
          <div className={styles.statValue}>{totalApproved}</div>
          <div className={styles.statLabel}>Payments Approved</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardRed}`}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>❌</div>
          <div className={styles.statValue}>{totalRejected}</div>
          <div className={styles.statLabel}>Payments Rejected</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Applications Pending Finance Verification</h2>
          <Link href="/dashboard/finance/applications" className={styles.btnSecondary}>View All</Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✅</div>
            <h3 className={styles.emptyTitle}>No Pending Reviews</h3>
            <p className={styles.emptyText}>All payments are currently verified.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>SAB Reg. No</th>
                <th>Total Fee</th>
                <th>Payment Ref</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.user.fullName}</td>
                  <td>{app.user.sabRegistrationNo}</td>
                  <td>LKR {app.totalFee?.toString() || '—'}</td>
                  <td>{app.paymentReference || '—'}</td>
                  <td>
                    <Link href={`/dashboard/finance/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>
                      Verify
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
