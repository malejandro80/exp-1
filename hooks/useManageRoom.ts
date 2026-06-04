import { useEffect, useState } from 'react'
import { useIdentity } from '@/contexts/IdentityContext'
import { api } from '@/services'
import type { Room, Promotion } from '@/lib/types'

export const useManageRoom = () => {
  const { userId } = useIdentity()
  const [room, setRoom] = useState<Room | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    api.rooms.getByAdmin(userId).then(async (r) => {
      setRoom(r)
      if (r) {
        const promos = await api.promotions.listByRoom(r.id)
        setPromotions(promos)
      }
      setLoading(false)
    })
  }, [userId])

  const activePromos = promotions.filter((p) => new Date(p.ends_at) > new Date())
  const expiredPromos = promotions.filter((p) => new Date(p.ends_at) <= new Date())

  return { room, promotions, activePromos, expiredPromos, loading }
}
