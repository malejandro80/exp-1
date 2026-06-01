import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { promotion_id } = await req.json()
    if (!promotion_id) {
      return new Response(JSON.stringify({ error: 'promotion_id required' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: promotion, error: promoError } = await supabase
      .from('promotions')
      .select('*, rooms(name, latitude, longitude, radius_meters)')
      .eq('id', promotion_id)
      .single()

    if (promoError || !promotion) {
      return new Response(JSON.stringify({ error: 'Promotion not found' }), { status: 404 })
    }

    const room = promotion.rooms as { name: string; latitude: number; longitude: number; radius_meters: number }
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

    const messages = pushTokens.map((t: { token: string }) => ({
      to: t.token,
      title: `🎉 ${promotion.title}`,
      body: promotion.description || `New promotion at ${room.name}!`,
      data: {
        type: 'promotion',
        promotion_id: promotion.id,
        room_id: promotion.room_id,
      },
    }))

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })

    const result = await expoResponse.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), { status: 200 })
  } catch (err) {
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
