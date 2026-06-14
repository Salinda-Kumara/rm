import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sab.ac.lk' },
    update: {},
    create: {
      email: 'admin@sab.ac.lk',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      fullName: 'SYSTEM ADMINISTRATOR',
      nameWithInitials: 'Admin',
      title: 'MR',
    },
  })
  console.log('  ✅ Admin user created:', admin.email)

  // Create Staff user
  const staffPassword = await bcrypt.hash('Staff@123!', 12)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@sab.ac.lk' },
    update: {},
    create: {
      email: 'staff@sab.ac.lk',
      passwordHash: staffPassword,
      role: 'STAFF',
      fullName: 'STAFF MEMBER',
      nameWithInitials: 'S. Member',
      title: 'MR',
    },
  })
  console.log('  ✅ Staff user created:', staff.email)

  // Create Registrar user
  const registrarPassword = await bcrypt.hash('Registrar@123!', 12)
  const registrar = await prisma.user.upsert({
    where: { email: 'registrar@sab.ac.lk' },
    update: {},
    create: {
      email: 'registrar@sab.ac.lk',
      passwordHash: registrarPassword,
      role: 'REGISTRAR',
      fullName: 'ASSISTANT REGISTRAR',
      nameWithInitials: 'A. Registrar',
      title: 'MS',
    },
  })
  console.log('  ✅ Registrar user created:', registrar.email)

  // Create Finance user
  const financePassword = await bcrypt.hash('Finance@123!', 12)
  const finance = await prisma.user.upsert({
    where: { email: 'finance@sab.ac.lk' },
    update: {},
    create: {
      email: 'finance@sab.ac.lk',
      passwordHash: financePassword,
      role: 'FINANCE',
      fullName: 'FINANCE OFFICER',
      nameWithInitials: 'F. Officer',
      title: 'MR',
    },
  })
  console.log('  ✅ Finance user created:', finance.email)


  // Create sample student
  const studentPassword = await bcrypt.hash('Student@123!', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@sab.ac.lk' },
    update: {},
    create: {
      email: 'student@sab.ac.lk',
      passwordHash: studentPassword,
      role: 'STUDENT',
      fullName: 'KAMAL PERERA',
      nameWithInitials: 'K. Perera',
      title: 'MR',
      permanentAddress: 'No. 45, Galle Road, Colombo 03',
      phoneMobile: '0771234567',
      nicPassportNo: '200012345678',
      sabRegistrationNo: 'SAB/2024/001',
      intake: '2024 January',
    },
  })
  console.log('  ✅ Student user created:', student.email)

  // Create courses
  const courses = [
    { courseCode: 'ACC1013', courseTitle: 'Financial Accounting I' },
    { courseCode: 'ACC1023', courseTitle: 'Cost and Management Accounting I' },
    { courseCode: 'ACC2013', courseTitle: 'Financial Accounting II' },
    { courseCode: 'ACC2023', courseTitle: 'Auditing and Assurance' },
    { courseCode: 'ACC2033', courseTitle: 'Taxation I' },
    { courseCode: 'ACC3013', courseTitle: 'Financial Reporting' },
    { courseCode: 'ACC3023', courseTitle: 'Advanced Management Accounting' },
    { courseCode: 'ACC3033', courseTitle: 'Taxation II' },
    { courseCode: 'BUS1013', courseTitle: 'Business Law' },
    { courseCode: 'BUS1023', courseTitle: 'Economics for Accountants' },
    { courseCode: 'BUS2013', courseTitle: 'Corporate Governance' },
    { courseCode: 'BUS2023', courseTitle: 'Information Systems' },
    { courseCode: 'MGT1013', courseTitle: 'Organizational Behaviour' },
    { courseCode: 'MGT2013', courseTitle: 'Strategic Management' },
    { courseCode: 'FIN1013', courseTitle: 'Financial Management' },
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {},
      create: course,
    })
  }
  console.log(`  ✅ ${courses.length} courses created`)

  // Create exam periods
  await prisma.examPeriod.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: '2026 July End Semester Examination',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-31'),
      isActive: true,
    },
  })

  await prisma.examPeriod.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      name: '2026 December End Semester Examination',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  })
  console.log('  ✅ Exam periods created')

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Login Credentials:')
  console.log('  Admin:     admin@sab.ac.lk     / Admin@123!')
  console.log('  Staff:     staff@sab.ac.lk     / Staff@123!')
  console.log('  Registrar: registrar@sab.ac.lk / Registrar@123!')
  console.log('  Finance:   finance@sab.ac.lk   / Finance@123!')
  console.log('  Student:   student@sab.ac.lk   / Student@123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
