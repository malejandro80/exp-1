import { View, ActivityIndicator, Text } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useIdentity } from '@/contexts/IdentityContext'
import { styles } from './index.styles'

const Index = () => {
  const { user, loading: authLoading } = useAuth()
  const { isOnboarded, loading: profileLoading } = useIdentity()

  if (authLoading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/login" />
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />
  }

  return <Redirect href="/(tabs)/nearby" />
}

export default Index
