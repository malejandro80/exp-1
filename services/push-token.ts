import { supabase } from '@/lib/supabase'

export const pushTokenService = {
  async upsert(userId: string, token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({ user_id: userId, token }, { onConflict: 'user_id' })
      if (error) {
        console.error('[pushTokenService.upsert]', error.message)
        return false
      }
      return true
    } catch (err) {
      console.error('[pushTokenService.upsert] Unexpected error:', err)
      return false
    }
  },

  async remove(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', userId)
      if (error) {
        console.error('[pushTokenService.remove]', error.message)
        return false
      }
      return true
    } catch (err) {
      console.error('[pushTokenService.remove] Unexpected error:', err)
      return false
    }
  },
}
