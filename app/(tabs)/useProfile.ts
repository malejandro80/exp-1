/** @format */

import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { api } from '@/services'
import { useIdentity } from '@/contexts/IdentityContext'

interface ProfileRow {
  id: string
  display_name: string | null
  avatar_url: string | null
  latitude: number | null
  longitude: number | null
  last_seen: string
  created_at: string
}

export const useProfile = () => {
  const { userId, displayName, setDisplayName, resetIdentity } = useIdentity()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [nameInput, setNameInput] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId) return
    const profile = await api.profiles.get(userId)
    if (!profile) {
      setError('Could not load profile.')
      return
    }
    setProfile(profile)
    setNameInput(profile.display_name || '')
  }

  useEffect(() => {
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, displayName])

  const upsertProfile = async () => {
    if (!userId || !nameInput.trim()) return
    setSaving(true)
    setError(null)
    const ok = await api.profiles.upsert({
      id: userId,
      display_name: nameInput.trim(),
      last_seen: new Date().toISOString()
    })
    setSaving(false)
    if (!ok) {
      setError('Failed to save profile.')
      return
    }
    await setDisplayName(nameInput.trim())
    Alert.alert('Saved', 'Profile updated')
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Profile',
      'This will delete your profile and create a new anonymous identity. Your chats will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetIdentity }
      ]
    )
  }

  return {
    profile,
    nameInput,
    saving,
    error,
    setNameInput,
    upsertProfile,
    handleReset
  }
}
