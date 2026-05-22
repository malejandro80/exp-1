import { memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'
import { AVATAR_SIZE, AVATAR_TEXT_SIZE } from '@/constants/layout'
import { timeAgo } from '@/utils/helpers'

interface ChatCardProps {
  displayName: string | null
  lastMessage: string | null
  lastMessageAt: string
  status: 'pending' | 'active'
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderRadius: 10,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: isPending ? Colors.light.brandMuted : 'rgba(41,37,36,0.03)',
      }}
      onPress={onPress}
    >
      <View style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: Radius.full,
        backgroundColor: isPending ? Colors.light.warning : Colors.light.brand,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: '#fff', fontSize: AVATAR_TEXT_SIZE, fontWeight: '700' }}>
          {(displayName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.text }}>
            {displayName || 'Anonymous'}
          </Text>
          {isPending && (
            <View style={{
              backgroundColor: Colors.light.warning,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                PENDING
              </Text>
            </View>
          )}
        </View>
        {lastMessage && (
          <Text
            style={{ fontSize: 13, color: Colors.light.textTertiary, marginTop: 2 }}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        )}
        {isPending && !isPendingRecipient && (
          <Text style={{ fontSize: 12, fontStyle: 'italic', color: Colors.light.textTertiary, marginTop: 2 }}>
            Awaiting response...
          </Text>
        )}
      </View>
      {isPending && isPendingRecipient ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={onDecline}
            style={{
              backgroundColor: Colors.light.controlBackground,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.light.textSecondary }}>
              Decline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={{
              backgroundColor: Colors.light.brand,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={{ fontSize: 12, color: Colors.light.textMuted }}>
          {timeAgo(lastMessageAt)}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export const ChatCard = memo(ChatCardInner)
