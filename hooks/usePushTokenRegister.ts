import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services'

export const usePushTokenRegister = () => {
  const { user } = useAuth()
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    const register = async () => {
      if (!Device.isDevice) return
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== 'granted') return
      const tokenData = await Notifications.getExpoPushTokenAsync()
      await api.pushTokens.upsert(userId, tokenData.data)
    }
    register()
  }, [userId])
}
