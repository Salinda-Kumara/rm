import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getRoleDashboardPath } from '@/lib/rbac'

export default async function Home() {
  const session = await getSession()
  
  if (session) {
    redirect(getRoleDashboardPath(session.role))
  }
  
  redirect('/new-application')
}
