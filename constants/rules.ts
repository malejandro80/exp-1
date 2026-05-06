// ─── Geohash ───────────────────────────────────────────────
export const GEOHASH_DEFAULT_PRECISION = 6
export const LATITUDE_MIN = -90
export const LATITUDE_MAX = 90
export const LONGITUDE_MIN = -180
export const LONGITUDE_MAX = 180
export const BITS_PER_CHAR = 5
export const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

// ─── Location & Distance ──────────────────────────────────
export const EARTH_RADIUS_METERS = 6_371_000
export const LOCATION_UPDATE_INTERVAL_MS = 30_000
export const LOCATION_WATCH_DISTANCE_INTERVAL = 3  // meters
export const LOCATION_WATCH_TIME_INTERVAL = 5_000   // ms

// ─── Search & Staleness ───────────────────────────────────
export const STALE_PROFILE_MINUTES = 5
export const SEARCH_RADIUS_METERS = 5_000

// ─── Display thresholds ───────────────────────────────────
export const CLOSE_DISTANCE_METERS = 10
export const MEDIUM_DISTANCE_METERS = 100

// ─── Time thresholds ──────────────────────────────────────
export const MS_PER_MINUTE = 60_000
export const MINUTES_PER_HOUR = 60
export const HOURS_PER_DAY = 24

// ─── Validation ───────────────────────────────────────────
export const MESSAGE_MAX_LENGTH = 500
export const DISPLAY_NAME_MAX_LENGTH = 30
