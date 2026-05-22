import { supabase } from '@/lib/supabase'
import type { Room } from '@/lib/types'

export const roomService = {
  async getAll(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')

      if (error) {
        console.error('[roomService.getAll]', error.message)
        return []
      }
      return (data as Room[]) || []
    } catch (err) {
      console.error('[roomService.getAll] Unexpected error:', err)
      return []
    }
  },
}
