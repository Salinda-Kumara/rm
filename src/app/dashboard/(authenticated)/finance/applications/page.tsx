import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function FinanceApplicationsList() {
  await requireRole(['FINANCE'])

  const applications = await prisma.application.findMany({
    where: { status: { in: ['FINANCE_REVIEW', 'FINANCE_APPROVED', 'FINANCE_REJECTED'] } },
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
      subjects: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const badgeMap: Record<string, string> = {
    FINANCE_REVIEW: styles.badgeUnderReview,
    FINANCE_APPROVED: styles.badgeApproved,
    FINANCE_REJECTED: styles.badgeRejected,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Finance Review Queue</h1>
          <p className={styles.pageSubtitle}>{applications.length} application(s) found</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>SAB Reg.</th>
              <th>Total Fee</th>
              <th>Payment Ref</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.user.fullName}</td>
                <td>{app.user.sabRegistrationNo}</td>
                <td>LKR {app.totalFee?.toString() || '—'}</td>
                <td>{app.paymentReference || '—'}</td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.badge} ${badgeMap[app.status] || styles.badgeDraft}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <Link href={`/dashboard/finance/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>
                    {app.status === 'FINANCE_REVIEW' ? 'Verify' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '24px' }}>
                  No applications found in the finance queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
