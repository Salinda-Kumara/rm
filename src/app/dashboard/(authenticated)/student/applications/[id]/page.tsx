import { requireRole } from '@/lib/session'
import { getApplicationById } from '@/app/actions/applications'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function ApplicationDetail(props: { params: Promise<{ id: string }> }) {
  await requireRole(['STUDENT'])
  const { id } = await props.params
  const application = await getApplicationById(id)

  if (!application) notFound()

  const statusBadgeMap: Record<string, string> = {
    DRAFT: styles.badgeDraft,
    SUBMITTED: styles.badgeSubmitted,
    UNDER_REVIEW: styles.badgeUnderReview,
    APPROVED: styles.badgeApproved,
    REJECTED: styles.badgeRejected,
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Application Details</h1>
          <p className={styles.pageSubtitle}>
            Submitted on {new Date(application.createdAt).toLocaleDateString()}{' '}
            <span className={`${styles.badge} ${statusBadgeMap[application.status]}`}>
              {application.status.replace('_', ' ')}
            </span>
          </p>
        </div>
        <Link href="/dashboard/student/applications" className={styles.btnSecondary}>
          ← Back to List
        </Link>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>👤 Personal Information</h3>
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
            <span className={styles.detailLabel}>NIC/Passport</span>
            <span className={styles.detailValue}>{application.user.nicPassportNo}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>SAB Reg. No.</span>
            <span className={styles.detailValue}>{application.user.sabRegistrationNo}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Intake</span>
            <span className={styles.detailValue}>{application.user.intake}</span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>💳 Payment & Status</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Total Fee</span>
            <span className={styles.detailValue}>LKR {application.totalFee?.toString() || '—'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Payment Reference</span>
            <span className={styles.detailValue}>{application.paymentReference || '—'}</span>
          </div>
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
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>
              <span className={`${styles.badge} ${statusBadgeMap[application.status]}`}>
                {application.status.replace('_', ' ')}
              </span>
            </span>
          </div>
          {application.reviewedBy && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Reviewed By</span>
              <span className={styles.detailValue}>{application.reviewedBy.fullName}</span>
            </div>
          )}
          {application.reviewNotes && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Review Notes</span>
              <span className={styles.detailValue}>{application.reviewNotes}</span>
            </div>
          )}
          {application.approvedBy && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Approved By</span>
              <span className={styles.detailValue}>{application.approvedBy.fullName}</span>
            </div>
          )}
          {application.approvalNotes && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Approval Notes</span>
              <span className={styles.detailValue}>{application.approvalNotes}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>📚 Subjects Applied</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Category</th>
              <th>CA Marks</th>
              <th>Exam Intake</th>
            </tr>
          </thead>
          <tbody>
            {application.subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.course.courseCode}</td>
                <td>{s.course.courseTitle}</td>
                <td>
                  <span className={`${styles.badge} ${s.category === 'MEDICAL' ? styles.badgeUnderReview : s.category === 'REPEAT' ? styles.badgeSubmitted : styles.badgeDraft}`}>
                    {s.category}
                  </span>
                </td>
                <td>{s.caMarks?.toString() || '—'}</td>
                <td>{s.upcomingExamIntake || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {application.medicalDetails.length > 0 && (
        <div className={styles.tableContainer} style={{ marginTop: 'var(--space-6)' }}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>🏥 Previous Exam Details (Medical)</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Exam Date</th>
                <th>Intake Details</th>
              </tr>
            </thead>
            <tbody>
              {application.medicalDetails.map((m) => (
                <tr key={m.id}>
                  <td>{m.courseCode}</td>
                  <td>{m.courseTitle}</td>
                  <td>{m.examDate ? new Date(m.examDate).toLocaleDateString() : '—'}</td>
                  <td>{m.intakeDetails || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {application.repeatDetails.length > 0 && (
        <div className={styles.tableContainer} style={{ marginTop: 'var(--space-6)' }}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>🔄 Previous Exam Details (Repeat)</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Exam Date</th>
                <th>Intake Details</th>
                <th>Grade</th>
                <th>Exam Div. Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {application.repeatDetails.map((r) => (
                <tr key={r.id}>
                  <td>{r.courseCode}</td>
                  <td>{r.courseTitle}</td>
                  <td>{r.examDate ? new Date(r.examDate).toLocaleDateString() : '—'}</td>
                  <td>{r.intakeDetails || '—'}</td>
                  <td>{r.gradeEarned || '—'}</td>
                  <td>{r.examDivConfirmation ? '✅ Yes' : '❌ No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
