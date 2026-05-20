import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { tabBarStyle } from './_layout.styles'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: Colors.light.tabIconSelected,
      tabBarInactiveTintColor: Colors.light.tabIconDefault,
      tabBarStyle,
    }}>
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Room',
          tabBarLabel: 'Room',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}