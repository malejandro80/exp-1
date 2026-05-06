import {
  View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { useManageRoom } from '@/hooks/useManageRoom'
import type { Promotion } from '@/lib/types'
import {
  ROOM_NOT_FOUND_TITLE,
  ROOM_CREATE_YOUR_ROOM,
  PROMOTION_EMPTY_TITLE,
  PROMOTION_CREATE_YOURS,
  PROMOTION_TIME_REMAINING,
  PROMOTION_EXPIRED_LABEL,
  ADMIN_ACTIVE_PROMOS,
  ADMIN_EXPIRED_PROMOS,
  ADMIN_ROOM_RADIUS,
} from '@/constants/labels'
import { styles } from './manage-room.styles'

const remainingTime = (promotion: Promotion): string => {
  const diff = new Date(promotion.ends_at).getTime() - Date.now()
  if (diff <= 0) return PROMOTION_EXPIRED_LABEL
  const mins = Math.floor(diff / 60_000)
  return PROMOTION_TIME_REMAINING(mins)
}

const ManageRoom = () => {
  const { room, activePromos, expiredPromos, loading } = useManageRoom()
  const router = useRouter()

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
      </SafeAreaView>
    )
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>{ROOM_NOT_FOUND_TITLE}</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => router.replace('/(tabs)/admin/create-room')}>
          <Text style={styles.createButtonText}>{ROOM_CREATE_YOUR_ROOM}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        {room.description && <Text style={styles.roomDesc}>{room.description}</Text>}
        <Text style={styles.roomMeta}>{ADMIN_ROOM_RADIUS(room.radius_meters)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {ADMIN_ACTIVE_PROMOS(activePromos.length)}
        </Text>
      </View>

      <FlatList
        data={activePromos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={activePromos.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={40} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>{PROMOTION_EMPTY_TITLE}</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/admin/create-promotion')}
            >
              <Text style={styles.createButtonText}>{PROMOTION_CREATE_YOURS}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.promoCard}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            {item.description && <Text style={styles.promoDesc}>{item.description}</Text>}
            <Text style={styles.promoTimer}>{remainingTime(item)}</Text>
          </View>
        )}
      />

      {expiredPromos.length > 0 && (
        <View style={styles.expiredSection}>
          <Text style={styles.sectionTitle}>{ADMIN_EXPIRED_PROMOS(expiredPromos.length)}</Text>
          {expiredPromos.slice(0, 3).map((item) => (
            <View key={item.id} style={[styles.promoCard, styles.expiredCard]}>
              <Text style={[styles.promoTitle, styles.expiredText]}>{item.title}</Text>
            </View>
          ))}
        </View>
      )}

      {activePromos.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(tabs)/admin/create-promotion')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

export default ManageRoom
