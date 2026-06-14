import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { UserManagementClient } from './UserManagementClient'
import styles from '../../dashboard.module.css'

export default async function AdminUsersPage() {
  await requireRole(['SUPER_ADMIN'])

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true, sabRegistrationNo: true },
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>{users.length} registered user(s)</p>
        </div>
      </div>
      <UserManagementClient users={users} />
    </div>
  )
}
