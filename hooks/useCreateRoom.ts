import { useState } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useLocation } from '@/contexts/LocationContext'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'
import {
  ROOM_CREATED_TITLE,
  ROOM_CREATED_MESSAGE,
  ROOM_CREATE_ERROR,
} from '@/constants/labels'

export const useCreateRoom = () => {
  const { userId } = useIdentity()
  const { latitude, longitude } = useLocation()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pinLat, setPinLat] = useState(latitude || 40.4168)
  const [pinLng, setPinLng] = useState(longitude || -3.7038)
  const [radius, setRadius] = useState(100)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim() || !userId) return
    setSaving(true)
    const room = await api.rooms.create({
      name: name.trim(),
      description: description.trim(),
      latitude: pinLat,
      longitude: pinLng,
      radius_meters: radius,
      admin_id: userId,
    })
    setSaving(false)
    if (room) {
      Alert.alert(ROOM_CREATED_TITLE, ROOM_CREATED_MESSAGE(name.trim()))
      router.replace('/(tabs)/admin/manage-room')
    } else {
      Alert.alert('Error', ROOM_CREATE_ERROR)
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    pinLat,
    setPinLat,
    pinLng,
    setPinLng,
    radius,
    setRadius,
    saving,
    latitude,
    longitude,
    handleCreate,
  }
}
