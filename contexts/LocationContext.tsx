import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import { useIdentity } from './IdentityContext'

interface LocationState {
  latitude: number | null
  longitude: number | null
  heading: number | null
  permissionGranted: boolean
  gpsReady: boolean
  error: string | null
}

const LocationContext = createContext<LocationState>({
  latitude: null,
  longitude: null,
  heading: null,
  permissionGranted: false,
  gpsReady: false,
  error: null,
})

const UPDATE_INTERVAL = 30000

export function LocationProvider({ children }: { children: ReactNode }) {
  const { userId, isOnboarded } = useIdentity()
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [gpsReady, setGpsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastUpdateRef = useRef(0)
  const gpsReadyRef = useRef(false)

  useEffect(() => {
    const id = userId
    if (!isOnboarded || !id) return

    let watcher: Location.LocationSubscription | null = null

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied')
        return
      }
      setPermissionGranted(true)

      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        gpsReadyRef.current = true
        setGpsReady(true)
      } catch (e) {
        console.warn('getCurrentPositionAsync failed, waiting for watchPositionAsync', e)
      }

      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 3,
          timeInterval: 5000,
          mayShowUserSettingsDialog: true,
        },
        (loc) => {
          const lat = loc.coords.latitude
          const lng = loc.coords.longitude
          setLatitude(lat)
          setLongitude(lng)
          if (loc.coords.heading != null) {
            setHeading(loc.coords.heading)
          }
          if (!gpsReadyRef.current) {
            gpsReadyRef.current = true
            setGpsReady(true)
          }
          const now = Date.now()
          if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
            lastUpdateRef.current = now
            updateProfileLocation(id!, lat, lng)
          }
        }
      )
    }

    start()

    return () => {
      if (watcher) watcher.remove()
    }
  }, [userId, isOnboarded])

  async function updateProfileLocation(id: string, lat: number, lng: number) {
    await supabase.from('profiles').update({
      latitude: lat,
      longitude: lng,
      last_seen: new Date().toISOString(),
    } as any).eq('id', id)
  }

  return (
    <LocationContext.Provider value={{ latitude, longitude, heading, permissionGranted, gpsReady, error }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
