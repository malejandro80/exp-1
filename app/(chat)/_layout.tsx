import { Stack } from 'expo-router'

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chats" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  )
}
