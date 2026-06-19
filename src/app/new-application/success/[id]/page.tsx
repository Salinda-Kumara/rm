import { getApplicationById } from '@/app/actions/applications'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicApplicationSuccessPage({ params }: PageProps) {
  const { id } = await params
  const application = await getApplicationById(id)

  if (!application) {
    notFound()
  }

  const user = application.user
  const subjects = application.subjects

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-slate-50)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className={styles.mobileHeader} style={{ display: 'flex', padding: '0 var(--space-8)', height: '70px', background: 'white', borderBottom: '1px solid var(--color-slate-200)', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={styles.mobileHeaderBrand}>
          <span className={styles.mobileHeaderLogo} style={{ padding: '6px 12px', fontSize: 'var(--font-size-base)' }}>SAB</span>
          <span className={styles.mobileHeaderTitle} style={{ fontSize: 'var(--font-size-base)', fontWeight: '800' }}>Exam Application Portal</span>
        </div>
        <Link href="/new-application" className={styles.btnSecondary} style={{ fontSize: 'var(--font-size-xs)' }}>
          📝 Apply Again
        </Link>
      </header>

      {/* Main Content Card */}
      <main style={{ maxWidth: '800px', width: '100%', margin: 'var(--space-12) auto', padding: '0 var(--space-4)', flex: 1 }}>
        <div className={styles.detailCard} style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)', borderTop: '4px solid var(--color-success)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>✅</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--color-slate-900)' }}>Application Submitted Successfully!</h2>
          <p style={{ color: 'var(--color-slate-500)', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
            Your Repeat/Medical exam application has been recorded. Write down your Application ID or print this receipt for your records.
          </p>

          <div style={{ background: 'var(--color-slate-100)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', margin: 'var(--space-6) 0', display: 'inline-block', border: '1px solid var(--color-slate-200)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-slate-500)', display: 'block', fontWeight: 700 }}>Application Token (ID)</span>
            <code style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-primary-600)' }}>{application.id}</code>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            <a href={`/dashboard/print-application/${application.id}`} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
              🖨️ Print Application / PDF Receipt
            </a>
            <Link href="/new-application" className={styles.btnSecondary}>
              New Submission
            </Link>
          </div>
        </div>

        {/* Details Summary */}
        <div className={styles.detailCard} style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)' }}>
          <h3 className={styles.detailCardTitle} style={{ fontSize: 'var(--font-size-base)' }}>👤 Applicant Summary</h3>
          <div className={styles.detailGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: 'var(--space-4)' }}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Full Name</span><span className={styles.detailValue}>{user.fullName}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Reg No.</span><span className={styles.detailValue}>{user.sabRegistrationNo}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Email</span><span className={styles.detailValue}>{user.email}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>NIC / Passport</span><span className={styles.detailValue}>{user.nicPassportNo}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Payment Ref.</span><span className={styles.detailValue}>{application.paymentReference || '—'}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Total Fee</span><span className={styles.detailValue} style={{ fontWeight: 800, color: 'var(--color-primary-700)' }}>LKR {application.totalFee?.toString() || '0'}</span></div>
          </div>

          <h3 className={styles.detailCardTitle} style={{ fontSize: 'var(--font-size-base)', marginTop: 'var(--space-8)' }}>📚 Subjects Applied</h3>
          <div className={styles.tableContainer}>
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
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.course.courseCode}</td>
                    <td>{s.course.courseTitle}</td>
                    <td><span className={`${styles.badge} ${s.category === 'MEDICAL' ? styles.badgeUnderReview : styles.badgeSubmitted}`}>{s.category}</span></td>
                    <td>{s.caMarks?.toString() || '—'}</td>
                    <td>{s.upcomingExamIntake || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-slate-400)', fontSize: 'var(--font-size-xs)' }}>
        © {new Date().getFullYear()} School of Accounting & Business. All Rights Reserved.
      </footer>
    </div>
  )
}
