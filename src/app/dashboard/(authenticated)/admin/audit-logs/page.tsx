import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function AdminAuditLogsPage() {
  await requireRole(['SUPER_ADMIN'])

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audit Logs</h1>
        <p className={styles.pageSubtitle}>Showing last 100 entries</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>IP Address</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.user?.fullName || 'System'}</td>
                <td><span className={styles.badge}>{log.action}</span></td>
                <td>{log.entityType}{log.entityId ? ` / ${log.entityId.slice(0, 8)}...` : ''}</td>
                <td>{log.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
