import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY_PREFIX = '@app/onboarded:'

export const onboardingStorage = {
  async isComplete(userId: string): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(`${ONBOARDING_KEY_PREFIX}${userId}`)
      return val === 'true'
    } catch {
      return false
    }
  },

  async markComplete(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${ONBOARDING_KEY_PREFIX}${userId}`, 'true')
    } catch (err) {
      console.error('[onboardingStorage.markComplete]', err)
    }
  },

  async clear(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${ONBOARDING_KEY_PREFIX}${userId}`)
    } catch (err) {
      console.error('[onboardingStorage.clear]', err)
    }
  },
}
