'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { CreateApplicationSchema, ReviewApplicationSchema, StudentDetailsSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { hasPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { saveUploadedFile } from '@/lib/upload'
import studentsRegistry from '@/lib/students_registry.json'

export type ApplicationState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
} | undefined

const MEDICAL_FEE = 5200
const REPEAT_FEE = 2600

export async function createApplication(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const session = await getSession()
  if (session && !hasPermission(session.role, 'application:create')) {
    return { message: 'Unauthorized' }
  }

  let application;
  let isAnonymous = !session;

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

    let userId = session?.userId;

    if (isAnonymous) {
      // Validate student details
      const studentDetails = StudentDetailsSchema.safeParse(parsedData.studentDetails)
      if (!studentDetails.success) {
        return { errors: studentDetails.error.flatten().fieldErrors }
      }
      const sd = studentDetails.data

      // Find or create student user by Reg No or Email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { sabRegistrationNo: sd.sabRegistrationNo },
            { email: sd.email }
          ]
        }
      })

      if (user) {
        // Update details with latest
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            fullName: sd.fullName,
            nameWithInitials: sd.nameWithInitials,
            title: sd.title,
            phoneMobile: sd.phoneMobile,
            permanentAddress: sd.permanentAddress,
            intake: sd.intake,
            nicPassportNo: sd.nicPassportNo,
          }
        })
      } else {
        // Create user with dummy password hash since they don't login
        const dummyPassword = Math.random().toString(36) + Math.random().toString(36)
        const passwordHash = await bcrypt.hash(dummyPassword, 10)
        user = await prisma.user.create({
          data: {
            email: sd.email,
            passwordHash,
            role: 'STUDENT',
            title: sd.title,
            fullName: sd.fullName,
            nameWithInitials: sd.nameWithInitials,
            permanentAddress: sd.permanentAddress,
            phoneMobile: sd.phoneMobile,
            nicPassportNo: sd.nicPassportNo,
            sabRegistrationNo: sd.sabRegistrationNo,
            intake: sd.intake,
          }
        })
      }
      userId = user.id
    }

    if (!userId) {
      return { message: 'User identification failed.' }
    }

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
    application = await prisma.application.create({
      data: {
        userId,
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
      userId,
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

  if (isAnonymous) {
    redirect(`/new-application/success/${application.id}`)
  } else {
    redirect('/dashboard/student/applications')
  }
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

  // If logged in as a STUDENT, ensure they can only see their own application
  if (session && session.role === 'STUDENT' && application.userId !== session.userId) {
    return null
  }

  return application
}

export async function getStudentByNicOrPassport(nicPassportNo: string) {
  if (!nicPassportNo) return null
  
  const trimmed = nicPassportNo.trim()
  if (trimmed === '') return null

  // 1. Check database first (for registered students or updated profiles)
  try {
    const student = await prisma.user.findFirst({
      where: {
        nicPassportNo: { equals: trimmed, mode: 'insensitive' },
        role: 'STUDENT',
      },
      select: {
        title: true,
        fullName: true,
        nameWithInitials: true,
        email: true,
        sabRegistrationNo: true,
        phoneMobile: true,
        phoneHome: true,
        permanentAddress: true,
        intake: true,
      },
    })
    if (student) {
      return {
        title: student.title || 'MR',
        fullName: student.fullName,
        nameWithInitials: student.nameWithInitials || '',
        email: student.email,
        sabRegistrationNo: student.sabRegistrationNo || '',
        phoneMobile: student.phoneMobile || '',
        phoneHome: student.phoneHome || '',
        permanentAddress: student.permanentAddress || '',
        intake: student.intake || '',
      }
    }
  } catch (error) {
    console.error('Error fetching student from DB:', error)
  }

  // 2. Fallback to the loaded Excel students registry JSON
  const registry = studentsRegistry as Record<string, {
    title: string
    fullName: string
    nameWithInitials: string
    email: string
    sabRegistrationNo: string
    phoneMobile: string
    phoneHome: string
    permanentAddress: string
    intake: string
  }>

  // Find match case-insensitively in JSON keys
  const targetKey = Object.keys(registry).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase()
  )
  
  if (targetKey) {
    return registry[targetKey]
  }

  return null
}

