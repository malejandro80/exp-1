import { memo } from 'react'
import { View, Text } from 'react-native'
import { timeAgo } from '@/utils/helpers'
import { styles } from './message-bubble.styles'

interface MessageBubbleProps {
  content: string
  created_at: string
  isMine: boolean
}

const MessageBubbleInner = ({ content, created_at, isMine }: MessageBubbleProps) => {
  return (
    <View style={isMine ? styles.bubbleMine : styles.bubbleTheirs}>
      <Text style={isMine ? styles.messageTextMine : styles.messageTextTheirs}>
        {content}
      </Text>
      <Text style={isMine ? styles.timeMine : styles.timeTheirs}>
        {timeAgo(created_at)}
      </Text>
    </View>
  )
}

export const MessageBubble = memo(MessageBubbleInner)
