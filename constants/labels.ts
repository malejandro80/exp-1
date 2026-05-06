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

// ─── Admin ───────────────────────────────────────────────────
export const ROOM_ERROR_NO_ROOM = 'You need a room first.'
export const ROOM_CREATED_TITLE = 'Room created!'
export const ROOM_CREATED_MESSAGE = (name: string) => `${name} is now live.`
export const ROOM_CREATE_ERROR = 'Could not create room. Try a different name.'
export const ROOM_CREATE_BUTTON = 'Create room'
export const ROOM_CREATE_BUTTON_SAVING = 'Creating...'
export const ROOM_CREATE_NAME_PLACEHOLDER = 'Room name (e.g., Café Central)'
export const ROOM_CREATE_DESC_PLACEHOLDER = 'Description (optional)'
export const ROOM_RADIUS_LABEL = (radius: number) => `Radius: ${radius}m`
export const ROOM_WAITING_LOCATION = 'Waiting for your location...'
export const ROOM_NOT_FOUND_TITLE = 'No room found'
export const ROOM_CREATE_YOUR_ROOM = 'Create your room'

export const PROMOTION_EMPTY_TITLE = 'No active promotions'
export const PROMOTION_CREATE_YOURS = 'Create promotion'
export const PROMOTION_SENT_TITLE = 'Promotion sent!'
export const PROMOTION_SENT_MESSAGE = (title: string, duration: number) =>
  `"${title}" is now live for ${duration} minutes.`
export const PROMOTION_CREATE_ERROR = 'Could not create promotion.'
export const PROMOTION_TITLE_PLACEHOLDER = 'Promotion title (e.g., 2x1 in beers)'
export const PROMOTION_DESC_PLACEHOLDER = 'Description (optional)'
export const PROMOTION_DURATION_LABEL = 'Duration'
export const PROMOTION_DURATION_MIN = (d: number) => `${d} min`
export const PROMOTION_DURATION_HOUR = (d: number) => `${d / 60}h`
export const PROMOTION_SEND_BUTTON = 'Send promotion'
export const PROMOTION_SEND_BUTTON_SAVING = 'Sending...'
export const PROMOTION_TIME_REMAINING = (mins: number) =>
  mins < 60 ? `${mins}m remaining` : `${Math.floor(mins / 60)}h ${mins % 60}m remaining`
export const PROMOTION_EXPIRED_LABEL = 'Expired'
export const PROMOTION_NOT_FOUND = 'Promotion not found'

export const ADMIN_MANAGE_ROOM = 'Manage your room'
export const ADMIN_CREATE_ROOM = 'Create your room'
export const ADMIN_ACTIVE_PROMOS = (count: number) => `Active promotions (${count})`
export const ADMIN_EXPIRED_PROMOS = (count: number) => `Expired (${count})`
export const ADMIN_ROOM_RADIUS = (meters: number) => `${Math.round(meters)}m radius`

// ─── Profile ──────────────────────────────────────────────────
export const PROFILE_SAVING = 'Saving...'
export const PROFILE_SAVE = 'Save'
export const PROFILE_RESET = 'Reset Profile'
export const PROFILE_DISPOSABLE_HINT =
  'You are using a disposable profile.\nNo account or email required.'
export const PROFILE_DISPLAY_NAME = 'Display Name'

// ─── Push Notifications ──────────────────────────────────────
export const NOTIFICATIONS = {
  PROMOTION_BODY_FALLBACK: (roomName: string) => `New promotion at ${roomName}!`,
} as const
