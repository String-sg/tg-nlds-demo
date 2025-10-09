import { NextResponse } from 'next/server'

// POST /api/files/upload - Upload file
export async function POST(request: Request) {
  try {
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
    const fileData = {
      id: `file-${Date.now()}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: `/uploads/${file.name}`, // Mock URL
      thumbnailUrl: file.type.startsWith('image/') ? `/uploads/thumb-${file.name}` : undefined,
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
