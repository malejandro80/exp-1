import { supabase } from '@/lib/supabase'

export const blockService = {
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    try {
      const { error } = await supabase.from('blocks').insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      } as any)

      if (error) {
        console.error('[blockService.blockUser]', error.message)
      }
    } catch (err) {
      console.error('[blockService.blockUser] Unexpected error:', err)
    }
  },

  async getBlockedIds(blockerId: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', blockerId)

      if (error) {
        console.error('[blockService.getBlockedIds]', error.message)
        return new Set()
      }
      return new Set((data as any[])?.map((b: any) => b.blocked_id) || [])
    } catch (err) {
      console.error('[blockService.getBlockedIds] Unexpected error:', err)
      return new Set()
    }
  },
}
