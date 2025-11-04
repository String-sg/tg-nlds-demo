'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteConversationParams {
  conversationId: string
}

interface DeleteConversationResponse {
  success: boolean
  message: string
}

/**
 * Deletes a conversation from the API
 */
async function deleteConversation(params: DeleteConversationParams): Promise<DeleteConversationResponse> {
  const { conversationId } = params

  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete conversation' }))
    throw new Error(errorData.error || 'Failed to delete conversation')
  }

  return response.json()
}

/**
 * React Query mutation hook to delete conversations
 *
 * Features:
 * - Deletes conversation and all associated data
 * - Automatic cache invalidation
 * - Navigation back to inbox after deletion
 * - Toast notifications for success/error
 *
 * @param teacherId - The teacher ID for cache key
 *
 * @example
 * ```tsx
 * const deleteConversationMutation = useDeleteConversationMutation(teacherId)
 *
 * deleteConversationMutation.mutate({
 *   conversationId: 'conv-123'
 * })
 * ```
 */
export function useDeleteConversationMutation(teacherId?: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: deleteConversation,

    onSuccess: () => {
      // Invalidate conversations cache to refetch the list
      queryClient.invalidateQueries({ queryKey: ['conversations', teacherId] })

      // Show success toast
      toast.success('Conversation deleted successfully')

      // Navigate back to inbox
      router.push('/inbox')
    },

    onError: (error: Error) => {
      console.error('Failed to delete conversation:', error)
      toast.error(error.message || 'Failed to delete conversation')
    },
  })
}
