/** @format */

import { Platform } from 'react-native'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tabBarStyle } from './_layout.styles'

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          ...tabBarStyle,
          paddingBottom: Platform.OS === 'android' ? 8 + insets.bottom : 16,
          height: Platform.OS === 'android' ? 60 + insets.bottom : 72,
        },
        tabBarIconStyle: {
          marginBottom: 2
        },
        tabBarLabelStyle: {
          marginBottom: 4
        }
      }}
    >
      <Tabs.Screen
        name='nearby'
        options={{
          title: 'Room',
          tabBarLabel: 'Room',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='people-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: 'Chats',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubbles-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person-outline' color={color} size={size} />
          )
        }}
      />
    </Tabs>
  )
}
