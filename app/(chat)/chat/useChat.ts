import { useEffect, useState, useRef, useCallback } from 'react'
import { FlatList, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { api } from '@/services'
import { useIdentity } from '@/contexts/IdentityContext'

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

export const useChat = () => {
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
  const [conversationStatus, setConversationStatus] = useState<'pending' | 'active'>('active')
  const flatListRef = useRef<FlatList>(null)

  const loadConversationData = async () => {
    if (!conversationId || !otherUserId) return
    try {
      const [messages, otherProfile, conversationStatusResult] = await Promise.all([
        api.messages.listByConversation(conversationId),
        api.profiles.getDisplayName(otherUserId),
        api.conversations.getStatus(conversationId),
      ])

      setMessages(messages)
      setOtherUser(otherProfile)
      if (conversationStatusResult) {
        setConversationStatus(conversationStatusResult)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('Could not load messages.')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottomDelayed = () => {
    const id = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    return () => clearTimeout(id)
  }

  useEffect(() => {
    if (!conversationId || !otherUserId) return

    setLoading(true)
    setError(null)

    loadConversationData()

    const unsubscribe = api.messages.subscribeToNewMessages(conversationId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })

    return () => {
      unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, otherUserId])

  useEffect(() => {
    if (messages.length > 0) {
      return scrollToBottomDelayed()
    }
  }, [messages.length])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !conversationId || !userId) return

    const content = input.trim()
    setInput('')

    await Promise.all([
      api.messages.send(conversationId, userId, content),
      api.conversations.updateLastMessageAt(conversationId),
    ])
  }, [input, conversationId, userId])

  const isRecipient = conversationStatus === 'pending' && messages.length > 0 && messages[0].sender_id !== userId

  const handleBlock = useCallback(() => {
    if (!userId || !otherUserId) return
    Alert.alert(
      'Block User',
      `Block ${otherUser?.display_name || 'this user'}? They won't be able to see you or message you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block', style: 'destructive', onPress: async () => {
            await api.blocks.blockUser(userId, otherUserId)
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
      await api.reports.reportUser(userId, otherUserId)
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
            await api.blocks.blockUser(userId, otherUserId)
            Alert.alert('Removed', 'User has been removed from your radar.')
            router.back()
          },
        },
      ]
    )
  }, [userId, otherUserId, otherUser])

  const handleAcceptRequest = useCallback(async () => {
    if (!conversationId) return
    const ok = await api.conversations.updateStatus(conversationId, 'active')
    if (!ok) {
      console.error('Failed to accept request')
      return
    }
    setConversationStatus('active')
  }, [conversationId])

  const handleDeclineRequest = useCallback(async () => {
    if (!conversationId) return
    await api.conversations.updateStatus(conversationId, 'declined')
    router.back()
  }, [conversationId])

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
    conversationStatus,
    isRecipient,
    handleAcceptRequest,
    handleDeclineRequest,
  }
}
