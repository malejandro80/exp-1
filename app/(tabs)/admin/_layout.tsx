import { Stack } from 'expo-router'

const AdminLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="create-room" options={{ title: 'Create your room', presentation: 'modal' }} />
      <Stack.Screen name="manage-room" options={{ title: 'Manage room' }} />
      <Stack.Screen name="promotions" options={{ title: 'Promotions' }} />
      <Stack.Screen name="create-promotion" options={{ title: 'New promotion', presentation: 'modal' }} />
    </Stack>
  )
}

export default AdminLayout
