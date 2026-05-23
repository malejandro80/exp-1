/** @format */

import { useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { LOGIN_ERROR } from '@/constants/labels'

export const useLogin = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const ok = await signInWithGoogle()
    if (ok) {
      router.replace('/')
    } else {
      setLoading(false)
      setError(LOGIN_ERROR)
    }
  }

  return { loading, error, handleGoogleSignIn }
}
