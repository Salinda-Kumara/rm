import { requireRole } from '@/lib/session'
import { getApplications } from '@/app/actions/applications'
import Link from 'next/link'
import styles from '../../dashboard.module.css'

export default async function StudentApplicationsList() {
  await requireRole(['STUDENT'])
  const applications = await getApplications()

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Applications</h1>
          <p className={styles.pageSubtitle}>View all your exam applications</p>
        </div>
        <Link href="/dashboard/student/new-application" className={styles.btnPrimary}>
          📝 New Application
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No Applications</h3>
            <p className={styles.emptyText}>You haven&apos;t submitted any applications yet.</p>
            <Link href="/dashboard/student/new-application" className={styles.btnPrimary}>
              Create Application
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Application #</th>
                <th>Date</th>
                <th>Subjects</th>
                <th>Categories</th>
                <th>Fee (LKR)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id}>
                  <td>APP-{String(i + 1).padStart(4, '0')}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.subjects.length}</td>
                  <td>
                    {app.subjects
                      .map((s) => s.category)
                      .filter((v, idx, a) => a.indexOf(v) === idx)
                      .join(', ')}
                  </td>
                  <td>{app.totalFee?.toString() || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/student/applications/${app.id}`}
                      className={`${styles.btnSecondary} ${styles.btnSmall}`}
                    >
                      View
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

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: styles.badgeDraft,
    SUBMITTED: styles.badgeSubmitted,
    UNDER_REVIEW: styles.badgeUnderReview,
    APPROVED: styles.badgeApproved,
    REJECTED: styles.badgeRejected,
  }
  return map[status] || styles.badgeDraft
}
