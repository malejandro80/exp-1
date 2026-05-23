import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ''
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''

const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    offlineAccess: false,
  })
}

configureGoogleSignIn()

export interface AuthState {
  session: Session | null
  user: User | null
}

export const authService = {
  async signInWithGoogle(): Promise<boolean> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const response = await GoogleSignin.signIn()

      if (!response.data?.idToken) {
        console.error('[authService.signInWithGoogle] No idToken returned')
        return false
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      })

      if (error) {
        console.error('[authService.signInWithGoogle] Supabase error:', error.message)
        return false
      }

      return !!data.session
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[authService.signInWithGoogle] User cancelled')
        return false
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        console.log('[authService.signInWithGoogle] Already signing in')
        return false
      }
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE && Platform.OS === 'android') {
        console.error('[authService.signInWithGoogle] Play Services not available')
        return false
      }
      console.error('[authService.signInWithGoogle] Unexpected error:', err)
      return false
    }
  },

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut()
    } catch (err) {
      console.error('[authService.signInWithGoogle.signOut] Google sign out error:', err)
    }
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[authService.signOut]', error.message)
      }
    } catch (err) {
      console.error('[authService.signOut] Unexpected error:', err)
    }
  },

  async getSession(): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('[authService.getSession]', error.message)
        return { session: null, user: null }
      }
      return {
        session: data.session,
        user: data.session?.user ?? null,
      }
    } catch (err) {
      console.error('[authService.getSession] Unexpected error:', err)
      return { session: null, user: null }
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return () => subscription.unsubscribe()
  },
}
