import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { CourseManagementClient } from '../../admin/courses/CourseManagementClient'
import styles from '../../dashboard.module.css'

export default async function RegistrarCoursesPage() {
  await requireRole(['REGISTRAR'])
  const courses = await prisma.course.findMany({ orderBy: { courseCode: 'asc' } })

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Course Catalog</h1>
        <p className={styles.pageSubtitle}>{courses.length} course(s)</p>
      </div>
      <CourseManagementClient courses={courses.map(c => ({ id: c.id, courseCode: c.courseCode, courseTitle: c.courseTitle, isActive: c.isActive }))} />
    </div>
  )
}
