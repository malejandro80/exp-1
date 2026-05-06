import { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { api } from '@/services'
import type { Promotion } from '@/lib/types'
import { styles } from './[id].styles'

const PromotionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!id) return
    api.promotions.getById(id).then((p) => {
      setPromotion(p)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!promotion) return

    const tick = () => {
      const diff = new Date(promotion.ends_at).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }
      const mins = Math.floor(diff / 60_000)
      const secs = Math.floor((diff % 60_000) / 1000)
      if (mins < 60) {
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')} remaining`)
      } else {
        const hours = Math.floor(mins / 60)
        setTimeLeft(`${hours}h ${mins % 60}m remaining`)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [promotion])

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
      </SafeAreaView>
    )
  }

  if (!promotion) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Promotion not found</Text>
      </SafeAreaView>
    )
  }

  const isExpired = new Date(promotion.ends_at) <= new Date()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={48} color={Colors.light.brand} />
        </View>
        <Text style={styles.title}>{promotion.title}</Text>
        {promotion.description && (
          <Text style={styles.description}>{promotion.description}</Text>
        )}
        <View style={[styles.timerBadge, isExpired && styles.timerBadgeExpired]}>
          <Ionicons
            name={isExpired ? 'time-outline' : 'timer-outline'}
            size={20}
            color={isExpired ? Colors.light.textTertiary : Colors.light.brand}
          />
          <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
            {isExpired ? 'Expired' : timeLeft}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default PromotionDetail
