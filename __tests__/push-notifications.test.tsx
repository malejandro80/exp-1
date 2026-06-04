jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}))

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}))

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialNotificationAsync: jest.fn(() => Promise.resolve(null)),
}))

jest.mock('expo-device', () => ({
  isDevice: false,
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => jest.fn()),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
  },
}))

import { router } from 'expo-router'
import { handleNotificationData } from '@/app/_layout'

describe('handleNotificationData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('navigates to promotion screen for promotion notifications', () => {
    const data = { type: 'promotion', promotion_id: 'abc-123', room_id: 'xyz' }
    handleNotificationData(data)
    expect(router.push).toHaveBeenCalledWith('/promotion/abc-123')
  })

  it('does not navigate for unknown notification types', () => {
    const data = { type: 'message', conversation_id: 'conv-1' }
    handleNotificationData(data)
    expect(router.push).not.toHaveBeenCalled()
  })

  it('does not navigate when promotion_id is missing', () => {
    const data = { type: 'promotion' }
    handleNotificationData(data)
    expect(router.push).not.toHaveBeenCalled()
  })

  it('does not navigate when promotion_id is not a string', () => {
    const data = { type: 'promotion', promotion_id: 123 }
    handleNotificationData(data)
    expect(router.push).not.toHaveBeenCalled()
  })
})
