/**
 * API Facade — simplified entry point for all backend interactions.
 *
 * Usage:
 *   import { api } from '@/services'
 *
 *   const profile = await api.profiles.get(userId)
 *   const rooms = await api.rooms.getAll()
 *   const conversations = await api.conversations.listByUser(userId)
 *   await api.messages.send(conversationId, senderId, content)
 *   await api.blocks.blockUser(blockerId, blockedId)
 *   await api.reports.reportUser(reporterId, reportedId)
 */

import { profileService } from './profile'
import { roomService } from './room'
import { conversationService } from './conversation'
import type { ConversationWithPreview } from './conversation'
import { messageService } from './message'
import { blockService } from './block'
import { reportService } from './report'

export const api = {
  profiles: profileService,
  rooms: roomService,
  conversations: conversationService,
  messages: messageService,
  blocks: blockService,
  reports: reportService,
}

export type { ConversationWithPreview }
