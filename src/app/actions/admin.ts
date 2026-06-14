'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { CourseSchema, ExamPeriodSchema, UpdateUserSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'

// ============== Courses ==============

export async function createCourse(formData: FormData) {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'course:create')) {
    return { error: 'Unauthorized' }
  }

  const validated = CourseSchema.safeParse({
    courseCode: formData.get('courseCode'),
    courseTitle: formData.get('courseTitle'),
  })

  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  const existing = await prisma.course.findUnique({ where: { courseCode: validated.data.courseCode } })
  if (existing) return { error: 'Course code already exists' }

  const course = await prisma.course.create({ data: validated.data })

  const headersList = await headers()
  await createAuditLog({
    userId: session.userId, action: 'COURSE_CREATED', entityType: 'course',
    entityId: course.id, ipAddress: headersList.get('x-forwarded-for') || 'unknown',
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCourse(courseId: string) {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'course:delete')) {
    return { error: 'Unauthorized' }
  }

  await prisma.course.update({ where: { id: courseId }, data: { isActive: false } })

  const headersList = await headers()
  await createAuditLog({
    userId: session.userId, action: 'COURSE_DEACTIVATED', entityType: 'course',
    entityId: courseId, ipAddress: headersList.get('x-forwarded-for') || 'unknown',
  })

  revalidatePath('/dashboard')
  return { success: true }
}

// ============== Exam Periods ==============

export async function createExamPeriod(formData: FormData) {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'exam-period:create')) {
    return { error: 'Unauthorized' }
  }

  const validated = ExamPeriodSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  })

  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  await prisma.examPeriod.create({
    data: {
      name: validated.data.name,
      startDate: new Date(validated.data.startDate),
      endDate: new Date(validated.data.endDate),
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

// ============== Users ==============

export async function updateUserRole(userId: string, formData: FormData) {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'user:update')) {
    return { error: 'Unauthorized' }
  }

  const role = formData.get('role') as string
  const isActive = formData.get('isActive') === 'true'

  const validated = UpdateUserSchema.safeParse({ role, isActive })
  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  await prisma.user.update({
    where: { id: userId },
    data: { role: validated.data.role as 'STUDENT' | 'STAFF' | 'REGISTRAR' | 'SUPER_ADMIN', isActive: validated.data.isActive },
  })

  const headersList = await headers()
  await createAuditLog({
    userId: session.userId, action: 'USER_UPDATED', entityType: 'user',
    entityId: userId, details: { role, isActive }, ipAddress: headersList.get('x-forwarded-for') || 'unknown',
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function createStaffUser(formData: FormData) {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'user:create')) {
    return { error: 'Unauthorized' }
  }

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!email || !fullName || !role || !password) {
    return { error: 'All fields are required' }
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return { error: 'Email already exists' }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: role as 'STUDENT' | 'STAFF' | 'REGISTRAR' | 'SUPER_ADMIN',
    },
  })

  revalidatePath('/dashboard/admin/users')
  return { success: true }
}
