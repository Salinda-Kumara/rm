import * as z from 'zod'

// ============== Auth Schemas ==============

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(200, 'Full name is too long'),
  nameWithInitials: z
    .string()
    .min(2, 'Name with initials is required')
    .max(100, 'Name with initials is too long'),
  title: z.enum(['MR', 'MS'], { message: 'Please select a title' }),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  permanentAddress: z.string().min(5, 'Address is required'),
  phoneHome: z.string().optional(),
  phoneMobile: z.string().min(9, 'Mobile number is required'),
  nicPassportNo: z.string().min(5, 'NIC/Passport number is required'),
  sabRegistrationNo: z.string().min(1, 'SAB Registration number is required'),
  intake: z.string().min(1, 'Intake is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const StudentDetailsSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(200, 'Full name is too long'),
  nameWithInitials: z
    .string()
    .min(2, 'Name with initials is required')
    .max(100, 'Name with initials is too long'),
  title: z.enum(['MR', 'MS'], { message: 'Please select a title' }),
  email: z.string().email('Please enter a valid email address'),
  permanentAddress: z.string().min(5, 'Address is required'),
  phoneHome: z.string().optional().nullable(),
  phoneMobile: z.string().min(9, 'Mobile number is required'),
  nicPassportNo: z.string().min(5, 'NIC/Passport number is required'),
  sabRegistrationNo: z.string().min(1, 'SAB Registration number is required'),
  intake: z.string().min(1, 'Intake is required'),
})

// ============== Application Schemas ==============

export const ApplicationSubjectSchema = z.object({
  courseId: z.string().uuid('Please select a course'),
  category: z.enum(['MEDICAL', 'REPEAT', 'FIRST_ATTEMPT']),
  caMarks: z.number().min(0).max(100).optional().nullable(),
  upcomingExamDate: z.string().optional(),
  upcomingExamIntake: z.string().optional(),
})

export const MedicalExamDetailSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseTitle: z.string().min(1, 'Course title is required'),
  examDate: z.string().optional(),
  intakeDetails: z.string().optional(),
})

export const RepeatExamDetailSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseTitle: z.string().min(1, 'Course title is required'),
  examDate: z.string().optional(),
  intakeDetails: z.string().optional(),
  gradeEarned: z.string().optional(),
  examDivConfirmation: z.boolean().default(false),
})

export const CreateApplicationSchema = z.object({
  examPeriodId: z.string().uuid().optional().nullable(),
  subjects: z.array(ApplicationSubjectSchema).min(1, 'At least one subject is required'),
  medicalDetails: z.array(MedicalExamDetailSchema).optional(),
  repeatDetails: z.array(RepeatExamDetailSchema).optional(),
  paymentReference: z.string().optional(),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration',
  }),
})

// ============== Course Schema ==============

export const CourseSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required').max(20),
  courseTitle: z.string().min(1, 'Course title is required').max(200),
})

// ============== Exam Period Schema ==============

export const ExamPeriodSchema = z.object({
  name: z.string().min(1, 'Period name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

// ============== User Management Schema ==============

export const UpdateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  nameWithInitials: z.string().min(2).optional(),
  title: z.enum(['MR', 'MS']).optional(),
  email: z.string().email().optional(),
  role: z.enum(['STUDENT', 'STAFF', 'REGISTRAR', 'SUPER_ADMIN']).optional(),
  permanentAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneMobile: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const ReviewApplicationSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'FINANCE_REVIEW', 'FINANCE_APPROVED', 'FINANCE_REJECTED', 'APPROVED', 'REJECTED']),
  notes: z.string().optional(),
})

// ============== Type Exports ==============

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type StudentDetailsInput = z.infer<typeof StudentDetailsSchema>
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>
export type CourseInput = z.infer<typeof CourseSchema>
export type ExamPeriodInput = z.infer<typeof ExamPeriodSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type ReviewApplicationInput = z.infer<typeof ReviewApplicationSchema>
