import {
  BASE32,
  LATITUDE_MIN,
  LATITUDE_MAX,
  LONGITUDE_MIN,
  LONGITUDE_MAX,
  BITS_PER_CHAR,
  EARTH_RADIUS_METERS,
  CLOSE_DISTANCE_METERS,
  MEDIUM_DISTANCE_METERS,
  MS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
} from '@/constants/rules'

const toRad = (deg: number): number => (deg * Math.PI) / 180

export const geohashEncode = (lat: number, lng: number, precision = 6): string => {
  let minLat = LATITUDE_MIN, maxLat = LATITUDE_MAX
  let minLng = LONGITUDE_MIN, maxLng = LONGITUDE_MAX
  let hash = ''
  let even = true
  let bit = 0
  let ch = 0

  while (hash.length < precision) {
    if (even) {
      const mid = (minLng + maxLng) / 2
      if (lng > mid) { ch |= 1 << (BITS_PER_CHAR - 1 - bit); minLng = mid }
      else { maxLng = mid }
    } else {
      const mid = (minLat + maxLat) / 2
      if (lat > mid) { ch |= 1 << (BITS_PER_CHAR - 1 - bit); minLat = mid }
      else { maxLat = mid }
    }
    even = !even
    if (bit < BITS_PER_CHAR - 1) { bit++ }
    else { hash += BASE32[ch]; bit = 0; ch = 0 }
  }

  return hash
}

export const haversineDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const metersToHuman = (meters: number): string => {
  if (meters < CLOSE_DISTANCE_METERS) return 'a few meters'
  if (meters < MEDIUM_DISTANCE_METERS) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export const timeAgo = (dateStr: string): string => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / MS_PER_MINUTE)
  if (mins < 1) return 'just now'
  if (mins < MINUTES_PER_HOUR) return `${mins}m ago`
  const hours = Math.floor(mins / MINUTES_PER_HOUR)
  if (hours < HOURS_PER_DAY) return `${hours}h ago`
  return `${Math.floor(hours / HOURS_PER_DAY)}d ago`
}
