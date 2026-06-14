import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '../../dashboard.module.css'

export default async function AdminApplicationsList() {
  await requireRole(['SUPER_ADMIN'])

  const applications = await prisma.application.findMany({
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
      subjects: { include: { course: true } },
      reviewedBy: { select: { fullName: true } },
      approvedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge: Record<string, string> = {
    DRAFT: styles.badgeDraft, SUBMITTED: styles.badgeSubmitted,
    UNDER_REVIEW: styles.badgeUnderReview, APPROVED: styles.badgeApproved, REJECTED: styles.badgeRejected,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>All Applications</h1>
        <p className={styles.pageSubtitle}>{applications.length} total</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Student</th><th>SAB Reg.</th><th>Date</th><th>Subjects</th><th>Fee</th><th>Status</th><th>Reviewer</th><th>Approver</th></tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.user.fullName}</td>
                <td>{app.user.sabRegistrationNo}</td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>{app.subjects.length}</td>
                <td>LKR {app.totalFee?.toString() || '—'}</td>
                <td><span className={`${styles.badge} ${statusBadge[app.status]}`}>{app.status.replace('_', ' ')}</span></td>
                <td>{app.reviewedBy?.fullName || '—'}</td>
                <td>{app.approvedBy?.fullName || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
