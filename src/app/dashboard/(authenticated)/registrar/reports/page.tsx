import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function RegistrarReportsPage() {
  await requireRole(['REGISTRAR'])

  const [totalApps, byStatus, byCourse] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.applicationSubject.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
  ])

  const statusCounts = byStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.id
    return acc
  }, {})

  const categoryCounts = byCourse.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = item._count.id
    return acc
  }, {})

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Reports & Analytics</h1>
        <p className={styles.pageSubtitle}>Overview of examination applications</p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>📊 Applications by Status</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Total Applications</span>
            <span className={styles.detailValue}><strong>{totalApps}</strong></span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><span className={`${styles.badge} ${styles.badgeSubmitted}`}>Submitted</span></span>
            <span className={styles.detailValue}>{statusCounts['SUBMITTED'] || 0}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><span className={`${styles.badge} ${styles.badgeUnderReview}`}>Under Review</span></span>
            <span className={styles.detailValue}>{statusCounts['UNDER_REVIEW'] || 0}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><span className={`${styles.badge} ${styles.badgeApproved}`}>Approved</span></span>
            <span className={styles.detailValue}>{statusCounts['APPROVED'] || 0}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><span className={`${styles.badge} ${styles.badgeRejected}`}>Rejected</span></span>
            <span className={styles.detailValue}>{statusCounts['REJECTED'] || 0}</span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>📚 Applications by Category</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Medical</span>
            <span className={styles.detailValue}>{categoryCounts['MEDICAL'] || 0} subject(s)</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Repeat</span>
            <span className={styles.detailValue}>{categoryCounts['REPEAT'] || 0} subject(s)</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>1st Attempt</span>
            <span className={styles.detailValue}>{categoryCounts['FIRST_ATTEMPT'] || 0} subject(s)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
