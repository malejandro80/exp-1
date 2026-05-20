import { useEffect, useState, useRef, useCallback } from 'react'
import { FlatList, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/contexts/IdentityContext'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface ChatMessage {
  id: number
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

interface OtherProfile {
  display_name: string | null
  avatar_url: string | null
}

export function useChat() {
  const { id: conversationId, otherUserId } = useLocalSearchParams<{
    id: string
    otherUserId: string
  }>()
  const { userId } = useIdentity()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [otherUser, setOtherUser] = useState<OtherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (!conversationId || !otherUserId) return

    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [messagesResult, profileResult] = await Promise.all([
          supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', otherUserId)
            .single(),
        ])

        if (messagesResult.error) throw messagesResult.error

        setMessages(((messagesResult.data as any[]) || []).reverse())
        setOtherUser(profileResult.data as OtherProfile | null)
      } catch (err) {
        console.error('Failed to load messages:', err)
        setError('Could not load messages.')
      } finally {
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          const newMsg = payload.new as unknown as ChatMessage
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, otherUserId])

  useEffect(() => {
    if (messages.length > 0) {
      const id = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      return () => clearTimeout(id)
    }
  }, [messages.length])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !conversationId || !userId) return

    const content = input.trim()
    setInput('')

    await Promise.all([
      supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
      } as any),
      supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() } as any)
        .eq('id', conversationId),
    ])
  }, [input, conversationId, userId])

  const handleBlock = useCallback(() => {
    if (!userId || !otherUserId) return
    Alert.alert(
      'Block User',
      `Block ${otherUser?.display_name || 'this user'}? They won't be able to see you or message you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block', style: 'destructive', onPress: async () => {
            await supabase.from('blocks').insert({
              blocker_id: userId,
              blocked_id: otherUserId,
            } as any)
            Alert.alert('Blocked', 'User has been blocked.')
            router.back()
          },
        },
      ]
    )
  }, [userId, otherUserId, otherUser])

  const handleReport = useCallback(() => {
    if (!userId || !otherUserId) return
    const submitReport = async () => {
      await supabase.from('reports').insert({
        reporter_id: userId,
        reported_id: otherUserId,
      } as any)
      Alert.alert('Reported', 'Thank you. We will review this report.')
    }
    submitReport()
  }, [userId, otherUserId])

  const handleDisappear = useCallback(() => {
    if (!userId || !otherUserId) return
    Alert.alert(
      'Remove from radar',
      `Remove ${otherUser?.display_name || 'this user'} from your radar? You will disappear from theirs too.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            await supabase.from('blocks').insert({
              blocker_id: userId,
              blocked_id: otherUserId,
            } as any)
            Alert.alert('Removed', 'User has been removed from your radar.')
            router.back()
          },
        },
      ]
    )
  }, [userId, otherUserId, otherUser])

  const showActions = useCallback(() => {
    Alert.alert(
      otherUser?.display_name || 'User',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '🚫 Block', style: 'destructive', onPress: handleBlock },
        { text: '👻 Disappear from radar', onPress: handleDisappear },
        { text: '⚠️ Report', onPress: handleReport },
      ]
    )
  }, [handleBlock, handleDisappear, handleReport, otherUser])

  return {
    conversationId,
    otherUserId,
    userId,
    messages,
    input,
    otherUser,
    loading,
    error,
    flatListRef,
    setInput,
    sendMessage,
    showActions,
  }
}
