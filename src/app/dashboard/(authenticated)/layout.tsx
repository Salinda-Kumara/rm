import { requireAuth } from '@/lib/session'
import { DashboardShell } from '../DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <DashboardShell session={session}>
      {children}
    </DashboardShell>
  )
}
