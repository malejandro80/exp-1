import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { api } from '@/services'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signInWithGoogle: async () => false,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const user = session?.user ?? null

  const restoreSession = async () => {
    try {
      const state = await api.auth.getSession()
      setSession(state.session)
    } catch (err) {
      console.error('[AuthProvider.restoreSession]', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    const unsubscribe = api.auth.onAuthStateChange((updatedSession) => {
      setSession(updatedSession)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      return await api.auth.signInWithGoogle()
    } catch (err) {
      console.error('[AuthProvider.signInWithGoogle]', err)
      return false
    }
  }

  const signOut = async () => {
    try {
      await api.auth.signOut()
    } catch (err) {
      console.error('[AuthProvider.signOut]', err)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
