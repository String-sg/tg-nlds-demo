import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/files/upload - Upload file
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (!mockMode || !mockTeacherId) {
      // Production: require authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size exceeds 10MB limit',
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File type not allowed',
        },
        { status: 400 }
      )
    }

    // TODO: Upload to cloud storage (S3, Azure Blob, etc.)
    // For now, return mock response

    // SECURITY: Sanitize filename to prevent path traversal and other attacks
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace unsafe chars
      .replace(/\.{2,}/g, '.')           // Prevent .. sequences
      .substring(0, 100)                  // Limit length

    // Generate unique filename with UUID to prevent overwrites
    const uniqueId = crypto.randomUUID()
    const safeFileName = `${uniqueId}-${sanitizedFileName}`

    const fileData = {
      id: `file-${Date.now()}`,
      fileName: sanitizedFileName,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: `/uploads/${safeFileName}`, // Mock URL with sanitized name
      thumbnailUrl: file.type.startsWith('image/') ? `/uploads/thumb-${safeFileName}` : undefined,
      uploadedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: fileData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}
