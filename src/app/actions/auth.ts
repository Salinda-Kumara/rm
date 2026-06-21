'use server'

import { prisma } from '@/lib/prisma'
import { createSession, deleteSession, getSession } from '@/lib/session'
import { LoginSchema, RegisterSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { getRoleDashboardPath } from '@/lib/rbac'
import { headers } from 'next/headers'

export type AuthState = {
  errors?: Record<string, string[]>
  message?: string
} | undefined

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Validate input
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password } = validatedFields.data

  // Rate limiting
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  const rateCheck = checkRateLimit(`login:${ip}`, RATE_LIMITS.login)
  
  if (!rateCheck.allowed) {
    return { message: 'Too many login attempts. Please try again later.' }
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return { message: 'Invalid email or password.' }
  }

  if (!user.isActive) {
    return { message: 'Your account has been deactivated. Contact admin.' }
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN_FAILED',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip,
    })
    return { message: 'Invalid email or password.' }
  }

  // Create session
  await createSession(user.id, user.role, user.email, user.fullName)

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'user',
    entityId: user.id,
    ipAddress: ip,
  })

  // Redirect to role-based dashboard
  redirect(getRoleDashboardPath(user.role))
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = RegisterSchema.safeParse({
    fullName: formData.get('fullName'),
    nameWithInitials: formData.get('nameWithInitials'),
    title: formData.get('title'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    permanentAddress: formData.get('permanentAddress'),
    phoneHome: formData.get('phoneHome'),
    phoneMobile: formData.get('phoneMobile'),
    nicPassportNo: formData.get('nicPassportNo'),
    sabRegistrationNo: formData.get('sabRegistrationNo'),
    intake: formData.get('intake'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const data = validatedFields.data

  // Check if email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email.toLowerCase() },
        { nicPassportNo: data.nicPassportNo },
        { sabRegistrationNo: data.sabRegistrationNo },
      ]
    }
  })

  if (existingUser) {
    if (existingUser.email === data.email.toLowerCase()) {
      return { message: 'An account with this email already exists.' }
    }
    if (existingUser.nicPassportNo === data.nicPassportNo) {
      return { message: 'An account with this NIC/Passport number already exists.' }
    }
    if (existingUser.sabRegistrationNo === data.sabRegistrationNo) {
      return { message: 'An account with this SAB Registration number already exists.' }
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'STUDENT',
      title: data.title as 'MR' | 'MS' | 'MISS' | 'MRS',
      fullName: data.fullName,
      nameWithInitials: data.nameWithInitials,
      permanentAddress: data.permanentAddress,
      phoneHome: data.phoneHome || null,
      phoneMobile: data.phoneMobile,
      nicPassportNo: data.nicPassportNo,
      sabRegistrationNo: data.sabRegistrationNo,
      intake: data.intake,
    },
  })

  // Audit log
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  await createAuditLog({
    userId: user.id,
    action: 'USER_REGISTERED',
    entityType: 'user',
    entityId: user.id,
    ipAddress: ip,
  })

  // Create session and redirect
  await createSession(user.id, user.role, user.email, user.fullName)
  redirect('/dashboard/student')
}

export async function logout() {
  const session = await getSession()
  if (session) {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    await createAuditLog({
      userId: session.userId,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: session.userId,
      ipAddress: ip,
    })
  }
  await deleteSession()
  redirect('/login')
}
