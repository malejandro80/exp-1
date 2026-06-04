import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'

export const useAdminRedirect = () => {
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
}
