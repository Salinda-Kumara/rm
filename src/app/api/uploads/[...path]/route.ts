import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { path: pathSegments } = await props.params
  if (!pathSegments || pathSegments.length < 2) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const subfolder = pathSegments[0] // e.g., 'payment_slips' or 'medical_certs'
  const filename = pathSegments.slice(1).join('/')
  const relativePath = `${subfolder}/${filename}`

  // Security Check: Students can only view their own uploads
  if (session.role === 'STUDENT') {
    let allowed = false
    if (subfolder === 'payment_slips') {
      const app = await prisma.application.findFirst({
        where: { paymentSlipPath: relativePath, userId: session.userId },
      })
      if (app) allowed = true
    } else if (subfolder === 'medical_certs') {
      const app = await prisma.application.findFirst({
        where: { medicalCertPath: relativePath, userId: session.userId },
      })
      if (app) allowed = true
    }

    if (!allowed) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Load file from disk
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  const absolutePath = path.resolve(uploadDir, relativePath)

  try {
    const fileBuffer = await fs.readFile(absolutePath)
    console.log(`[File Server] Serving file: ${relativePath}, size on disk: ${fileBuffer.length} bytes`)
    
    // Determine content type
    let contentType = 'application/octet-stream'
    const ext = path.extname(filename).toLowerCase()
    if (ext === '.pdf') contentType = 'application/pdf'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'

    // Convert Node Buffer to standard Uint8Array to prevent Next.js serialization bugs
    const uint8Array = new Uint8Array(fileBuffer)
    
    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(uint8Array.byteLength),
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('File Not Found', { status: 404 })
  }
}
