import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Font from 'expo-font'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { IdentityProvider } from '@/contexts/IdentityContext'
import { styles } from './_layout.styles'
import { LocationProvider } from '@/contexts/LocationContext'
import { RoomProvider } from '@/contexts/RoomContext'
import { api } from '@/services'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const PushTokenRegister = () => {
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

  return null
}

const NotificationResponder = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      handleNotificationData(data)
    })

    Notifications.getInitialNotificationAsync()
      .then((notification) => {
        if (notification) {
          handleNotificationData(notification.request.content.data)
        }
      })
      .catch((err) => {
        console.warn('[NotificationResponder.getInitialNotification]', err)
      })

    return () => {
      subscription.remove()
    }
  }, [])

  return null
}

export const handleNotificationData = (data: Record<string, unknown>) => {
  if (data.type === 'promotion' && typeof data.promotion_id === 'string') {
    router.push(`/promotion/${data.promotion_id}`)
  }
}

const RootScreens = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="promotion/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  )
}

const RootLayout = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        ...Ionicons.font,
      })
      setFontsLoaded(true)
    }
    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
      </View>
    )
  }

  return (
    <AuthProvider>
      <IdentityProvider>
        <LocationProvider>
          <RoomProvider>
            <NotificationResponder />
            <PushTokenRegister />
            <RootScreens />
            <StatusBar style="auto" />
          </RoomProvider>
        </LocationProvider>
      </IdentityProvider>
    </AuthProvider>
  )
}

export default RootLayout