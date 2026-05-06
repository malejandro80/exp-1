import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { api } from '@/services'
import { useIdentity } from '@/contexts/IdentityContext'
import { useLocation } from '@/contexts/LocationContext'
import { useRoom } from '@/contexts/RoomContext'
import { haversineDistance } from '@/utils/helpers'
import { STALE_PROFILE_MINUTES, MS_PER_MINUTE } from '@/constants/rules'
import type { PersonInRoom, Room } from '@/lib/types'

export const useNearby = () => {
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

      const [recentProfiles, blockedSet] = await Promise.all([
        api.profiles.getRecentProfiles(staleTime, userId),
        api.blocks.getBlockedIds(userId),
      ])

      const inRoom: PersonInRoom[] = recentProfiles
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

  const handleRoomChange = () => {
    if (currentRoom) {
      fetchPeopleInRoom()
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleRoomChange()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom, fetchPeopleInRoom])

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
      await api.profiles.upsert({
        id: me,
        display_name: displayName || 'User',
        last_seen: new Date().toISOString(),
      })

      const existingId = await api.conversations.findExisting(user1, user2)
      let conversationId: string

      if (existingId) {
        conversationId = existingId
        await api.conversations.updateStatus(conversationId, 'pending')
        await api.conversations.updateLastMessageAt(conversationId)
      } else {
        const newId = await api.conversations.create(user1, user2)
        if (!newId) {
          setSending(false)
          return
        }
        conversationId = newId
      }

      await api.messages.send(conversationId, me, requestMessage.trim())

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
