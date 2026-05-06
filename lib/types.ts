export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  latitude: number | null
  longitude: number | null
  last_seen: string
  created_at: string
  role: 'user' | 'admin'
}

export interface Room {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  radius_meters: number
  admin_id: string | null
  is_active: boolean | null
  created_at: string
}

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  status: 'pending' | 'active' | 'declined'
  last_message_at: string
  created_at: string
}

export interface Message {
  id: number
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string | null
  created_at: string
}

export interface PersonInRoom extends Profile {
  distance_meters: number
}
<<<<<<< HEAD
=======

export interface Promotion {
  id: string
  room_id: string
  title: string
  description: string | null
  image_url: string | null
  duration_minutes: number
  starts_at: string
  ends_at: string
  created_at: string
}

export interface PushToken {
  id: string
  user_id: string
  token: string
  created_at: string
}
>>>>>>> d6f388f (Initial commit with all changes)
