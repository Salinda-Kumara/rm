import { requireAuth } from '@/lib/session'
import { Sidebar } from './Sidebar'
import styles from './dashboard.module.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar session={session} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}
