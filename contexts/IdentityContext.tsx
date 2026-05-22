import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services'
import { USER_ID_KEY, DISPLAY_NAME_KEY } from '@/constants/storage'

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface IdentityState {
  userId: string | null
  displayName: string
  isOnboarded: boolean
  setDisplayName: (name: string) => Promise<void>
  resetIdentity: () => Promise<void>
}

const IdentityContext = createContext<IdentityState>({
  userId: null,
  displayName: '',
  isOnboarded: false,
  setDisplayName: async () => {},
  resetIdentity: async () => {},
})

export const IdentityProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayNameState] = useState('')
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadStoredIdentity = async () => {
    try {
      const storedId = await AsyncStorage.getItem(USER_ID_KEY)
      const storedName = await AsyncStorage.getItem(DISPLAY_NAME_KEY)

      if (storedId && storedName) {
        setUserId(storedId)
        setDisplayNameState(storedName)
        setIsOnboarded(true)
      }
    } catch {
      // Fresh start
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStoredIdentity()
  }, [])

  const setDisplayName = async (name: string) => {
    const id = generateId()
    // Create profile in Supabase BEFORE triggering LocationContext
    const ok = await api.profiles.upsert({
      id,
      display_name: name,
      last_seen: new Date().toISOString(),
    })
    if (!ok) {
      console.error('Failed to create profile')
    }
    // Then set state (react hooks fire LocationContext effect)
    setUserId(id)
    setDisplayNameState(name)
    setIsOnboarded(true)
    await AsyncStorage.setItem(USER_ID_KEY, id)
    await AsyncStorage.setItem(DISPLAY_NAME_KEY, name)
  }

  const resetIdentity = async () => {
    setUserId(null)
    setDisplayNameState('')
    setIsOnboarded(false)
    await AsyncStorage.multiRemove([USER_ID_KEY, DISPLAY_NAME_KEY])
  }

  if (loading) return null

  return (
    <IdentityContext.Provider value={{ userId, displayName, isOnboarded, setDisplayName, resetIdentity }}>
      {children}
    </IdentityContext.Provider>
  )
}

export const useIdentity = () => useContext(IdentityContext)
