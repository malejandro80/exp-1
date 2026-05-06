import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  type: string
  table: string
  schema: string
  record: {
    id: string
    room_id: string
    title: string
    description?: string | null
  }
  old_record: null
}

interface PromotionWithRoom {
  id: string
  room_id: string
  title: string
  description: string | null
  rooms: {
    name: string
    latitude: number
    longitude: number
    radius_meters: number
  }
}

interface ExpoPushMessage {
  to: string
  sound: string
  title: string
  body: string
  data: {
    type: string
    promotion_id: string
    room_id: string
  }
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error'
    message?: string
    details?: {
      error: string
    }
  }>
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_BATCH_LIMIT = 100

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

serve(async (req) => {
  try {
    const body: WebhookPayload | { promotion_id: string } = await req.json()

    // Support both webhook format and direct { promotion_id } format
    const promotionId = 'record' in body ? body.record.id : body.promotion_id

    if (!promotionId) {
      return new Response(JSON.stringify({ error: 'promotion_id required' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: promotion, error: promoError } = await supabase
      .from('promotions')
      .select('*, rooms(name, latitude, longitude, radius_meters)')
      .eq('id', promotionId)
      .single()

    if (promoError || !promotion) {
      return new Response(JSON.stringify({ error: 'Promotion not found' }), { status: 404 })
    }

    const typedPromotion = promotion as unknown as PromotionWithRoom
    const room = typedPromotion.rooms
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, latitude, longitude')
      .gte('last_seen', fifteenMinAgo)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    const userIdsInRoom: string[] = []

    for (const profile of profiles) {
      if (!profile.latitude || !profile.longitude) continue
      const dist = haversine(room.latitude, room.longitude, profile.latitude, profile.longitude)
      if (dist <= room.radius_meters) {
        userIdsInRoom.push(profile.id)
      }
    }

    if (userIdsInRoom.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    const { data: pushTokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIdsInRoom)

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    const bodyText = typedPromotion.description || `New promotion at ${room.name}!`

    const messages: ExpoPushMessage[] = pushTokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: typedPromotion.title,
      body: bodyText,
      data: {
        type: 'promotion',
        promotion_id: typedPromotion.id,
        room_id: typedPromotion.room_id,
      },
    }))

    const chunks = chunk(messages, EXPO_BATCH_LIMIT)
    const results = await Promise.all(
      chunks.map(async (batch) => {
        const resp = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
        })
        if (!resp.ok) {
          const errorBody = await resp.text()
          console.error(`[send-promotion] Expo API error ${resp.status}: ${errorBody}`)
          return { data: batch.map(() => ({ status: 'error' as const, details: { error: 'HTTP_ERROR' } })) }
        }
        return resp.json() as Promise<ExpoPushResponse>
      })
    )

    const tokensToDelete: string[] = []
    let allIndex = 0
    for (const result of results) {
      if (result.data) {
        for (const item of result.data) {
          if (item.status === 'error' && item.details?.error === 'DeviceNotRegistered') {
            tokensToDelete.push(pushTokens[allIndex].token)
          }
          allIndex++
        }
      }
    }

    if (tokensToDelete.length > 0) {
      console.log(`[send-promotion] Removing ${tokensToDelete.length} invalid tokens`)
      await supabase
        .from('push_tokens')
        .delete()
        .in('token', tokensToDelete)
    }

    return new Response(JSON.stringify({ sent: messages.length, errors: tokensToDelete.length }), { status: 200 })
  } catch (err) {
    console.error('[send-promotion] Unexpected error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
