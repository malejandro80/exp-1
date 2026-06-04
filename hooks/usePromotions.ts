import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services'
import type { Promotion } from '@/lib/types'

const PROMOTIONS_KEY = 'promotions'

export const usePromotions = (roomId: string) => {
  const queryClient = useQueryClient()

  const activeQuery = useQuery({
    queryKey: [PROMOTIONS_KEY, 'active', roomId],
    queryFn: () => api.promotions.getActiveByRoom(roomId),
    enabled: !!roomId,
  })

  const allQuery = useQuery({
    queryKey: [PROMOTIONS_KEY, 'all', roomId],
    queryFn: () => api.promotions.listByRoom(roomId),
    enabled: !!roomId,
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      room_id: string
      title: string
      description?: string
      image_url?: string
      duration_minutes: number
    }) => api.promotions.create(data),
    onSuccess: (promotion) => {
      if (promotion) {
        queryClient.invalidateQueries({ queryKey: [PROMOTIONS_KEY] })
      }
    },
  })

  return {
    activePromotions: activeQuery.data ?? [],
    allPromotions: allQuery.data ?? [],
    isLoading: activeQuery.isLoading || allQuery.isLoading,
    createPromotion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  }
}

export const usePromotionById = (id: string) => {
  return useQuery({
    queryKey: [PROMOTIONS_KEY, 'detail', id],
    queryFn: () => api.promotions.getById(id),
    enabled: !!id,
  })
}
