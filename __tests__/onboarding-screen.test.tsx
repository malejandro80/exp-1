import React from 'react'
import { render } from '@testing-library/react-native'
import OnboardingScreen from '@/app/onboarding'
import {
  ONBOARDING_TITLE,
  ONBOARDING_SUBTITLE,
  ONBOARDING_LABEL,
  ONBOARDING_PLACEHOLDER,
  ONBOARDING_HINT,
  ONBOARDING_BUTTON,
  ONBOARDING_BUTTON_SAVING,
} from '@/constants/labels'

const mockUseOnboarding = jest.fn()

jest.mock('@/app/onboarding/useOnboarding', () => ({
  useOnboarding: () => mockUseOnboarding(),
}))

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockUseOnboarding.mockReturnValue({
      name: '',
      saving: false,
      setName: jest.fn(),
      handleContinue: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText(ONBOARDING_TITLE)).toBeTruthy()
    expect(getByText(ONBOARDING_SUBTITLE)).toBeTruthy()
  })

  it('renders the display name label', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText(ONBOARDING_LABEL)).toBeTruthy()
  })

  it('renders the input with placeholder', () => {
    const { getByPlaceholderText } = render(<OnboardingScreen />)
    expect(getByPlaceholderText(ONBOARDING_PLACEHOLDER)).toBeTruthy()
  })

  it('renders the hint text', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText(ONBOARDING_HINT)).toBeTruthy()
  })

  it('renders the continue button', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText(ONBOARDING_BUTTON)).toBeTruthy()
  })

  it('shows saving state on the button', () => {
    mockUseOnboarding.mockReturnValue({
      name: 'Test',
      saving: true,
      setName: jest.fn(),
      handleContinue: jest.fn(),
    })

    const { getByText } = render(<OnboardingScreen />)
    expect(getByText(ONBOARDING_BUTTON_SAVING)).toBeTruthy()
  })
})
