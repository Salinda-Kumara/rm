import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { CourseManagementClient } from './CourseManagementClient'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function AdminCoursesPage() {
  await requireRole(['SUPER_ADMIN'])

  const courses = await prisma.course.findMany({ orderBy: { courseCode: 'asc' } })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Course Management</h1>
          <p className={styles.pageSubtitle}>{courses.length} course(s) in catalog</p>
        </div>
      </div>
      <CourseManagementClient courses={courses.map(c => ({ id: c.id, courseCode: c.courseCode, courseTitle: c.courseTitle, isActive: c.isActive }))} />
    </div>
  )
}
