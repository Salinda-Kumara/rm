import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function StaffUnderReviewList() {
  await requireRole(['STAFF'])

  const applications = await prisma.application.findMany({
    where: {
      status: {
        in: ['UNDER_REVIEW', 'FINANCE_APPROVED', 'FINANCE_REJECTED'],
      },
    },
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
      subjects: { include: { course: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const statusBadgeMap: Record<string, string> = {
    UNDER_REVIEW: styles.badgeUnderReview,
    FINANCE_APPROVED: styles.badgeApproved,
    FINANCE_REJECTED: styles.badgeRejected,
    FINANCE_REVIEW: styles.badgeUnderReview,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Under Review</h1>
          <p className={styles.pageSubtitle}>{applications.length} application(s) currently under review</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No Applications Under Review</h3>
            <p className={styles.emptyText}>Applications will appear here once they are opened for review.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>SAB Reg.</th>
                <th>Email</th>
                <th>Last Updated</th>
                <th>Subjects</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.user.fullName}</td>
                  <td>{app.user.sabRegistrationNo}</td>
                  <td>{app.user.email}</td>
                  <td>
                    {new Date(app.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>{app.subjects.length}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeMap[app.status] || styles.badgeUnderReview}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
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
