import {
  View, Text, FlatList, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { ChatCard } from '@/components/chat-card'
import { styles } from './chats.styles'
import { useChats } from './useChats'

const ChatsScreen = () => {
  const { conversations, loading, error, navigateToChat, userId, handleAccept, handleDecline } = useChats()

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>{error}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.list}
        initialNumToRender={12}
        windowSize={5}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap on someone nearby to start chatting
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChatCard
            displayName={item.otherUser?.display_name || null}
            lastMessage={item.lastMessage}
            lastMessageAt={item.last_message_at}
            status={item.status}
            isPendingRecipient={item.status === 'pending' && item.participant2_id === userId}
            onPress={() => navigateToChat(item)}
            onAccept={() => handleAccept(item.id)}
            onDecline={() => handleDecline(item.id)}
          />
        )}
      />
    </View>
  )
}

export default ChatsScreen
