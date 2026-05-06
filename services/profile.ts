import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export interface ProfileUpdate {
  id: string
  display_name?: string
  latitude?: number
  longitude?: number
  last_seen?: string
}

export const profileService = {
  async get(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[profileService.get]', error.message)
        return null
      }
      return data as Profile | null
    } catch (err) {
      console.error('[profileService.get] Unexpected error:', err)
      return null
    }
  },

  async upsert(data: ProfileUpdate): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(data as any)

      if (error) {
        console.error('[profileService.upsert]', error.message)
        return false
      }
      return true
    } catch (err) {
      console.error('[profileService.upsert] Unexpected error:', err)
      return false
    }
  },

  async updateLocation(id: string, lat: number, lng: number): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          latitude: lat,
          longitude: lng,
          last_seen: new Date().toISOString(),
        } as any)
        .eq('id', id)
    } catch (err) {
      console.error('[profileService.updateLocation]', err)
    }
  },

  async getDisplayName(userId: string): Promise<{ display_name: string | null; avatar_url: string | null } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[profileService.getDisplayName]', error.message)
        return null
      }
      return data as { display_name: string | null; avatar_url: string | null } | null
    } catch (err) {
      console.error('[profileService.getDisplayName] Unexpected error:', err)
      return null
    }
  },

  async getRecentProfiles(staleTime: string, excludeUserId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', excludeUserId)
        .gte('last_seen', staleTime)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('[profileService.getRecentProfiles]', error.message)
        return []
      }
      return (data as Profile[]) || []
    } catch (err) {
      console.error('[profileService.getRecentProfiles] Unexpected error:', err)
      return []
    }
  },
}
