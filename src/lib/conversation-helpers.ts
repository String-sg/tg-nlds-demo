/**
 * Conversation Helper Functions
 *
 * Utilities for finding and creating conversations between teachers and parents.
 */

import type { EnrichedConversation } from '@/types/inbox'

export interface FindOrCreateConversationResult {
  conversationId: string | null
  isNewConversation: boolean
  error?: string
}

/**
 * Finds an existing conversation for a student or creates a new one if none exists
 *
 * @param studentId - The student's UUID
 * @param classId - The class UUID
 * @param teacherId - The teacher's UUID
 * @param guardianName - The guardian's name for the conversation subject
 * @returns Result object with conversation ID and metadata
 */
export async function findOrCreateConversation(
  studentId: string,
  classId: string,
  teacherId: string,
  guardianName: string
): Promise<FindOrCreateConversationResult> {
  try {
    console.log('[findOrCreateConversation] Starting with params:', {
      studentId,
      classId,
      teacherId,
      guardianName,
    })

    // Validate inputs
    if (!studentId || !classId || !teacherId) {
      console.error('[findOrCreateConversation] Missing required parameters')
      return {
        conversationId: null,
        isNewConversation: false,
        error: 'Missing required parameters',
      }
    }

    // First, check if a conversation already exists for this student-teacher pair
    console.log('[findOrCreateConversation] Checking for existing conversation...')
    const existingConversation = await findExistingConversation(studentId, teacherId)

    if (existingConversation) {
      console.log('[findOrCreateConversation] Found existing conversation:', existingConversation.id)
      return {
        conversationId: existingConversation.id,
        isNewConversation: false,
      }
    }

    // If no existing conversation, create a new one
    console.log('[findOrCreateConversation] No existing conversation found, creating new one...')
    const newConversation = await createNewConversation(
      studentId,
      classId,
      teacherId,
      guardianName
    )

    if (newConversation) {
      console.log('[findOrCreateConversation] Successfully created conversation:', newConversation.id)
      return {
        conversationId: newConversation.id,
        isNewConversation: true,
      }
    }

    console.error('[findOrCreateConversation] Failed to create conversation')
    return {
      conversationId: null,
      isNewConversation: false,
      error: 'Failed to create conversation',
    }
  } catch (error) {
    console.error('[findOrCreateConversation] Error:', error)
    return {
      conversationId: null,
      isNewConversation: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Finds an existing active or archived conversation for a student
 *
 * @param studentId - The student's UUID
 * @param teacherId - The teacher's UUID
 * @returns Existing conversation or null if none found
 */
async function findExistingConversation(
  studentId: string,
  teacherId: string
): Promise<EnrichedConversation | null> {
  try {
    // Query API to find conversations for this student-teacher pair
    const url = `/api/conversations?teacherId=${teacherId}&student_id=${studentId}`
    console.log('[findExistingConversation] Fetching:', url)

    const response = await fetch(url)

    console.log('[findExistingConversation] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[findExistingConversation] Failed to fetch conversations:', response.statusText, errorText)
      return null
    }

    const data = await response.json()
    console.log('[findExistingConversation] Response data:', data)

    if (!data.success || !data.conversations || data.conversations.length === 0) {
      console.log('[findExistingConversation] No conversations found')
      return null
    }

    // Find the most recent active conversation
    // Prioritize 'active' status, then 'archived', but not 'resolved'
    const activeConversations = data.conversations.filter(
      (conv: EnrichedConversation) => conv.status === 'active' || conv.status === 'archived'
    )

    console.log('[findExistingConversation] Found active conversations:', activeConversations.length)

    if (activeConversations.length === 0) {
      return null
    }

    // Return the most recent one (already sorted by last_message_at)
    return activeConversations[0]
  } catch (error) {
    console.error('[findExistingConversation] Error:', error)
    return null
  }
}

/**
 * Creates a new conversation between teacher and parent
 *
 * @param studentId - The student's UUID
 * @param classId - The class UUID
 * @param teacherId - The teacher's UUID
 * @param guardianName - The guardian's name for the conversation subject
 * @returns Newly created conversation or null if creation failed
 */
async function createNewConversation(
  studentId: string,
  classId: string,
  teacherId: string,
  guardianName: string
): Promise<EnrichedConversation | null> {
  try {
    const payload = {
      student_id: studentId,
      class_id: classId,
      teacher_id: teacherId,
      subject: `Conversation with ${guardianName}`,
      guardian_name: guardianName,
      teacher_name: 'Teacher', // TODO: Get actual teacher name from context
    }

    console.log('[createNewConversation] Creating conversation with payload:', payload)

    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('[createNewConversation] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[createNewConversation] Failed to create conversation:', response.statusText, errorText)
      return null
    }

    const data = await response.json()
    console.log('[createNewConversation] Response data:', data)

    if (!data.success || !data.conversation) {
      console.error('[createNewConversation] API returned success=false or no conversation')
      return null
    }

    console.log('[createNewConversation] Successfully created conversation:', data.conversation.id)
    return data.conversation
  } catch (error) {
    console.error('[createNewConversation] Error:', error)
    return null
  }
}
