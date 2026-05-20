import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
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

export function useProfile() {
  const { userId, displayName, setDisplayName, resetIdentity } = useIdentity()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [nameInput, setNameInput] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError('Could not load profile.')
          return
        }
        const d = data as ProfileRow | null
        if (d) {
          setProfile(d)
          setNameInput(d.display_name || displayName)
        }
      })
  }, [userId, displayName])

  const upsertProfile = async () => {
    if (!userId || !nameInput.trim()) return
    setSaving(true)
    setError(null)
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: nameInput.trim(),
      last_seen: new Date().toISOString(),
    } as any)
    setSaving(false)
    if (upsertError) {
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
        { text: 'Reset', style: 'destructive', onPress: resetIdentity },
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
    handleReset,
  }
}
