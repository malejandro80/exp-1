import { geohashEncode, haversineDistance, metersToHuman, timeAgo } from '@/lib/helpers'

describe('geohashEncode', () => {
  it('encodes a known location correctly', () => {
    // London: lat=51.5074, lng=-0.1278
    const hash = geohashEncode(51.5074, -0.1278, 6)
    expect(hash).toMatch(/^[0123456789bcdefghjkmnpqrstuvwxyz]{6}$/)
  })

  it('encodes the same location consistently', () => {
    const hash1 = geohashEncode(40.7128, -74.006, 6)
    const hash2 = geohashEncode(40.7128, -74.006, 6)
    expect(hash1).toBe(hash2)
  })

  it('encodes nearby locations with the same prefix', () => {
    const a = geohashEncode(40.7128, -74.006, 5)
    const b = geohashEncode(40.7130, -74.0055, 5)
    expect(a).toBe(b)
  })

  it('returns correct length for custom precision', () => {
    for (const p of [1, 3, 5, 8, 12]) {
      expect(geohashEncode(0, 0, p).length).toBe(p)
    }
  })
})

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(40.7128, -74.006, 40.7128, -74.006)).toBe(0)
  })

  it('calculates ~100m for 0.001 degree lat difference near equator', () => {
    const dist = haversineDistance(0, 0, 0.001, 0)
    expect(dist).toBeGreaterThan(100)
    expect(dist).toBeLessThan(120)
  })

  it('calculates distance between London and Paris (~344km)', () => {
    const london = { lat: 51.5074, lng: -0.1278 }
    const paris = { lat: 48.8566, lng: 2.3522 }
    const dist = haversineDistance(london.lat, london.lng, paris.lat, paris.lng)
    expect(dist / 1000).toBeGreaterThan(300)
    expect(dist / 1000).toBeLessThan(400)
  })

  it('is symmetric', () => {
    const d1 = haversineDistance(10, 20, 30, 40)
    const d2 = haversineDistance(30, 40, 10, 20)
    expect(d1).toBeCloseTo(d2, 5)
  })
})

describe('metersToHuman', () => {
  it('returns "a few meters" for distances under 10m', () => {
    expect(metersToHuman(0)).toBe('a few meters')
    expect(metersToHuman(5)).toBe('a few meters')
    expect(metersToHuman(9)).toBe('a few meters')
  })

  it('rounds to nearest 10 for distances under 100m', () => {
    expect(metersToHuman(23)).toBe('20m')
    expect(metersToHuman(47)).toBe('50m')
    expect(metersToHuman(99)).toBe('100m')
  })

  it('returns km for distances >= 100m', () => {
    expect(metersToHuman(100)).toBe('0.1km')
    expect(metersToHuman(1500)).toBe('1.5km')
    expect(metersToHuman(10000)).toBe('10.0km')
  })
})

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-19T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns "just now" for less than 1 minute ago', () => {
    expect(timeAgo(new Date('2026-05-19T11:59:45Z').toISOString())).toBe('just now')
  })

  it('returns "Xm ago" for minutes', () => {
    expect(timeAgo(new Date('2026-05-19T11:50:00Z').toISOString())).toBe('10m ago')
    expect(timeAgo(new Date('2026-05-19T11:01:00Z').toISOString())).toBe('59m ago')
  })

  it('returns "Xh ago" for hours', () => {
    expect(timeAgo(new Date('2026-05-19T09:00:00Z').toISOString())).toBe('3h ago')
    expect(timeAgo(new Date('2026-05-19T00:00:00Z').toISOString())).toBe('12h ago')
  })

  it('returns "Xd ago" for days', () => {
    expect(timeAgo(new Date('2026-05-17T12:00:00Z').toISOString())).toBe('2d ago')
    expect(timeAgo(new Date('2026-05-14T12:00:00Z').toISOString())).toBe('5d ago')
  })
})
