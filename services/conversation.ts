import { supabase } from '@/lib/supabase'
import type { Conversation } from '@/lib/types'

export interface ConversationWithPreview extends Conversation {
  otherUser: { display_name: string | null; avatar_url: string | null } | null
  lastMessage: string | null
}

export const conversationService = {
  async listByUser(userId: string): Promise<ConversationWithPreview[]> {
    try {
      const { data: convs, error: convsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .in('status', ['pending', 'active'])
        .order('last_message_at', { ascending: false })

      if (convsError) {
        console.error('[conversationService.listByUser]', convsError.message)
        return []
      }

      const enriched = await Promise.all(
        ((convs as any[]) || []).map(async (conv: any) => {
          const otherId = conv.participant1_id === userId
            ? conv.participant2_id
            : conv.participant1_id

          const [profileResult, messageResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', otherId)
              .single(),
            supabase
              .from('messages')
              .select('content')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1),
          ])

          return {
            ...conv,
            status: conv.status as 'pending' | 'active',
            otherUser: (profileResult.data as any) || null,
            lastMessage: ((messageResult.data as any[])?.[0]?.content as string) || null,
          }
        })
      )

      return enriched as ConversationWithPreview[]
    } catch (err) {
      console.error('[conversationService.listByUser] Unexpected error:', err)
      return []
    }
  },

  async getStatus(conversationId: string): Promise<'pending' | 'active' | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('status')
        .eq('id', conversationId)
        .single()

      if (error) {
        console.error('[conversationService.getStatus]', error.message)
        return null
      }
      return (data as any)?.status as 'pending' | 'active' | null
    } catch (err) {
      console.error('[conversationService.getStatus] Unexpected error:', err)
      return null
    }
  },

  async updateStatus(conversationId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status } as any)
        .eq('id', conversationId)

      if (error) {
        console.error('[conversationService.updateStatus]', error.message)
        return false
      }
      return true
    } catch (err) {
      console.error('[conversationService.updateStatus] Unexpected error:', err)
      return false
    }
  },

  async updateLastMessageAt(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() } as any)
        .eq('id', conversationId)
    } catch (err) {
      console.error('[conversationService.updateLastMessageAt]', err)
    }
  },

  async findExisting(user1: string, user2: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant1_id', user1)
        .eq('participant2_id', user2)
        .maybeSingle()

      if (error) {
        console.error('[conversationService.findExisting]', error.message)
        return null
      }
      return (data as any)?.id || null
    } catch (err) {
      console.error('[conversationService.findExisting] Unexpected error:', err)
      return null
    }
  },

  async create(participant1Id: string, participant2Id: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          status: 'pending',
        } as any)
        .select('id')
        .single()

      if (error) {
        console.error('[conversationService.create]', error)
        return null
      }
      return (data as any).id
    } catch (err) {
      console.error('[conversationService.create] Unexpected error:', err)
      return null
    }
  },
}
