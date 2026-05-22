import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { MESSAGE_MAX_LENGTH } from '@/constants/rules'
import { MessageBubble } from '@/components/message-bubble'
import { styles } from './[id].styles'
import { useChat } from './useChat'

export default function ChatScreen() {
  const { userId, messages, input, otherUser, loading, error, flatListRef, setInput, sendMessage, showActions, conversationStatus, isRecipient, handleAcceptRequest, handleDeclineRequest } = useChat()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: otherUser?.display_name || 'Chat',
          headerShown: true,
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={showActions} style={{ paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 20, color: Colors.light.text }}>⋯</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.light.textTertiary} />
          <Text style={{ ...styles.loadingText, marginTop: 12 }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={messages.length === 0 ? styles.emptyMessages : styles.messagesList}
          initialNumToRender={20}
          windowSize={5}
          maxToRenderPerBatch={15}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet.{'\n'}Say hello!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              content={item.content}
              created_at={item.created_at}
              isMine={item.sender_id === userId}
            />
          )}
        />
      )}

      {conversationStatus === 'pending' && isRecipient && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 12,
          backgroundColor: Colors.light.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.light.border,
        }}>
          <Text style={{ flex: 1, fontSize: 14, color: Colors.light.textSecondary }}>
            {otherUser?.display_name || 'This user'} wants to chat with you
          </Text>
          <TouchableOpacity style={{ backgroundColor: Colors.light.brand, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }} onPress={handleAcceptRequest}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: Colors.light.controlBackground, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }} onPress={handleDeclineRequest}>
            <Text style={{ color: Colors.light.textSecondary, fontWeight: '600' }}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {conversationStatus === 'pending' ? (
        <View style={[styles.inputBar, { justifyContent: 'center' }]}>
          <Text style={{ fontSize: 14, color: Colors.light.textTertiary, textAlign: 'center' }}>
            {isRecipient
              ? 'Accept the request to start chatting'
              : 'Waiting for them to accept your request...'}
          </Text>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.light.textMuted}
            multiline
            maxLength={MESSAGE_MAX_LENGTH}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}
