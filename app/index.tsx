import { Redirect } from 'expo-router'
import { useIdentity } from '@/contexts/IdentityContext'

export default function Index() {
  const { isOnboarded } = useIdentity()

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />
  }

  return <Redirect href="/(tabs)/nearby" />
}
