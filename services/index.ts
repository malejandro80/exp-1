import { authService } from './auth'
import { profileService } from './profile'
import { roomService } from './room'
import { conversationService } from './conversation'
import type { ConversationWithPreview } from './conversation'
import { messageService } from './message'
import { blockService } from './block'
import { reportService } from './report'
import { pushTokenService } from './push-token'

export const api = {
  auth: authService,
  profiles: profileService,
  rooms: roomService,
  conversations: conversationService,
  messages: messageService,
  blocks: blockService,
  reports: reportService,
  pushTokens: pushTokenService,
}

export type { ConversationWithPreview }
