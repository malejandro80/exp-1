import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'
import { styles } from './create-promotion.styles'

const DURATION_PRESETS = [15, 30, 60, 120]

const CreatePromotion = () => {
  const { userId } = useIdentity()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!title.trim() || !userId) return
    setSaving(true)

    const room = await api.rooms.getByAdmin(userId)
    if (!room) {
      Alert.alert('Error', 'You need a room first.')
      setSaving(false)
      return
    }

    const promotion = await api.promotions.create({
      room_id: room.id,
      title: title.trim(),
      description: description.trim() || undefined,
      duration_minutes: duration,
    })

    if (promotion) {
      try {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
        await fetch(`${supabaseUrl}/functions/v1/send-promotion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ promotion_id: promotion.id }),
        })
      } catch (e) {
        console.error('Failed to send push notification', e)
      }

      Alert.alert('Promotion sent!', `"${title.trim()}" is now live for ${duration} minutes.`)
      router.back()
    } else {
      Alert.alert('Error', 'Could not create promotion.')
    }
    setSaving(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Promotion title (e.g., 2x1 in beers)"
          placeholderTextColor={Colors.light.textMuted}
          maxLength={100}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          placeholderTextColor={Colors.light.textMuted}
          multiline
          maxLength={300}
        />

        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATION_PRESETS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationChip, duration === d && styles.durationChipActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                {d < 60 ? `${d} min` : `${d / 60}h`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.sendButton, (!title.trim() || saving) && styles.sendButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || saving}
        >
          <Text style={styles.sendButtonText}>{saving ? 'Sending...' : 'Send promotion'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatePromotion
