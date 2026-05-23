import React from 'react'
import { render } from '@testing-library/react-native'
import Index from '@/app/index'

jest.mock('@/services', () => ({
  api: {
    auth: {
      getSession: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => jest.fn()),
    },
    profiles: {
      get: jest.fn(),
      upsert: jest.fn(),
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

const mockUseAuth = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseIdentity = jest.fn()
jest.mock('@/contexts/IdentityContext', () => ({
  useIdentity: () => mockUseIdentity(),
}))

const mockRedirect = jest.fn()
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href)
    return null
  },
}))

describe('Index redirect logic', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading indicator while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    mockUseIdentity.mockReturnValue({ isOnboarded: false, loading: true })

    const { getByText } = render(<Index />)
    expect(getByText('Loading your profile…')).toBeTruthy()
  })

  it('redirects to /login when no user', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    mockUseIdentity.mockReturnValue({ isOnboarded: false, loading: false })

    render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to /onboarding when user exists but not onboarded', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'abc' }, loading: false })
    mockUseIdentity.mockReturnValue({ isOnboarded: false, loading: false })

    render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith('/onboarding')
  })

  it('redirects to /(tabs)/nearby when user is onboarded', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'abc' }, loading: false })
    mockUseIdentity.mockReturnValue({ isOnboarded: true, loading: false })

    render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith('/(tabs)/nearby')
  })
})
