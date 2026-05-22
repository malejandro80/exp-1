import { supabase } from '@/lib/supabase'
import type { Message } from '@/lib/types'

export const messageService = {
  async listByConversation(conversationId: string, limit = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[messageService.listByConversation]', error.message)
        return []
      }
      return ((data as Message[]) || []).reverse()
    } catch (err) {
      console.error('[messageService.listByConversation] Unexpected error:', err)
      return []
    }
  },

  async getLastMessage(conversationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('[messageService.getLastMessage]', error.message)
        return null
      }
      return ((data as any[])?.[0]?.content as string) || null
    } catch (err) {
      console.error('[messageService.getLastMessage] Unexpected error:', err)
      return null
    }
  },

  async send(conversationId: string, senderId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      } as any)

      if (error) {
        console.error('[messageService.send]', error.message)
      }
    } catch (err) {
      console.error('[messageService.send] Unexpected error:', err)
    }
  },

  subscribeToNewMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ): () => void {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as unknown as Message
          onMessage(newMsg)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
