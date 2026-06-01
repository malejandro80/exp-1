import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'
import type { Room, Promotion } from '@/lib/types'
import { styles } from './manage-room.styles'

const ManageRoom = () => {
  const { userId } = useIdentity()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    api.rooms.getByAdmin(userId).then(async (r) => {
      setRoom(r)
      if (r) {
        const promos = await api.promotions.listByRoom(r.id)
        setPromotions(promos)
      }
      setLoading(false)
    })
  }, [userId])

  const activePromos = promotions.filter((p) => new Date(p.ends_at) > new Date())
  const expiredPromos = promotions.filter((p) => new Date(p.ends_at) <= new Date())

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
        <Text style={styles.emptyTitle}>No room found</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => router.replace('/(tabs)/admin/create-room')}>
          <Text style={styles.createButtonText}>Create your room</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const remainingTime = (promotion: Promotion) => {
    const diff = new Date(promotion.ends_at).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const mins = Math.floor(diff / 60_000)
    if (mins < 60) return `${mins}m remaining`
    const hours = Math.floor(mins / 60)
    return `${hours}h ${mins % 60}m remaining`
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        {room.description && <Text style={styles.roomDesc}>{room.description}</Text>}
        <Text style={styles.roomMeta}>{Math.round(room.radius_meters)}m radius</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Active promotions ({activePromos.length})
        </Text>
      </View>

      <FlatList
        data={activePromos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={activePromos.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={40} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No active promotions</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/admin/create-promotion')}
            >
              <Text style={styles.createButtonText}>Create promotion</Text>
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
          <Text style={styles.sectionTitle}>Expired ({expiredPromos.length})</Text>
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
