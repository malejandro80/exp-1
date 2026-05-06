import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { usePromotionDetail } from '@/hooks/usePromotionDetail'
import {
  PROMOTION_EXPIRED_LABEL,
  PROMOTION_NOT_FOUND,
} from '@/constants/labels'
import { styles } from './[id].styles'

const PromotionDetail = () => {
  const { promotion, loading, timeLeft, isExpired } = usePromotionDetail()

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
        <Text style={styles.errorText}>{PROMOTION_NOT_FOUND}</Text>
      </SafeAreaView>
    )
  }

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
            {isExpired ? PROMOTION_EXPIRED_LABEL : timeLeft}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default PromotionDetail
