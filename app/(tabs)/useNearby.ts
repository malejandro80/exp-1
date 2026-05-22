import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/contexts/IdentityContext'
import { useLocation } from '@/contexts/LocationContext'
import { useRoom } from '@/contexts/RoomContext'
import { haversineDistance } from '@/lib/helpers'
import { STALE_PROFILE_MINUTES, MS_PER_MINUTE } from '@/constants/rules'
import type { PersonInRoom, Room } from '@/lib/types'

export function useNearby() {
  const { userId, displayName } = useIdentity()
  const { latitude, longitude, gpsReady } = useLocation()
  const { currentRoom, nearbyRooms, loading: roomLoading, isJoined, joinRoom, leaveRoom } = useRoom()
  const router = useRouter()
  const [people, setPeople] = useState<PersonInRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [requestTarget, setRequestTarget] = useState<PersonInRoom | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [sending, setSending] = useState(false)

  const fetchPeopleInRoom = useCallback(async () => {
    if (!currentRoom || !userId) return

    try {
      setError(null)
      const staleTime = new Date(Date.now() - STALE_PROFILE_MINUTES * MS_PER_MINUTE).toISOString()

      const [profilesResult, blocksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .neq('id', userId)
          .gte('last_seen', staleTime)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null),
        supabase
          .from('blocks')
          .select('blocked_id')
          .eq('blocker_id', userId),
      ])

      if (profilesResult.error) throw profilesResult.error

      const blockedSet = new Set(
        (blocksResult.data as any[])?.map((b: any) => b.blocked_id) || []
      )

      const inRoom: PersonInRoom[] = ((profilesResult.data as any[]) || [])
        .map((p: any) => ({
          ...p,
          distance_meters: haversineDistance(
            currentRoom.latitude, currentRoom.longitude,
            p.latitude!, p.longitude!
          ),
        }))
        .filter((p: any) => p.distance_meters <= currentRoom.radius_meters && !blockedSet.has(p.id))
        .sort((a: any, b: any) => a.distance_meters - b.distance_meters)

      setPeople(inRoom)
    } catch (err) {
      console.error('Failed to fetch people in room:', err)
      setError('Could not load people in this room.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentRoom, userId])

  useEffect(() => {
    if (currentRoom) {
      fetchPeopleInRoom()
    } else {
      setLoading(false)
    }
  }, [fetchPeopleInRoom, currentRoom])

  const handleTapPerson = useCallback((person: PersonInRoom) => {
    setRequestTarget(person)
    setRequestMessage('')
  }, [])

  const handleSendRequest = useCallback(async () => {
    if (!requestTarget || !requestMessage.trim() || !userId || sending) return

    setSending(true)
    const me = userId
    const them = requestTarget.id
    const user1 = me < them ? me : them
    const user2 = me < them ? them : me

    try {
      await supabase.from('profiles').upsert({
        id: me,
        display_name: displayName || 'User',
        last_seen: new Date().toISOString(),
      } as any)

      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant1_id', user1)
        .eq('participant2_id', user2)
        .maybeSingle()

      let conversationId: string

      if (existing) {
        conversationId = (existing as any).id
        await supabase
          .from('conversations')
          .update({ status: 'pending', last_message_at: new Date().toISOString() } as any)
          .eq('id', conversationId)
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user1,
            participant2_id: user2,
            status: 'pending',
          } as any)
          .select('id')
          .single()

        if (error) {
          console.error('Failed to create conversation:', error)
          setSending(false)
          return
        }
        conversationId = (newConv as any).id
      }

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: me,
        content: requestMessage.trim(),
      } as any)

      if (msgError) {
        console.error('Failed to insert message:', msgError)
        setSending(false)
        return
      }

      setRequestTarget(null)
      setRequestMessage('')
      router.push(`/chat/${conversationId}?otherUserId=${them}` as any)
    } catch (e) {
      console.error('Failed to send request:', e)
    } finally {
      setSending(false)
    }
  }, [requestTarget, requestMessage, userId, displayName, router, sending])

  const handleCancelRequest = useCallback(() => {
    setRequestTarget(null)
    setRequestMessage('')
  }, [])

  const handleJoinRoom = useCallback(() => {
    if (selectedRoom) {
      joinRoom(selectedRoom)
      setSelectedRoom(null)
    }
  }, [selectedRoom, joinRoom])

  return {
    userId,
    latitude,
    longitude,
    gpsReady,
    currentRoom,
    nearbyRooms,
    roomLoading,
    isJoined,
    leaveRoom,
    people,
    loading,
    refreshing,
    error,
    selectedRoom,
    setSelectedRoom,
    fetchPeopleInRoom,
    setRefreshing,
    handleTapPerson,
    handleJoinRoom,
    requestTarget,
    requestMessage,
    setRequestMessage,
    sending,
    handleSendRequest,
    handleCancelRequest,
  }
}
