import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ApplicationFormClient from '@/app/dashboard/(authenticated)/student/new-application/ApplicationFormClient'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function PublicNewApplicationPage() {
  const session = await getSession()

  const [courses, examPeriods] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { courseCode: 'asc' },
    }),
    prisma.examPeriod.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    }),
  ])

  // If a non-student is logged in, redirect them to their dashboard
  if (session && session.role !== 'STUDENT') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>You are logged in as {session.role}</h2>
        <p style={{ marginTop: '10px' }}>
          Please go to your <Link href="/dashboard" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Dashboard</Link> to manage applications.
        </p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-slate-50)' }}>
      {/* Premium Public Header */}
      <header className={styles.mobileHeader} style={{ display: 'flex', padding: '0 var(--space-8)', height: '70px', background: 'white', borderBottom: '1px solid var(--color-slate-200)', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={styles.mobileHeaderBrand}>
          <span className={styles.mobileHeaderLogo} style={{ padding: '6px 12px', fontSize: 'var(--font-size-base)' }}>SAB</span>
          <span className={styles.mobileHeaderTitle} style={{ fontSize: 'var(--font-size-base)', fontWeight: '800' }}>Exam Application Portal</span>
        </div>
        <div>
          {session ? (
            <Link href="/dashboard/student" className={styles.btnSecondary} style={{ fontSize: 'var(--font-size-xs)' }}>
              🎓 Student Portal
            </Link>
          ) : (
            <Link href="/login" className={styles.btnSecondary} style={{ fontSize: 'var(--font-size-xs)' }}>
              🚪 Staff Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Form Area */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <ApplicationFormClient
          courses={courses.map((c) => ({ id: c.id, courseCode: c.courseCode, courseTitle: c.courseTitle }))}
          examPeriods={examPeriods.map((ep) => ({ id: ep.id, name: ep.name }))}
          session={session}
        />
      </div>
    </div>
  )
}
