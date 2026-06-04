import { View, ActivityIndicator } from 'react-native'
import { Colors } from '@/constants/theme'
import { useAdminRedirect } from '@/hooks/useAdminRedirect'

const AdminIndex = () => {
  useAdminRedirect()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.light.brand} />
    </View>
  )
}

export default AdminIndex
