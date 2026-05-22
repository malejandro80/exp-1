import { useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { api, type ConversationWithPreview } from '@/services'
import { useIdentity } from '@/contexts/IdentityContext'

export const useChats = () => {
  const { userId } = useIdentity()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)
      const enriched = await api.conversations.listByUser(userId)
      setConversations(enriched)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      setError('Could not load conversations.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useFocusEffect(
    useCallback(() => {
      fetchConversations()
    }, [fetchConversations])
  )

  const navigateToChat = useCallback((item: ConversationWithPreview) => {
    const otherUserId = item.participant1_id === userId
      ? item.participant2_id
      : item.participant1_id
    router.push(`/chat/${item.id}?otherUserId=${otherUserId}` as any)
  }, [userId, router])

  const handleAccept = useCallback(async (conversationId: string) => {
    const ok = await api.conversations.updateStatus(conversationId, 'active')
    if (!ok) {
      console.error('Failed to accept conversation')
      return
    }

    let accepted: ConversationWithPreview | undefined
    setConversations(prev => {
      accepted = prev.find(c => c.id === conversationId)
      return prev.map(c =>
        c.id === conversationId ? { ...c, status: 'active' as const } : c
      )
    })
    if (accepted) navigateToChat(accepted)
  }, [navigateToChat])

  const handleDecline = useCallback(async (conversationId: string) => {
    const ok = await api.conversations.updateStatus(conversationId, 'declined')
    if (!ok) {
      console.error('Failed to decline conversation')
      return
    }

    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    loading,
    error,
    navigateToChat,
    userId,
    handleAccept,
    handleDecline,
  }
}
