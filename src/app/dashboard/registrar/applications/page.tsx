import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function RegistrarApplicationsList() {
  await requireRole(['REGISTRAR'])

  const applications = await prisma.application.findMany({
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
      subjects: { include: { course: true } },
      reviewedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadgeMap: Record<string, string> = {
    DRAFT: styles.badgeDraft, SUBMITTED: styles.badgeSubmitted,
    UNDER_REVIEW: styles.badgeUnderReview, APPROVED: styles.badgeApproved, REJECTED: styles.badgeRejected,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>All Applications</h1>
          <p className={styles.pageSubtitle}>{applications.length} total application(s)</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Student</th><th>SAB Reg.</th><th>Date</th><th>Subjects</th><th>Fee</th><th>Reviewed By</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.user.fullName}</td>
                <td>{app.user.sabRegistrationNo}</td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>{app.subjects.length}</td>
                <td>LKR {app.totalFee?.toString() || '—'}</td>
                <td>{app.reviewedBy?.fullName || '—'}</td>
                <td><span className={`${styles.badge} ${statusBadgeMap[app.status]}`}>{app.status.replace('_', ' ')}</span></td>
                <td><Link href={`/dashboard/registrar/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
