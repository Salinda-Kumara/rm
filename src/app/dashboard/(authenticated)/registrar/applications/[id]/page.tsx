import { requireRole } from '@/lib/session'
import { getApplicationById } from '@/app/actions/applications'
import { ReviewActions } from '@/components/ReviewActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function RegistrarApplicationReview(props: { params: Promise<{ id: string }> }) {
  const session = await requireRole(['REGISTRAR'])
  const { id } = await props.params
  const application = await getApplicationById(id)
  if (!application) notFound()

  const statusBadge: Record<string, string> = {
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
          <h1 className={styles.pageTitle}>Application Review</h1>
          <p className={styles.pageSubtitle}>
            {application.user.fullName} — {application.user.sabRegistrationNo}{' '}
            <span className={`${styles.badge} ${statusBadge[application.status]}`}>{application.status.replace('_', ' ')}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href={`/dashboard/print-application/${application.id}`} target="_blank" className={styles.btnSecondary}>
            🖨️ Print Preview
          </Link>
          <Link href="/dashboard/registrar/applications" className={styles.btnSecondary}>← Back</Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>👤 Student Info</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Name</span><span className={styles.detailValue}>{application.user.fullName}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Initials</span><span className={styles.detailValue}>{application.user.nameWithInitials}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Email</span><span className={styles.detailValue}>{application.user.email}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>NIC</span><span className={styles.detailValue}>{application.user.nicPassportNo}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>SAB Reg.</span><span className={styles.detailValue}>{application.user.sabRegistrationNo}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Intake</span><span className={styles.detailValue}>{application.user.intake}</span></div>
        </div>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>💳 Payment & Review</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Fee</span><span className={styles.detailValue}>LKR {application.totalFee?.toString() || '—'}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Payment Ref.</span><span className={styles.detailValue}>{application.paymentReference || '—'}</span></div>
          {application.paymentSlipPath && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment Slip</span>
              <span className={styles.detailValue}>
                <a href={`/uploads/${application.paymentSlipPath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-400)', textDecoration: 'underline' }}>
                  📄 View Payment Slip
                </a>
              </span>
            </div>
          )}
          {application.medicalCertPath && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Medical Certificate</span>
              <span className={styles.detailValue}>
                <a href={`/uploads/${application.medicalCertPath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-400)', textDecoration: 'underline' }}>
                  🏥 View Medical Certificate
                </a>
              </span>
            </div>
          )}
          {application.reviewedBy && <div className={styles.detailRow}><span className={styles.detailLabel}>Reviewed By</span><span className={styles.detailValue}>{application.reviewedBy.fullName}</span></div>}
          {application.reviewNotes && <div className={styles.detailRow}><span className={styles.detailLabel}>Review Notes</span><span className={styles.detailValue}>{application.reviewNotes}</span></div>}
          {application.financeReviewedBy && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Finance Checked</span>
              <span className={styles.detailValue} style={{ fontWeight: 600 }}>
                {application.financeReviewedBy.fullName} ({application.status === 'FINANCE_APPROVED' ? 'Approved' : 'Rejected'})
              </span>
            </div>
          )}
          {application.financeNotes && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Finance Notes</span>
              <span className={styles.detailValue} style={{ fontStyle: 'italic' }}>{application.financeNotes}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}><h2 className={styles.tableTitle}>📚 Subjects</h2></div>
        <table className={styles.table}>
          <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>CA Marks</th></tr></thead>
          <tbody>
            {application.subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.course.courseCode}</td><td>{s.course.courseTitle}</td>
                <td><span className={`${styles.badge} ${s.category === 'MEDICAL' ? styles.badgeUnderReview : styles.badgeSubmitted}`}>{s.category}</span></td>
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
