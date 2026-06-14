import { prisma } from '@/lib/prisma'

export interface AuditLogInput {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        details: input.details || undefined,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    })
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Audit log error:', error)
  }
}
