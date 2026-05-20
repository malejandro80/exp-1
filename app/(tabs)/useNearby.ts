import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/contexts/IdentityContext'
import { useLocation } from '@/contexts/LocationContext'
import { useRoom } from '@/contexts/RoomContext'
import { haversineDistance } from '@/lib/helpers'
import type { PersonInRoom, Room } from '@/lib/types'

const STALE_MINUTES = 5

export function useNearby() {
  const { userId } = useIdentity()
  const { latitude, longitude } = useLocation()
  const { currentRoom, nearbyRooms, loading: roomLoading, isJoined, joinRoom, leaveRoom } = useRoom()
  const router = useRouter()
  const [people, setPeople] = useState<PersonInRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const fetchPeopleInRoom = useCallback(async () => {
    if (!currentRoom || !userId) return

    try {
      setError(null)
      const staleTime = new Date(Date.now() - STALE_MINUTES * 60000).toISOString()

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

  const handleTapPerson = useCallback(async (person: PersonInRoom) => {
    const me = userId!
    const them = person.id
    const user1 = me < them ? me : them
    const user2 = me < them ? them : me

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant1_id', user1)
      .eq('participant2_id', user2)
      .maybeSingle()

    let conversationId: string

    if (existing) {
      conversationId = (existing as any).id
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({ participant1_id: user1, participant2_id: user2 } as any)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to create conversation:', error)
        return
      }
      conversationId = (newConv as any).id
    }

    router.push(`/chat/${conversationId}?otherUserId=${them}` as any)
  }, [userId, router])

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
  }
}
