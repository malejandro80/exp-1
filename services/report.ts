import { supabase } from '@/lib/supabase'

export const reportService = {
  async reportUser(reporterId: string, reportedId: string): Promise<void> {
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: reporterId,
        reported_id: reportedId,
      } as any)

      if (error) {
        console.error('[reportService.reportUser]', error.message)
      }
    } catch (err) {
      console.error('[reportService.reportUser] Unexpected error:', err)
    }
  },
}
