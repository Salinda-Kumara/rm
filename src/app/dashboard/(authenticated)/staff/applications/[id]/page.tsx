import { requireRole } from '@/lib/session'
import { getApplicationById } from '@/app/actions/applications'
import { ReviewActions } from '@/components/ReviewActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/audit'

export default async function StaffApplicationReview(props: { params: Promise<{ id: string }> }) {
  const session = await requireRole(['STAFF'])
  const { id } = await props.params
  const application = await getApplicationById(id)
  if (!application) notFound()

  const originalStatus = application.status

  if (application.status === 'SUBMITTED' && session.role === 'STAFF') {
    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: 'UNDER_REVIEW',
        reviewedById: session.userId,
        reviewedAt: new Date(),
      },
    })

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    await createAuditLog({
      userId: session.userId,
      action: 'APPLICATION_UNDER_REVIEW',
      entityType: 'application',
      entityId: application.id,
      ipAddress: ip,
    })

    application.status = 'UNDER_REVIEW'
    revalidatePath('/dashboard/staff')
  }

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
          <h1 className={styles.pageTitle}>Review Application</h1>
          <p className={styles.pageSubtitle}>
            By {application.user.fullName} ({application.user.sabRegistrationNo}){' '}
            <span className={`${styles.badge} ${statusBadgeMap[application.status]}`}>{application.status.replace('_', ' ')}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href={`/dashboard/print-application/${application.id}`} target="_blank" className={styles.btnSecondary}>
            🖨️ Print Preview
          </Link>
          <Link href={originalStatus === 'SUBMITTED' ? '/dashboard/staff/applications' : '/dashboard/staff/under-review'} className={styles.btnSecondary}>← Back</Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>👤 Student Information</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Full Name</span><span className={styles.detailValue}>{application.user.fullName}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Name with Initials</span><span className={styles.detailValue}>{application.user.nameWithInitials}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Email</span><span className={styles.detailValue}>{application.user.email}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>NIC/Passport</span><span className={styles.detailValue}>{application.user.nicPassportNo}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>SAB Reg. No.</span><span className={styles.detailValue}>{application.user.sabRegistrationNo}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Mobile</span><span className={styles.detailValue}>{application.user.phoneMobile}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Address</span><span className={styles.detailValue}>{application.user.permanentAddress}</span></div>
        </div>

        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>💳 Payment Information</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Total Fee</span><span className={styles.detailValue}>LKR {application.totalFee?.toString() || '—'}</span></div>
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
          <div className={styles.detailRow}><span className={styles.detailLabel}>Declared At</span><span className={styles.detailValue}>{application.declaredAt ? new Date(application.declaredAt).toLocaleString() : '—'}</span></div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}><h2 className={styles.tableTitle}>📚 Subjects Applied</h2></div>
        <table className={styles.table}>
          <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>CA Marks</th><th>Exam Intake</th></tr></thead>
          <tbody>
            {application.subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.course.courseCode}</td><td>{s.course.courseTitle}</td>
                <td><span className={`${styles.badge} ${s.category === 'MEDICAL' ? styles.badgeUnderReview : styles.badgeSubmitted}`}>{s.category}</span></td>
                <td>{s.caMarks?.toString() || '—'}</td><td>{s.upcomingExamIntake || '—'}</td>
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
