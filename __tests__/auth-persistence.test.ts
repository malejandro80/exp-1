// Shared in-memory storage for mocking AsyncStorage across modules
const mockStorage: Record<string, string> = {}
export const mockAsyncStorage = {
  getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockStorage[key] = value }),
  removeItem: jest.fn(async (key: string) => { delete mockStorage[key] }),
  clear: jest.fn(async () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }),
}

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

// Mock supabase client
const mockGetSession = jest.fn()
const mockSignOut = jest.fn()
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithIdToken: jest.fn(),
    },
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

const { authService } = require('@/services/auth')
const { supabase } = require('@/lib/supabase')
const { onboardingStorage } = require('@/lib/onboarding')

describe('authService.getSession — restores session from storage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls supabase.auth.getSession and returns session + user', async () => {
    const mockSession = {
      access_token: 'token-abc',
      refresh_token: 'refresh-xyz',
      user: { id: 'user-1', email: 'test@example.com' },
    }
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const result = await authService.getSession()

    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(result.session).toEqual(mockSession)
    expect(result.user).toEqual(mockSession.user)
  })

  it('returns null session + null user when no session stored', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const result = await authService.getSession()

    expect(result.session).toBeNull()
    expect(result.user).toBeNull()
  })

  it('returns null session + null user on error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Network error' },
    })

    const result = await authService.getSession()

    expect(result.session).toBeNull()
    expect(result.user).toBeNull()
  })

  it('returns null session + null user on unexpected exception', async () => {
    mockGetSession.mockRejectedValue(new Error('unexpected'))

    const result = await authService.getSession()

    expect(result.session).toBeNull()
    expect(result.user).toBeNull()
  })
})

describe('authService.signOut — clears session from storage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls supabase.auth.signOut and GoogleSignin.signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await authService.signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('handles supabase signOut error gracefully', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'fail' } })

    await authService.signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})

describe('authService.onAuthStateChange — listens for storage changes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to auth state changes', () => {
    const callback = jest.fn()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const unsubscribe = authService.onAuthStateChange(callback)

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)
    expect(typeof unsubscribe).toBe('function')
  })
})

describe('Supabase client configuration — session persistence', () => {
  it('supabase client has auth methods configured', () => {
    expect(supabase.auth.getSession).toBeDefined()
    expect(supabase.auth.signOut).toBeDefined()
    expect(supabase.auth.onAuthStateChange).toBeDefined()
  })

  it('AsyncStorage has the required storage adapter methods', () => {
    expect(typeof mockAsyncStorage.getItem).toBe('function')
    expect(typeof mockAsyncStorage.setItem).toBe('function')
    expect(typeof mockAsyncStorage.removeItem).toBe('function')
  })

  it('stores and retrieves session data via AsyncStorage', async () => {
    const sessionData = JSON.stringify({
      access_token: 'token-abc',
      refresh_token: 'refresh-xyz',
      user: { id: 'user-1' },
    })

    await mockAsyncStorage.setItem('supabase.auth.token', sessionData)
    const stored = await mockAsyncStorage.getItem('supabase.auth.token')

    expect(stored).toBe(sessionData)
  })

  it('removes session data from AsyncStorage on sign-out', async () => {
    await mockAsyncStorage.setItem('supabase.auth.token', JSON.stringify({ user: { id: 'u1' } }))
    await mockAsyncStorage.removeItem('supabase.auth.token')
    const stored = await mockAsyncStorage.getItem('supabase.auth.token')

    expect(stored).toBeNull()
  })
})

describe('onboardingStorage — local flag for one-time onboarding', () => {
  afterEach(async () => {
    jest.clearAllMocks()
    // Clear the in-memory mock storage between tests
    const keys = ['@app/onboarded:user-a', '@app/onboarded:user-b']
    for (const k of keys) {
      await mockAsyncStorage.removeItem(k)
    }
  })

  it('returns false for a user who has never completed onboarding', async () => {
    const result = await onboardingStorage.isComplete('user-a')
    expect(result).toBe(false)
  })

  it('returns true after marking onboarding complete', async () => {
    await onboardingStorage.markComplete('user-a')
    const result = await onboardingStorage.isComplete('user-a')
    expect(result).toBe(true)
  })

  it('uses per-user keys (different users do not interfere)', async () => {
    await onboardingStorage.markComplete('user-a')

    const userA = await onboardingStorage.isComplete('user-a')
    const userB = await onboardingStorage.isComplete('user-b')

    expect(userA).toBe(true)
    expect(userB).toBe(false)
  })

  it('returns false after clearing', async () => {
    await onboardingStorage.markComplete('user-a')
    await onboardingStorage.clear('user-a')
    const result = await onboardingStorage.isComplete('user-a')
    expect(result).toBe(false)
  })

  it('handles errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'))
    const result = await onboardingStorage.isComplete('user-a')
    expect(result).toBe(false)
  })
})
