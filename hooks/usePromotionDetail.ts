import { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { api } from '@/services'
import type { Promotion } from '@/lib/types'

export const usePromotionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!id) return
    api.promotions.getById(id).then((p) => {
      setPromotion(p)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!promotion) return

    const tick = () => {
      const diff = new Date(promotion.ends_at).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }
      const mins = Math.floor(diff / 60_000)
      const secs = Math.floor((diff % 60_000) / 1000)
      if (mins < 60) {
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')} remaining`)
      } else {
        const hours = Math.floor(mins / 60)
        setTimeLeft(`${hours}h ${mins % 60}m remaining`)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [promotion])

  const isExpired = promotion ? new Date(promotion.ends_at) <= new Date() : false

  return { id, promotion, loading, timeLeft, isExpired }
}
