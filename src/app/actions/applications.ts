'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { CreateApplicationSchema, ReviewApplicationSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'
import { hasPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { saveUploadedFile } from '@/lib/upload'

export type ApplicationState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
} | undefined

const MEDICAL_FEE = 5200
const REPEAT_FEE = 2600

export async function createApplication(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const session = await getSession()
  if (!session || !hasPermission(session.role, 'application:create')) {
    return { message: 'Unauthorized' }
  }

  try {
    // Parse JSON body from formData
    const rawData = formData.get('applicationData')
    if (!rawData) return { message: 'No application data provided' }

    const parsedData = JSON.parse(rawData as string)
    const validated = CreateApplicationSchema.safeParse(parsedData)

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors }
    }

    const data = validated.data

    // Extract files
    const paymentSlipFile = formData.get('paymentSlip') as File | null
    const medicalCertFile = formData.get('medicalCert') as File | null

    let paymentSlipPath: string | null = null
    if (paymentSlipFile && paymentSlipFile.size > 0) {
      paymentSlipPath = await saveUploadedFile(paymentSlipFile, 'payment_slips')
    }

    let medicalCertPath: string | null = null
    if (medicalCertFile && medicalCertFile.size > 0) {
      medicalCertPath = await saveUploadedFile(medicalCertFile, 'medical_certs')
    }

    // Calculate total fee
    let totalFee = 0
    for (const subject of data.subjects) {
      if (subject.category === 'MEDICAL') totalFee += MEDICAL_FEE
      else if (subject.category === 'REPEAT') totalFee += REPEAT_FEE
    }

    // Create application with related data
    const application = await prisma.application.create({
      data: {
        userId: session.userId,
        examPeriodId: data.examPeriodId || null,
        status: 'SUBMITTED',
        paymentReference: data.paymentReference || null,
        paymentSlipPath,
        medicalCertPath,
        totalFee,
        declarationText: 'I certify that the particulars disclosed above are true and accurate.',
        declaredAt: new Date(),
        subjects: {
          create: data.subjects.map((s) => ({
            courseId: s.courseId,
            category: s.category,
            caMarks: s.caMarks ?? null,
            upcomingExamDate: s.upcomingExamDate ? new Date(s.upcomingExamDate) : null,
            upcomingExamIntake: s.upcomingExamIntake || null,
          })),
        },
        medicalDetails: {
          create: (data.medicalDetails || []).map((m) => ({
            courseCode: m.courseCode,
            courseTitle: m.courseTitle,
            examDate: m.examDate ? new Date(m.examDate) : null,
            intakeDetails: m.intakeDetails || null,
          })),
        },
        repeatDetails: {
          create: (data.repeatDetails || []).map((r) => ({
            courseCode: r.courseCode,
            courseTitle: r.courseTitle,
            examDate: r.examDate ? new Date(r.examDate) : null,
            intakeDetails: r.intakeDetails || null,
            gradeEarned: r.gradeEarned || null,
            examDivConfirmation: r.examDivConfirmation || false,
          })),
        },
      },
    })

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    await createAuditLog({
      userId: session.userId,
      action: 'APPLICATION_CREATED',
      entityType: 'application',
      entityId: application.id,
      ipAddress: ip,
    })

    revalidatePath('/dashboard/student')
  } catch (error) {
    console.error('Create application error:', error)
    return { message: 'Failed to create application. Please try again.' }
  }

  redirect('/dashboard/student/applications')
}

export async function updateApplicationStatus(
  applicationId: string,
  statusData: { status: string; notes?: string }
): Promise<ApplicationState> {
  const session = await getSession()
  if (!session) return { message: 'Unauthorized' }

  const validated = ReviewApplicationSchema.safeParse(statusData)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { status, notes } = validated.data

  // Permission check
  if (status === 'UNDER_REVIEW' && !hasPermission(session.role, 'application:review')) {
    return { message: 'You do not have permission to review applications' }
  }
  if (status === 'FINANCE_REVIEW' && !hasPermission(session.role, 'application:review') && !hasPermission(session.role, 'application:approve')) {
    return { message: 'You do not have permission to send applications to Finance Review' }
  }
  if ((status === 'FINANCE_APPROVED' || status === 'FINANCE_REJECTED') && session.role !== 'FINANCE' && session.role !== 'SUPER_ADMIN') {
    return { message: 'Only a Finance Officer can approve or reject finance statuses' }
  }
  if (status === 'APPROVED' && !hasPermission(session.role, 'application:approve')) {
    return { message: 'You do not have permission to approve applications' }
  }
  if (status === 'REJECTED') {
    if (session.role === 'STAFF') {
      // Staff is explicitly allowed to reject
    } else if (!hasPermission(session.role, 'application:approve')) {
      return { message: 'You do not have permission to reject applications' }
    }

    if (!notes || !notes.trim()) {
      return { message: 'Notes are required when rejecting an application.' }
    }
  }

  try {
    const updateData: Record<string, unknown> = { status }

    if (status === 'UNDER_REVIEW') {
      updateData.reviewedById = session.userId
      updateData.reviewedAt = new Date()
      updateData.reviewNotes = notes || null
    } else if (status === 'FINANCE_APPROVED' || status === 'FINANCE_REJECTED') {
      updateData.financeReviewedById = session.userId
      updateData.financeReviewedAt = new Date()
      updateData.financeNotes = notes || null
    } else if (status === 'APPROVED' || status === 'REJECTED') {
      updateData.approvedById = session.userId
      updateData.approvedAt = new Date()
      updateData.approvalNotes = notes || null
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    })

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    await createAuditLog({
      userId: session.userId,
      action: `APPLICATION_${status}`,
      entityType: 'application',
      entityId: applicationId,
      details: { notes },
      ipAddress: ip,
    })

    revalidatePath('/dashboard')
    return { success: true, message: `Application ${status.toLowerCase()} successfully.` }
  } catch (error) {
    console.error('Update status error:', error)
    return { message: 'Failed to update application status.' }
  }
}

export async function getApplications() {
  const session = await getSession()
  if (!session) return []

  if (hasPermission(session.role, 'application:read:all')) {
    return prisma.application.findMany({
      include: {
        user: { select: { fullName: true, sabRegistrationNo: true, email: true } },
        subjects: { include: { course: true } },
        examPeriod: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  return prisma.application.findMany({
    where: { userId: session.userId },
    include: {
      subjects: { include: { course: true } },
      examPeriod: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getApplicationById(id: string) {
  const session = await getSession()
  if (!session) return null

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          fullName: true, nameWithInitials: true, title: true,
          email: true, permanentAddress: true, postalAddress: true,
          phoneHome: true, phoneMobile: true, nicPassportNo: true,
          sabRegistrationNo: true, intake: true,
        }
      },
      subjects: { include: { course: true } },
      medicalDetails: true,
      repeatDetails: true,
      examPeriod: true,
      reviewedBy: { select: { fullName: true } },
      approvedBy: { select: { fullName: true } },
      financeReviewedBy: { select: { fullName: true } },
    },
  })

  if (!application) return null

  // Students can only see their own applications
  if (session.role === 'STUDENT' && application.userId !== session.userId) {
    return null
  }

  return application
}
