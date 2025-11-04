'use server'

import { createClient } from '@/lib/supabase/server'
import { openai, OPENAI_CONFIG } from '@/lib/openai/client'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, recordRateLimit, trackUsage, calculateCost } from '@/lib/openai/rate-limit'

export interface GenerateStudentImageParams {
  studentId: string
  studentName: string
  gender?: 'male' | 'female' | 'other'
  ethnicity?: string
  age?: number
}

export interface GenerateStudentImageResult {
  success: boolean
  imageUrl?: string
  message?: string
  error?: string
  rateLimitExceeded?: boolean
  resetAt?: string
}

/**
 * Generate a photorealistic portrait for a student using DALL-E 3
 *
 * @param params - Student information for image generation
 * @returns Result with image URL or error
 */
export async function generateStudentImage(
  params: GenerateStudentImageParams
): Promise<GenerateStudentImageResult> {
  try {
    const { studentId, studentName, gender = 'male', ethnicity, age = 11 } = params

    // Get current user or use mock mode
    const supabase = await createClient()
    let userId: string

    // Check if in mock mode (development)
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      // Use mock teacher ID in development
      userId = mockTeacherId
    } else {
      // Production: require authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required',
        }
      }

      userId = user.id
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId, 'image')
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. You can generate ${rateCheck.remaining} more images. Try again after ${rateCheck.resetAt.toLocaleTimeString()}.`,
        rateLimitExceeded: true,
        resetAt: rateCheck.resetAt.toISOString(),
      }
    }

    // Record rate limit
    await recordRateLimit(userId, 'image', 'generateStudentImage')

    // 1. Validate student exists
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, name, student_id, gender, date_of_birth')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: 'Student not found',
      })

      return {
        success: false,
        error: 'Student not found',
      }
    }

    // 2. Generate detailed prompt for DALL-E 3
    const prompt = buildStudentPortraitPrompt({
      name: studentName,
      gender: gender || student.gender || 'male',
      ethnicity,
      age,
    })

    // 3. Call OpenAI DALL-E 3
    const startTime = Date.now()
    const response = await openai.images.generate({
      model: OPENAI_CONFIG.image.model,
      prompt,
      n: 1,
      size: OPENAI_CONFIG.image.size,
      quality: OPENAI_CONFIG.image.quality,
      style: OPENAI_CONFIG.image.style,
    })

    const generationTime = Date.now() - startTime

    // Check if response data exists
    if (!response.data || response.data.length === 0) {
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: 'No image data returned from API',
      })

      return {
        success: false,
        error: 'Failed to generate image',
      }
    }

    const imageUrl = response.data[0]?.url
    const revisedPrompt = response.data[0]?.revised_prompt

    if (!imageUrl) {
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: 'No image URL returned',
      })

      return {
        success: false,
        error: 'Failed to generate image',
      }
    }

    // 4. Download image from OpenAI (temporary URL, expires in 1 hour)
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: 'Failed to download image from OpenAI',
      })

      return {
        success: false,
        error: 'Failed to download generated image',
      }
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // 5. Upload to Supabase Storage
    const fileName = `${studentId}-${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: `Upload failed: ${uploadError.message}`,
      })

      return {
        success: false,
        error: 'Failed to upload image to storage',
      }
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName)

    // 7. Update student record
    const { error: updateError } = await supabase
      .from('students')
      .update({ profile_photo: publicUrlData.publicUrl })
      .eq('id', studentId)

    if (updateError) {
      console.error('Update error:', updateError)
      await trackUsage({
        userId: userId,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: `Database update failed: ${updateError.message}`,
      })

      return {
        success: false,
        error: 'Failed to update student record',
      }
    }

    // 8. Track usage
    const estimatedCost = calculateCost({
      model: OPENAI_CONFIG.image.model,
      imageCount: 1,
    })

    await trackUsage({
      userId: userId,
      type: 'image',
      model: OPENAI_CONFIG.image.model,
      estimatedCost,
      requestData: {
        studentId,
        studentName,
        prompt,
        generationTime,
      },
      responseData: {
        imageUrl: publicUrlData.publicUrl,
        revisedPrompt,
      },
    })

    // 9. Revalidate relevant paths
    revalidatePath('/my-classes')
    revalidatePath(`/student/${studentName}`)

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      message: `Photo generated successfully for ${studentName}`,
    }
  } catch (error) {
    console.error('Error generating student image:', error)

    // Try to get user ID for tracking
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await trackUsage({
        userId: user.id,
        type: 'image',
        model: OPENAI_CONFIG.image.model,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Generate images for multiple students in batch
 * Rate limited to prevent abuse
 *
 * @param studentIds - Array of student IDs to generate images for
 * @returns Array of results for each student
 */
export async function generateStudentImagesBatch(
  studentIds: string[]
): Promise<GenerateStudentImageResult[]> {
  const results: GenerateStudentImageResult[] = []

  // Limit batch size to prevent abuse
  const maxBatchSize = 50
  if (studentIds.length > maxBatchSize) {
    return [
      {
        success: false,
        error: `Batch size limited to ${maxBatchSize} students. Please split into smaller batches.`,
      },
    ]
  }

  const supabase = await createClient()

  for (const studentId of studentIds) {
    // Fetch student data
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, name, gender, date_of_birth')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      results.push({
        success: false,
        error: `Student ${studentId} not found`,
      })
      continue
    }

    // Calculate age
    const age = student.date_of_birth
      ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
      : 11

    // Generate image
    const result = await generateStudentImage({
      studentId: student.id,
      studentName: student.name,
      gender: (student.gender as 'male' | 'female' | undefined) || 'male',
      age,
    })

    results.push({
      ...result,
      message: `${student.name}: ${result.message || result.error}`,
    })

    // Rate limiting: Wait 2 seconds between requests to respect OpenAI's 30/min limit
    // This gives us 30 images per minute max, staying under the limit
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return results
}

/**
 * Build a detailed prompt for DALL-E 3 to generate a student portrait
 *
 * @param params - Student characteristics
 * @returns Detailed prompt string optimized for DALL-E 3
 */
function buildStudentPortraitPrompt(params: {
  name: string
  gender: string
  ethnicity?: string
  age: number
}): string {
  const { name, gender, ethnicity, age } = params

  // Determine descriptive terms
  const genderDesc = gender === 'male' ? 'boy' : gender === 'female' ? 'girl' : 'child'

  // Default to Singaporean if no ethnicity specified
  const ethnicityDesc = ethnicity ? `${ethnicity} ` : 'Singaporean '

  // Build the prompt with emphasis on photorealism and appropriateness
  return `Professional school portrait photograph of a ${ethnicityDesc}${genderDesc}, age ${age} years old,
wearing a clean white school uniform shirt with collar,
friendly and natural smile, looking directly at camera,
centered composition, head and shoulders visible,
soft diffused lighting from front, no harsh shadows,
neutral solid background (light gray or off-white),
high resolution, photorealistic style,
passport photo quality, appropriate for official school records,
natural appearance, professional photography`
}
