const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export function geohashEncode(lat: number, lng: number, precision = 6): string {
  let minLat = -90, maxLat = 90
  let minLng = -180, maxLng = 180
  let hash = ''
  let even = true
  let bit = 0
  let ch = 0

  while (hash.length < precision) {
    if (even) {
      const mid = (minLng + maxLng) / 2
      if (lng > mid) { ch |= 1 << (4 - bit); minLng = mid }
      else { maxLng = mid }
    } else {
      const mid = (minLat + maxLat) / 2
      if (lat > mid) { ch |= 1 << (4 - bit); minLat = mid }
      else { maxLat = mid }
    }
    even = !even
    if (bit < 4) { bit++ }
    else { hash += BASE32[ch]; bit = 0; ch = 0 }
  }

  return hash
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function metersToHuman(meters: number): string {
  if (meters < 10) return 'a few meters'
  if (meters < 100) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
