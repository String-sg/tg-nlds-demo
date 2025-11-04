'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { findOrCreateConversation } from '@/lib/conversation-helpers'
import { useUser } from '@/contexts/user-context'

interface StudentToMessage {
  studentId: string
  classId: string
  guardianName: string
  studentName: string
}

interface MessageParentsParams {
  students: StudentToMessage[]
}

interface ConversationResult {
  studentId: string
  studentName: string
  conversationId: string | null
  isNewConversation: boolean
  success: boolean
  error?: string
}

interface UseMessageParentsReturn {
  messageParents: (params: MessageParentsParams) => Promise<void>
  isLoading: boolean
  error: string | null
  progress: {
    total: number
    completed: number
    current: string
  } | null
}

/**
 * Custom hook for messaging multiple students&apos; parents
 *
 * Handles finding or creating conversations with multiple parents in parallel
 * and navigating to the first successful conversation.
 * Provides loading states, progress tracking, and error handling with user-friendly toast notifications.
 *
 * @returns Object containing messageParents function, loading state, error state, and progress
 *
 * @example
 * ```tsx
 * const { messageParents, isLoading, progress } = useMessageParents()
 *
 * const handleSubmit = () => {
 *   messageParents({
 *     students: [
 *       { studentId: '1', classId: 'a', guardianName: 'John Doe', studentName: 'Jane' },
 *       { studentId: '2', classId: 'a', guardianName: 'Mary Smith', studentName: 'Bob' }
 *     ]
 *   })
 * }
 * ```
 */
export function useMessageParents(): UseMessageParentsReturn {
  const router = useRouter()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    total: number
    completed: number
    current: string
  } | null>(null)

  const mutation = useMutation({
    mutationFn: async ({ students }: MessageParentsParams) => {
      // Validate user is authenticated
      if (!user?.user_id) {
        throw new Error('You must be logged in to message parents')
      }

      // Validate we have students to message
      if (!students || students.length === 0) {
        throw new Error('No students selected')
      }

      // Initialize progress
      setProgress({
        total: students.length,
        completed: 0,
        current: students[0].studentName,
      })

      // Process all students in parallel
      const results = await Promise.allSettled(
        students.map(async (student, index) => {
          // Update progress
          setProgress({
            total: students.length,
            completed: index,
            current: student.studentName,
          })

          // Validate student data
          if (!student.studentId || !student.classId || !student.guardianName) {
            throw new Error(
              `Missing required data for student ${student.studentName}`
            )
          }

          // Find or create conversation
          const result = await findOrCreateConversation(
            student.studentId,
            student.classId,
            user.user_id,
            student.guardianName
          )

          // Check for errors
          if (result.error || !result.conversationId) {
            throw new Error(
              result.error || `Failed to create conversation for ${student.studentName}`
            )
          }

          return {
            studentId: student.studentId,
            studentName: student.studentName,
            conversationId: result.conversationId,
            isNewConversation: result.isNewConversation,
            success: true,
          } as ConversationResult
        })
      )

      // Mark progress as complete
      setProgress({
        total: students.length,
        completed: students.length,
        current: 'Done',
      })

      // Process results
      const successful: ConversationResult[] = []
      const failed: ConversationResult[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push({
            studentId: students[index].studentId,
            studentName: students[index].studentName,
            conversationId: null,
            isNewConversation: false,
            success: false,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown error',
          })
        }
      })

      return { successful, failed }
    },

    onSuccess: async (data) => {
      // Clear any previous errors
      setError(null)

      const { successful, failed } = data

      // Show loading toast while waiting for data
      const loadingToast = toast.loading('Loading conversations...')

      try {
        // Invalidate and WAIT for conversations to refetch
        await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        await queryClient.refetchQueries({
          queryKey: ['conversations', user?.user_id],
          type: 'active',
        })

        // Dismiss loading toast
        toast.dismiss(loadingToast)

        // Show success/failure summary
        if (successful.length > 0 && failed.length === 0) {
          // All succeeded
          const newCount = successful.filter((s) => s.isNewConversation).length
          const existingCount = successful.filter(
            (s) => !s.isNewConversation
          ).length

          if (newCount > 0 && existingCount > 0) {
            toast.success(
              `${newCount} new conversation${newCount > 1 ? 's' : ''} started, ${existingCount} existing conversation${existingCount > 1 ? 's' : ''} opened`
            )
          } else if (newCount > 0) {
            toast.success(
              `${newCount} conversation${newCount > 1 ? 's' : ''} started`
            )
          } else {
            toast.success(
              `${existingCount} conversation${existingCount > 1 ? 's' : ''} opened`
            )
          }

          // Navigate to the first conversation
          router.push(`/inbox/${successful[0].conversationId}`)
        } else if (successful.length > 0 && failed.length > 0) {
          // Partial success
          toast.warning(
            `${successful.length} conversation${successful.length > 1 ? 's' : ''} created, ${failed.length} failed`
          )

          // Still navigate to first successful conversation
          router.push(`/inbox/${successful[0].conversationId}`)
        } else {
          // All failed
          toast.error(
            `Failed to create conversations for ${failed.length} student${failed.length > 1 ? 's' : ''}`
          )
        }
      } catch (error) {
        toast.dismiss(loadingToast)
        toast.error('Failed to load conversations')
        console.error('Error refetching conversations:', error)
      } finally {
        // Clear progress
        setProgress(null)
      }
    },

    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create conversations'

      setError(errorMessage)
      setProgress(null)
      toast.error(errorMessage)
    },
  })

  const messageParents = async (params: MessageParentsParams) => {
    await mutation.mutateAsync(params)
  }

  return {
    messageParents,
    isLoading: mutation.isPending,
    error,
    progress,
  }
}
