import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Font from 'expo-font'
import * as Notifications from 'expo-notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { AuthProvider } from '@/contexts/AuthContext'
import { IdentityProvider } from '@/contexts/IdentityContext'
import { styles } from './_layout.styles'
import { LocationProvider } from '@/contexts/LocationContext'
import { RoomProvider } from '@/contexts/RoomContext'
import { usePushTokenRegister } from '@/hooks/usePushTokenRegister'

const queryClient = new QueryClient()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const PushTokenRegisterWrapper = () => {
  usePushTokenRegister()
  return null
}

const NotificationResponder = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      handleNotificationData(data)
    })

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          handleNotificationData(response.notification.request.content.data)
        }
      })
      .catch((err) => {
        console.warn('[NotificationResponder.getLastNotificationResponse]', err)
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IdentityProvider>
          <LocationProvider>
            <RoomProvider>
              <NotificationResponder />
              <PushTokenRegisterWrapper />
              <RootScreens />
              <StatusBar style="auto" />
            </RoomProvider>
          </LocationProvider>
        </IdentityProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default RootLayout