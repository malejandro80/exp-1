import { memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Colors, Spacing } from '@/constants/theme'
import { timeAgo } from '@/lib/helpers'

interface ChatCardProps {
  displayName: string | null
  lastMessage: string | null
  lastMessageAt: string
  onPress: () => void
}

export const ChatCard = memo(function ChatCard({ displayName, lastMessage, lastMessageAt, onPress }: ChatCardProps) {
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
        borderColor: 'rgba(41,37,36,0.03)',
      }}
      onPress={onPress}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 9999,
        backgroundColor: Colors.light.brand,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
          {(displayName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.text }}>
          {displayName || 'Anonymous'}
        </Text>
        {lastMessage && (
          <Text
            style={{ fontSize: 13, color: Colors.light.textTertiary, marginTop: 2 }}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 12, color: Colors.light.textMuted }}>
        {timeAgo(lastMessageAt)}
      </Text>
    </TouchableOpacity>
  )
})
