import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/services'
import { haversineDistance } from '@/utils/helpers'
import { useIdentity } from './IdentityContext'
import { useLocation } from './LocationContext'
import { SEARCH_RADIUS_METERS } from '@/constants/rules'
import type { Room } from '@/lib/types'

interface RoomState {
  currentRoom: Room | null
  nearbyRooms: Room[]
  loading: boolean
  isJoined: boolean
  joinRoom: (room: Room) => void
  leaveRoom: () => void
}

const RoomContext = createContext<RoomState>({
  currentRoom: null,
  nearbyRooms: [],
  loading: true,
  isJoined: false,
  joinRoom: () => {},
  leaveRoom: () => {},
})

const SEARCH_RADIUS = SEARCH_RADIUS_METERS

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const { userId, isOnboarded } = useIdentity()
  const { latitude, longitude } = useLocation()
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [gpsRoom, setGpsRoom] = useState<Room | null>(null)
  const [joinedRoom, setJoinedRoom] = useState<Room | null>(null)
  const [nearbyRooms, setNearbyRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = async () => {
    const rooms = await api.rooms.getAll()
    setAllRooms(rooms)
    setLoading(false)
  }

  const updateNearbyRooms = () => {
    if (!latitude || !longitude || allRooms.length === 0) return

    let found: Room | null = null
    const nearby: Room[] = []

    for (const room of allRooms) {
      const dist = haversineDistance(latitude, longitude, room.latitude, room.longitude)
      if (dist <= room.radius_meters) {
        found = room
      }
      if (dist <= SEARCH_RADIUS) {
        nearby.push({ ...room })
      }
    }

    setGpsRoom(found)
    setNearbyRooms(nearby)
  }

  useEffect(() => {
    if (!isOnboarded || !userId) return
    fetchRooms()
  }, [isOnboarded, userId])

  useEffect(() => {
    updateNearbyRooms()
  }, [latitude, longitude, allRooms])

  // GPS room takes priority over joined room
  const currentRoom = gpsRoom || joinedRoom

  const joinRoom = useCallback((room: Room) => {
    setJoinedRoom(room)
  }, [])

  const leaveRoom = useCallback(() => {
    setJoinedRoom(null)
  }, [])

  return (
    <RoomContext.Provider value={{
      currentRoom,
      nearbyRooms,
      loading,
      isJoined: !!joinedRoom,
      joinRoom,
      leaveRoom,
    }}>
      {children}
    </RoomContext.Provider>
  )
}

export const useRoom = () => useContext(RoomContext)
