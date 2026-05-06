import { Stack } from 'expo-router'

const ChatLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chats" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  )
}

export default ChatLayout
