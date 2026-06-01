import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'

const AdminIndex = () => {
  const { userId, role } = useIdentity()
  const router = useRouter()

  useEffect(() => {
    if (role !== 'admin' || !userId) {
      router.replace('/(tabs)/nearby')
      return
    }

    api.rooms.getByAdmin(userId).then((room) => {
      if (room) {
        router.replace('/(tabs)/admin/manage-room')
      } else {
        router.replace('/(tabs)/admin/create-room')
      }
    })
  }, [role, userId])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.light.brand} />
    </View>
  )
}

export default AdminIndex
