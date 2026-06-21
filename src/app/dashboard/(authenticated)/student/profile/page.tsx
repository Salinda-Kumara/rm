import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function StudentProfilePage() {
  const session = await requireRole(['STUDENT'])

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!user) return null

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Profile</h1>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>👤 Personal Information</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Title</span><span className={styles.detailValue}>{user.title === 'MR' ? 'Mr.' : user.title === 'MS' ? 'Ms.' : user.title === 'MISS' ? 'Miss' : user.title === 'MRS' ? 'Mrs.' : '—'}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Full Name</span><span className={styles.detailValue}>{user.fullName}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Name with Initials</span><span className={styles.detailValue}>{user.nameWithInitials}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Email</span><span className={styles.detailValue}>{user.email}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>NIC/Passport No.</span><span className={styles.detailValue}>{user.nicPassportNo}</span></div>
        </div>

        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>📞 Contact & Registration</h3>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Permanent Address</span><span className={styles.detailValue}>{user.permanentAddress}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Postal Address</span><span className={styles.detailValue}>{user.postalAddress || 'Same as permanent'}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Home Phone</span><span className={styles.detailValue}>{user.phoneHome || '—'}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Mobile</span><span className={styles.detailValue}>{user.phoneMobile}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>SAB Reg. No.</span><span className={styles.detailValue}>{user.sabRegistrationNo}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Intake</span><span className={styles.detailValue}>{user.intake}</span></div>
        </div>
      </div>
    </div>
  )
}
