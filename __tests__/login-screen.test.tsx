import React from 'react'
import { render } from '@testing-library/react-native'
import LoginScreen from '@/app/login'
import {
  LOGIN_TITLE,
  LOGIN_SUBTITLE,
  LOGIN_BUTTON,
  LOGIN_BUTTON_LOADING,
  LOGIN_DISCLAIMER,
} from '@/constants/labels'

const mockUseLogin = jest.fn()

jest.mock('@/app/login/useLogin', () => ({
  useLogin: () => mockUseLogin(),
}))

describe('LoginScreen', () => {
  beforeEach(() => {
    mockUseLogin.mockReturnValue({
      loading: false,
      error: null,
      handleGoogleSignIn: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    const { getByText } = render(<LoginScreen />)
    expect(getByText(LOGIN_TITLE)).toBeTruthy()
    expect(getByText(LOGIN_SUBTITLE)).toBeTruthy()
  })

  it('renders the Google sign-in button', () => {
    const { getByText } = render(<LoginScreen />)
    expect(getByText(LOGIN_BUTTON)).toBeTruthy()
  })

  it('renders the disclaimer', () => {
    const { getByText } = render(<LoginScreen />)
    expect(getByText(LOGIN_DISCLAIMER)).toBeTruthy()
  })

  it('shows loading state when signing in', () => {
    mockUseLogin.mockReturnValue({
      loading: true,
      error: null,
      handleGoogleSignIn: jest.fn(),
    })

    const { getByText } = render(<LoginScreen />)
    expect(getByText(LOGIN_BUTTON_LOADING)).toBeTruthy()
  })

  it('shows error when sign-in fails', () => {
    mockUseLogin.mockReturnValue({
      loading: false,
      error: 'Sign in was cancelled or failed. Please try again.',
      handleGoogleSignIn: jest.fn(),
    })

    const { getByText } = render(<LoginScreen />)
    expect(getByText('Sign in was cancelled or failed. Please try again.')).toBeTruthy()
  })
})
