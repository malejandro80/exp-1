/** @format */

import { supabase } from '@/lib/supabase'
import type { Room } from '@/lib/types'

export const roomService = {
  async getAll(): Promise<Room[]> {
    try {
      const { data, error } = await supabase.from('rooms').select('*')

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

  async create(data: {
    name: string
    description: string
    latitude: number
    longitude: number
    radius_meters: number
    admin_id: string
  }): Promise<Room | null> {
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({ ...data, is_active: true })
        .select()
        .single()
      if (error) {
        console.error('[roomService.create]', error.message)
        return null
      }
      return room as Room
    } catch (err) {
      console.error('[roomService.create] Unexpected error:', err)
      return null
    }
  },

  async getByAdmin(adminId: string): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('admin_id', adminId)
        .eq('is_active', true)
        .maybeSingle()
      if (error) {
        console.error('[roomService.getByAdmin]', error.message)
        return null
      }
      return data as Room | null
    } catch (err) {
      console.error('[roomService.getByAdmin] Unexpected error:', err)
      return null
    }
  },

  async update(
    roomId: string,
    data: Partial<
      Pick<Room, 'name' | 'description' | 'radius_meters' | 'is_active'>
    >
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .update(data)
        .eq('id', roomId)
      if (error) {
        console.error('[roomService.update]', error.message)
        return false
      }
      return true
    } catch (err) {
      console.error('[roomService.update] Unexpected error:', err)
      return false
    }
  }
}
