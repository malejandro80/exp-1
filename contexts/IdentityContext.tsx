import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/services'
import { useAuth } from './AuthContext'
import { onboardingStorage } from '@/lib/onboarding'
import type { Profile } from '@/lib/types'

interface IdentityState {
  userId: string | null
  displayName: string
  avatarUrl: string | null
<<<<<<< HEAD
=======
  role: 'user' | 'admin'
>>>>>>> d6f388f (Initial commit with all changes)
  isOnboarded: boolean
  loading: boolean
  setDisplayName: (name: string) => Promise<void>
  signOut: () => Promise<void>
}

const IdentityContext = createContext<IdentityState>({
  userId: null,
  displayName: '',
  avatarUrl: null,
<<<<<<< HEAD
=======
  role: 'user',
>>>>>>> d6f388f (Initial commit with all changes)
  isOnboarded: false,
  loading: true,
  setDisplayName: async () => {},
  signOut: async () => {},
})

export const IdentityProvider = ({ children }: { children: ReactNode }) => {
  const { user, signOut: authSignOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [onboardedLocally, setOnboardedLocally] = useState(false)
  const [loading, setLoading] = useState(true)

  const userId = user?.id ?? null

  // Check local flag for fast-path (works offline)
  useEffect(() => {
    if (!userId) {
      setOnboardedLocally(false)
      return
    }
    onboardingStorage.isComplete(userId).then(setOnboardedLocally)
  }, [userId])

  // Fetch profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      const existing = await api.profiles.get(userId)
      if (existing) {
        await onboardingStorage.markComplete(userId)
        setOnboardedLocally(true)
      }
      setProfile(existing)
      setLoading(false)
    }
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const setDisplayName = async (name: string) => {
    if (!userId) return
    const ok = await api.profiles.upsert({
      id: userId,
      display_name: name,
      last_seen: new Date().toISOString(),
    })
    if (ok) {
      setProfile((prev) => prev ? { ...prev, display_name: name } : null)
    }
  }

  const signOut = async () => {
    if (userId) {
      await onboardingStorage.clear(userId)
      setOnboardedLocally(false)
    }
    await authSignOut()
  }

  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? ''
  const role = (profile?.role as 'user' | 'admin') || 'user'
  const isOnboarded = !!profile || onboardedLocally

  return (
    <IdentityContext.Provider value={{ userId, displayName, avatarUrl, role, isOnboarded, loading, setDisplayName, signOut }}>
      {children}
    </IdentityContext.Provider>
  )
}

export const useIdentity = () => useContext(IdentityContext)
