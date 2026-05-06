import { supabase } from '@/lib/supabase'
import type { Promotion } from '@/lib/types'

export const promotionService = {
  async create(data: {
    room_id: string
    title: string
    description?: string
    image_url?: string
    duration_minutes: number
  }): Promise<Promotion | null> {
    try {
      const { data: promotion, error } = await supabase
        .from('promotions')
        .insert({
          ...data,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + data.duration_minutes * 60_000).toISOString(),
        })
        .select()
        .single()
      if (error) {
        console.error('[promotionService.create]', error.message)
        return null
      }
      return promotion as Promotion
    } catch (err) {
      console.error('[promotionService.create] Unexpected error:', err)
      return null
    }
  },

  async listByRoom(roomId: string): Promise<Promotion[]> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('[promotionService.listByRoom]', error.message)
        return []
      }
      return (data as Promotion[]) || []
    } catch (err) {
      console.error('[promotionService.listByRoom] Unexpected error:', err)
      return []
    }
  },

  async getActiveByRoom(roomId: string): Promise<Promotion[]> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('room_id', roomId)
        .gte('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })
      if (error) {
        console.error('[promotionService.getActiveByRoom]', error.message)
        return []
      }
      return (data as Promotion[]) || []
    } catch (err) {
      console.error('[promotionService.getActiveByRoom] Unexpected error:', err)
      return []
    }
  },

  async getById(id: string): Promise<Promotion | null> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        console.error('[promotionService.getById]', error.message)
        return null
      }
      return data as Promotion | null
    } catch (err) {
      console.error('[promotionService.getById] Unexpected error:', err)
      return null
    }
  },
}
