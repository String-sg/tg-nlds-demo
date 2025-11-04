'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { findOrCreateConversation } from '@/lib/conversation-helpers'
import { useUser } from '@/contexts/user-context'

interface MessageParentParams {
  studentId: string
  classId: string
  guardianName: string
}

interface UseMessageParentReturn {
  messageParent: (params: MessageParentParams) => Promise<void>
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook for messaging a student&apos;s parent
 *
 * Handles finding or creating a conversation with the parent and navigating to the inbox.
 * Provides loading states and error handling with user-friendly toast notifications.
 *
 * @returns Object containing messageParent function, loading state, and error state
 *
 * @example
 * ```tsx
 * const { messageParent, isLoading, error } = useMessageParent()
 *
 * const handleClick = () => {
 *   messageParent({
 *     studentId: student.id,
 *     classId: student.class_id,
 *     guardianName: student.guardian.name
 *   })
 * }
 * ```
 */
export function useMessageParent(): UseMessageParentReturn {
  const router = useRouter()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async ({
      studentId,
      classId,
      guardianName,
    }: MessageParentParams) => {
      // Validate user is authenticated
      if (!user?.user_id) {
        throw new Error('You must be logged in to message parents')
      }

      // Validate required parameters
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      if (!classId) {
        throw new Error('Class ID is required')
      }

      if (!guardianName) {
        throw new Error('Guardian name is required')
      }

      // Find or create conversation
      const result = await findOrCreateConversation(
        studentId,
        classId,
        user.user_id,
        guardianName
      )

      // Handle errors from findOrCreateConversation
      if (result.error || !result.conversationId) {
        throw new Error(result.error || 'Failed to create conversation')
      }

      return {
        conversationId: result.conversationId,
        isNewConversation: result.isNewConversation,
        guardianName,
      }
    },

    onSuccess: async (data) => {
      // Clear any previous errors
      setError(null)

      // Show loading toast while waiting for data
      const loadingToast = toast.loading('Loading conversation...')

      try {
        // Invalidate and WAIT for conversations to refetch
        await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        await queryClient.refetchQueries({
          queryKey: ['conversations', user?.user_id],
          type: 'active',
        })

        // Dismiss loading toast
        toast.dismiss(loadingToast)

        // Show success toast
        if (data.isNewConversation) {
          toast.success(`New conversation started with ${data.guardianName}`)
        } else {
          toast.success(`Conversation with ${data.guardianName} opened`)
        }

        // Navigate to inbox with the conversation (data is now ready)
        router.push(`/inbox/${data.conversationId}`)
      } catch (error) {
        toast.dismiss(loadingToast)
        toast.error('Failed to load conversation')
        console.error('Error refetching conversations:', error)
      }
    },

    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to open conversation'

      setError(errorMessage)
      toast.error(errorMessage)
    },
  })

  const messageParent = async (params: MessageParentParams) => {
    await mutation.mutateAsync(params)
  }

  return {
    messageParent,
    isLoading: mutation.isPending,
    error,
  }
}
