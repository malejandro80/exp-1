/** @format */

import { Platform } from 'react-native'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tabBarStyle } from './_layout.styles'
import {
  TAB_BAR_ICON_MARGIN_BOTTOM,
  TAB_BAR_LABEL_MARGIN_BOTTOM,
  TAB_BAR_HEIGHT_IOS,
  TAB_BAR_HEIGHT_ANDROID,
  TAB_BAR_PADDING_BOTTOM_IOS,
  TAB_BAR_PADDING_BOTTOM_ANDROID,
} from '@/constants/layout'

const TabLayout = () => {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          ...tabBarStyle,
          paddingBottom: Platform.OS === 'android' ? TAB_BAR_PADDING_BOTTOM_ANDROID + insets.bottom : TAB_BAR_PADDING_BOTTOM_IOS,
          height: Platform.OS === 'android' ? TAB_BAR_HEIGHT_ANDROID + insets.bottom : TAB_BAR_HEIGHT_IOS,
        },
        tabBarIconStyle: {
          marginBottom: TAB_BAR_ICON_MARGIN_BOTTOM
        },
        tabBarLabelStyle: {
          marginBottom: TAB_BAR_LABEL_MARGIN_BOTTOM
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

export default TabLayout
