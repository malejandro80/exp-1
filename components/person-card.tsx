import { memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius } from '@/constants/theme'
import { AVATAR_SIZE, AVATAR_TEXT_SIZE } from '@/constants/layout'
import { metersToHuman, timeAgo } from '@/utils/helpers'
import type { PersonInRoom } from '@/lib/types'

interface PersonCardProps {
  person: PersonInRoom
  onPress: (person: PersonInRoom) => void
}

const PersonCardInner = ({ person, onPress }: PersonCardProps) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.light.surface,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(41,37,36,0.03)',
      }}
      onPress={() => onPress(person)}
    >
      <View style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: Radius.full,
        backgroundColor: Colors.light.brand,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: '#fff', fontSize: AVATAR_TEXT_SIZE, fontWeight: '700' }}>
          {(person.display_name || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.text }}>
          {person.display_name || 'Anonymous'}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.light.textTertiary, marginTop: 2 }}>
          {metersToHuman(person.distance_meters)} from room center · {timeAgo(person.last_seen)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.light.textMuted} />
    </TouchableOpacity>
  )
}

export const PersonCard = memo(PersonCardInner)
