import { requireRole } from '@/lib/session'
import { getApplications } from '@/app/actions/applications'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function StudentDashboard() {
  const session = await requireRole(['STUDENT'])
  const applications = await getApplications()

  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome, {session.fullName} 👋</h1>
          <p className={styles.pageSubtitle}>Manage your Repeat & Medical exam applications</p>
        </div>
        <Link href="/dashboard/student/new-application" className={styles.btnPrimary}>
          📝 New Application
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📋</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Applications</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>⏳</div>
          <div className={styles.statValue}>{stats.submitted}</div>
          <div className={styles.statLabel}>Pending Review</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>✅</div>
          <div className={styles.statValue}>{stats.approved}</div>
          <div className={styles.statLabel}>Approved</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardRed}`}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>❌</div>
          <div className={styles.statValue}>{stats.rejected}</div>
          <div className={styles.statLabel}>Rejected</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Applications</h2>
          <Link href="/dashboard/student/applications" className={styles.btnSecondary}>
            View All
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3 className={styles.emptyTitle}>No Applications Yet</h3>
            <p className={styles.emptyText}>
              Submit your first Repeat or Medical exam application to get started.
            </p>
            <Link href="/dashboard/student/new-application" className={styles.btnPrimary}>
              Create Application
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subjects</th>
                <th>Type</th>
                <th>Fee (LKR)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id}>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.subjects.length} subject(s)</td>
                  <td>
                    {app.subjects.map((s) => s.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                  </td>
                  <td>{app.totalFee?.toString() || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <Link href={`/dashboard/student/applications/${app.id}`} className={`${styles.btnSecondary} ${styles.btnSmall}`}>
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
