import { requireRole } from '@/lib/session'
import { getApplicationById } from '@/app/actions/applications'
import { ReviewActions } from '@/components/ReviewActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function FinanceApplicationDetail(props: { params: Promise<{ id: string }> }) {
  const session = await requireRole(['FINANCE'])
  const { id } = await props.params
  const application = await getApplicationById(id)
  if (!application) notFound()

  const statusBadgeMap: Record<string, string> = {
    DRAFT: styles.badgeDraft,
    SUBMITTED: styles.badgeSubmitted,
    UNDER_REVIEW: styles.badgeUnderReview,
    FINANCE_REVIEW: styles.badgeUnderReview,
    FINANCE_APPROVED: styles.badgeApproved,
    FINANCE_REJECTED: styles.badgeRejected,
    APPROVED: styles.badgeApproved,
    REJECTED: styles.badgeRejected,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Verify Application Payment</h1>
          <p className={styles.pageSubtitle}>
            Submitted by {application.user.fullName} ({application.user.sabRegistrationNo}){' '}
            <span className={`${styles.badge} ${statusBadgeMap[application.status]}`}>
              {application.status.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href={`/dashboard/print-application/${application.id}`} target="_blank" className={styles.btnSecondary}>
            🖨️ Print Preview
          </Link>
          <Link href="/dashboard/finance/applications" className={styles.btnSecondary}>← Back</Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>👤 Student Information</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Full Name</span>
            <span className={styles.detailValue}>{application.user.fullName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Name with Initials</span>
            <span className={styles.detailValue}>{application.user.nameWithInitials}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{application.user.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>SAB Registration No.</span>
            <span className={styles.detailValue}>{application.user.sabRegistrationNo || '—'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Mobile</span>
            <span className={styles.detailValue}>{application.user.phoneMobile || '—'}</span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>💳 Payment Details</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Total Fee</span>
            <span className={styles.detailValue} style={{ fontWeight: 700 }}>
              LKR {application.totalFee?.toString() || '0'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Payment Reference</span>
            <span className={styles.detailValue} style={{ fontWeight: 700, color: 'var(--color-primary-500)' }}>
              {application.paymentReference || '—'}
            </span>
          </div>
          {application.paymentSlipPath && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment Slip</span>
              <span className={styles.detailValue}>
                <a
                  href={`/uploads/${application.paymentSlipPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary-400)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  📄 View Payment Slip Attachment
                </a>
              </span>
            </div>
          )}
          {application.reviewNotes && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Exam Div Notes</span>
              <span className={styles.detailValue} style={{ fontStyle: 'italic' }}>
                {application.reviewNotes}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>📚 Subjects In This Application</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Category</th>
              <th>CA Marks</th>
            </tr>
          </thead>
          <tbody>
            {application.subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.course.courseCode}</td>
                <td>{s.course.courseTitle}</td>
                <td>
                  <span className={`${styles.badge} ${s.category === 'MEDICAL' ? styles.badgeUnderReview : styles.badgeSubmitted}`}>
                    {s.category}
                  </span>
                </td>
                <td>{s.caMarks?.toString() || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <ReviewActions applicationId={application.id} currentStatus={application.status} role={session.role} />
      </div>
    </div>
  )
}
