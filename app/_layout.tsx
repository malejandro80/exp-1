import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { IdentityProvider } from '@/contexts/IdentityContext'
import { styles } from './_layout.styles'
import { LocationProvider } from '@/contexts/LocationContext'
import { RoomProvider } from '@/contexts/RoomContext'

const RootScreens = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)" />
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
    <IdentityProvider>
      <LocationProvider>
        <RoomProvider>
          <RootScreens />
          <StatusBar style="auto" />
        </RoomProvider>
      </LocationProvider>
    </IdentityProvider>
  )
}

export default RootLayout