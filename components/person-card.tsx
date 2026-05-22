import { memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { metersToHuman, timeAgo } from '@/utils/helpers'
import type { PersonInRoom } from '@/lib/types'
import { styles } from './person-card.styles'

interface PersonCardProps {
  person: PersonInRoom
  onPress: (person: PersonInRoom) => void
}

const PersonCardInner = ({ person, onPress }: PersonCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(person)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(person.display_name || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {person.display_name || 'Anonymous'}
        </Text>
        <Text style={styles.detail}>
          {metersToHuman(person.distance_meters)} from room center · {timeAgo(person.last_seen)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.light.textMuted} />
    </TouchableOpacity>
  )
}

export const PersonCard = memo(PersonCardInner)
