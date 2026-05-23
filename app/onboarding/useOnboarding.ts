/** @format */

import { useState } from 'react'
import { router } from 'expo-router'
import { useIdentity } from '@/contexts/IdentityContext'
import { onboardingStorage } from '@/lib/onboarding'

export const useOnboarding = () => {
  const { userId, displayName, setDisplayName } = useIdentity()
  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await setDisplayName(name.trim())
      if (userId) {
        await onboardingStorage.markComplete(userId)
      }
      router.replace('/')
    } catch {
      setSaving(false)
    }
  }

  return { name, saving, setName, handleContinue }
}
