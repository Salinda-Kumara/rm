import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ExamPeriodClient } from '../../registrar/exam-periods/ExamPeriodClient'
import styles from '../../dashboard.module.css'

export default async function AdminExamPeriodsPage() {
  await requireRole(['SUPER_ADMIN'])
  const periods = await prisma.examPeriod.findMany({ orderBy: { startDate: 'desc' } })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Exam Periods</h1>
        <p className={styles.pageSubtitle}>Manage examination periods</p>
      </div>
      <ExamPeriodClient periods={periods.map(p => ({
        id: p.id, name: p.name,
        startDate: p.startDate.toISOString().split('T')[0],
        endDate: p.endDate.toISOString().split('T')[0],
        isActive: p.isActive,
      }))} />
    </div>
  )
}
