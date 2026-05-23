/** @format */

import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { api } from '@/services'
import { useIdentity } from '@/contexts/IdentityContext'
import {
  PROFILE_LOAD_ERROR,
  PROFILE_SAVE_ERROR,
  PROFILE_SAVED_TITLE,
  PROFILE_SAVED_MESSAGE,
  SIGNOUT_TITLE,
  SIGNOUT_MESSAGE,
  SIGNOUT_CANCEL,
  SIGNOUT_CONFIRM,
} from '@/constants/labels'

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
  const { userId, displayName, setDisplayName, signOut } = useIdentity()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [nameInput, setNameInput] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId) return
    const profile = await api.profiles.get(userId)
    if (!profile) {
      setError(PROFILE_LOAD_ERROR)
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
      last_seen: new Date().toISOString(),
    })
    setSaving(false)
    if (!ok) {
      setError(PROFILE_SAVE_ERROR)
      return
    }
    await setDisplayName(nameInput.trim())
    Alert.alert(PROFILE_SAVED_TITLE, PROFILE_SAVED_MESSAGE)
  }

  const handleReset = () => {
    Alert.alert(
      SIGNOUT_TITLE,
      SIGNOUT_MESSAGE,
      [
        { text: SIGNOUT_CANCEL, style: 'cancel' },
        { text: SIGNOUT_CONFIRM, style: 'destructive', onPress: signOut },
      ],
    )
  }

  return {
    profile,
    nameInput,
    saving,
    error,
    setNameInput,
    upsertProfile,
    handleReset,
  }
}
