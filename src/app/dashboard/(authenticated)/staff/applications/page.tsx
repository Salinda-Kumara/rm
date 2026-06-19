import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function StaffApplicationsList() {
  await requireRole(['STAFF'])

  const applications = await prisma.application.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
      subjects: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>New Applications</h1>
          <p className={styles.pageSubtitle}>{applications.length} new application(s) pending</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>SAB Reg.</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Subjects</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.user.fullName}</td>
                <td>{app.user.sabRegistrationNo}</td>
                <td>{app.user.email}</td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>{app.subjects.length}</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeSubmitted}`}>
                    SUBMITTED
                  </span>
                </td>
                <td>
                  <Link href={`/dashboard/staff/applications/${app.id}`} className={`${styles.btnPrimary} ${styles.btnSmall}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
