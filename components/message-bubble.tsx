import { memo } from 'react'
import { View, Text } from 'react-native'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { timeAgo } from '@/utils/helpers'

interface MessageBubbleProps {
  content: string
  created_at: string
  isMine: boolean
}

const MessageBubbleInner = ({ content, created_at, isMine }: MessageBubbleProps) => {
  return (
    <View style={{
      maxWidth: '80%',
      padding: Spacing.md,
      borderRadius: Radius.lg,
      marginBottom: Spacing.sm,
      backgroundColor: isMine ? Colors.light.myMessageBg : Colors.light.theirMessageBg,
      alignSelf: isMine ? 'flex-end' : 'flex-start',
      borderBottomRightRadius: isMine ? Radius.sm : Radius.lg,
      borderBottomLeftRadius: isMine ? Radius.lg : Radius.sm,
    }}>
      <Text style={{
        fontSize: 15,
        lineHeight: 20,
        color: isMine ? '#fff' : Colors.light.text,
      }}>
        {content}
      </Text>
      <Text style={{
        fontSize: 11,
        marginTop: Spacing.xs,
        color: isMine ? 'rgba(255,255,255,0.6)' : Colors.light.textTertiary,
        textAlign: 'right',
      }}>
        {timeAgo(created_at)}
      </Text>
    </View>
  )
}

export const MessageBubble = memo(MessageBubbleInner)
