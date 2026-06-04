// ─── Login ─────────────────────────────────────────────────
export const LOGIN_TITLE = 'Nearby'
export const LOGIN_SUBTITLE = 'Connect with people around you'
export const LOGIN_BUTTON = 'Continue with Google'
export const LOGIN_BUTTON_LOADING = 'Signing in…'
export const LOGIN_ERROR = 'Sign in was cancelled or failed. Please try again.'
export const LOGIN_DISCLAIMER =
  'Your location is only shared while the app is open.\nYou can block or report users at any time.'

// ─── Onboarding ────────────────────────────────────────────
export const ONBOARDING_TITLE = 'Welcome!'
export const ONBOARDING_SUBTITLE = 'Choose your display name'
export const ONBOARDING_LABEL = 'Display name'
export const ONBOARDING_PLACEHOLDER = 'Your name'
export const ONBOARDING_HINT = 'This is visible to everyone nearby.'
export const ONBOARDING_BUTTON = 'Continue'
export const ONBOARDING_BUTTON_SAVING = 'Saving…'

// ─── Profile ────────────────────────────────────────────────
export const PROFILE_LOAD_ERROR = 'Could not load profile.'
export const PROFILE_SAVE_ERROR = 'Failed to save profile.'
export const PROFILE_SAVED_TITLE = 'Saved'
export const PROFILE_SAVED_MESSAGE = 'Profile updated'
export const SIGNOUT_TITLE = 'Sign Out'
export const SIGNOUT_MESSAGE = 'This will sign you out of your account.'
export const SIGNOUT_CANCEL = 'Cancel'
export const SIGNOUT_CONFIRM = 'Sign Out'

// ─── Push Notifications ──────────────────────────────────────
export const NOTIFICATIONS = {
  PROMOTION_BODY_FALLBACK: (roomName: string) => `New promotion at ${roomName}!`,
} as const
