import { useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/contexts/IdentityContext'

interface ConversationRow {
  id: string
  participant1_id: string
  participant2_id: string
  status: 'pending' | 'active'
  last_message_at: string
  created_at: string
}

interface ConversationWithUser extends ConversationRow {
  otherUser: { display_name: string | null; avatar_url: string | null } | null
  lastMessage: string | null
}

export function useChats() {
  const { userId } = useIdentity()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)
      const { data: convs, error: convsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .in('status', ['pending', 'active'])
        .order('last_message_at', { ascending: false })

      if (convsError) throw convsError

      const enriched = await Promise.all(
        ((convs as any[]) || []).map(async (conv: any) => {
          const otherId = conv.participant1_id === userId
            ? conv.participant2_id
            : conv.participant1_id

          const [profileResult, messageResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', otherId)
              .single(),
            supabase
              .from('messages')
              .select('content')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1),
          ])

          return {
            ...conv,
            status: conv.status as 'pending' | 'active',
            otherUser: (profileResult.data as any) || null,
            lastMessage: ((messageResult.data as any[])?.[0]?.content as string) || null,
          }
        })
      )

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

  const navigateToChat = useCallback((item: ConversationWithUser) => {
    const otherUserId = item.participant1_id === userId
      ? item.participant2_id
      : item.participant1_id
    router.push(`/chat/${item.id}?otherUserId=${otherUserId}` as any)
  }, [userId, router])

  const handleAccept = useCallback(async (conversationId: string) => {
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ status: 'active' })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Failed to accept conversation:', updateError)
      return
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, status: 'active' as const } : c
      )
    )

    const conv = conversations.find(c => c.id === conversationId)
    if (conv) {
      navigateToChat(conv)
    }
  }, [conversations, navigateToChat])

  const handleDecline = useCallback(async (conversationId: string) => {
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ status: 'declined' })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Failed to decline conversation:', updateError)
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
