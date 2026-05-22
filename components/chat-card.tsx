import { memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { timeAgo } from '@/utils/helpers'
import { styles } from './chat-card.styles'

interface ChatCardProps {
  displayName: string | null
  lastMessage: string | null
  lastMessageAt: string
  status: 'pending' | 'active' | 'declined'
  isPendingRecipient: boolean
  onPress: () => void
  onAccept?: () => void
  onDecline?: () => void
}

const ChatCardInner = ({
  displayName,
  lastMessage,
  lastMessageAt,
  status,
  isPendingRecipient,
  onPress,
  onAccept,
  onDecline,
}: ChatCardProps) => {
  const isPending = status === 'pending'

  return (
    <TouchableOpacity
      style={[styles.card, isPending && styles.cardPending]}
      onPress={onPress}
    >
      <View style={[styles.avatar, isPending ? styles.avatarPending : styles.avatarDefault]}>
        <Text style={styles.avatarText}>
          {(displayName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.middle}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {displayName || 'Anonymous'}
          </Text>
          {isPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>PENDING</Text>
            </View>
          )}
        </View>
        {lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        )}
        {isPending && !isPendingRecipient && (
          <Text style={styles.awaitingText}>
            Awaiting response...
          </Text>
        )}
      </View>
      {isPending && isPendingRecipient ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.timeAgo}>{timeAgo(lastMessageAt)}</Text>
      )}
    </TouchableOpacity>
  )
}

export const ChatCard = memo(ChatCardInner)
