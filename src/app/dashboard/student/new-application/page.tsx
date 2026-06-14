import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ApplicationFormClient from './ApplicationFormClient'

export default async function NewApplicationPage() {
  await requireRole(['STUDENT'])

  const [courses, examPeriods] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { courseCode: 'asc' },
    }),
    prisma.examPeriod.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    }),
  ])

  return (
    <ApplicationFormClient
      courses={courses.map((c) => ({ id: c.id, courseCode: c.courseCode, courseTitle: c.courseTitle }))}
      examPeriods={examPeriods.map((ep) => ({ id: ep.id, name: ep.name }))}
    />
  )
}
