import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useIdentity } from '@/contexts/IdentityContext'
import { usePromotions } from '@/hooks/usePromotions'
import { api } from '@/services'
import {
  ROOM_ERROR_NO_ROOM,
  PROMOTION_SENT_TITLE,
  PROMOTION_SENT_MESSAGE,
  PROMOTION_CREATE_ERROR,
  PROMOTION_TITLE_PLACEHOLDER,
  PROMOTION_DESC_PLACEHOLDER,
  PROMOTION_DURATION_LABEL,
  PROMOTION_DURATION_MIN,
  PROMOTION_DURATION_HOUR,
  PROMOTION_SEND_BUTTON,
  PROMOTION_SEND_BUTTON_SAVING,
} from '@/constants/labels'
import { styles } from './create-promotion.styles'

const DURATION_PRESETS = [15, 30, 60, 120]

const CreatePromotion = () => {
  const { userId } = useIdentity()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)

  const room = null // fetched below

  const handleCreate = async () => {
    if (!title.trim() || !userId) return

    const room = await api.rooms.getByAdmin(userId)
    if (!room) {
      Alert.alert('Error', ROOM_ERROR_NO_ROOM)
      return
    }

    const promotion = await api.promotions.create({
      room_id: room.id,
      title: title.trim(),
      description: description.trim() || undefined,
      duration_minutes: duration,
    })

    if (promotion) {
      // Push notification is sent automatically via DB trigger (pg_net)
      Alert.alert(PROMOTION_SENT_TITLE, PROMOTION_SENT_MESSAGE(title.trim(), duration))
      router.back()
    } else {
      Alert.alert('Error', PROMOTION_CREATE_ERROR)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={PROMOTION_TITLE_PLACEHOLDER}
          placeholderTextColor={Colors.light.textMuted}
          maxLength={100}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder={PROMOTION_DESC_PLACEHOLDER}
          placeholderTextColor={Colors.light.textMuted}
          multiline
          maxLength={300}
        />

        <Text style={styles.label}>{PROMOTION_DURATION_LABEL}</Text>
        <View style={styles.durationRow}>
          {DURATION_PRESETS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationChip, duration === d && styles.durationChipActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                {d < 60 ? PROMOTION_DURATION_MIN(d) : PROMOTION_DURATION_HOUR(d)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !title.trim() && styles.sendButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim()}
        >
          <Text style={styles.sendButtonText}>{PROMOTION_SEND_BUTTON}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatePromotion
