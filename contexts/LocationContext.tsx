import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import { useIdentity } from './IdentityContext'

interface LocationState {
  latitude: number | null
  longitude: number | null
  permissionGranted: boolean
  error: string | null
}

const LocationContext = createContext<LocationState>({
  latitude: null,
  longitude: null,
  permissionGranted: false,
  error: null,
})

const UPDATE_INTERVAL = 30000

export function LocationProvider({ children }: { children: ReactNode }) {
  const { userId, isOnboarded } = useIdentity()
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastUpdateRef = useRef(0)

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

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setLatitude(pos.coords.latitude)
      setLongitude(pos.coords.longitude)
      updateProfileLocation(id!, pos.coords.latitude, pos.coords.longitude)

      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: UPDATE_INTERVAL },
        (loc) => {
          setLatitude(loc.coords.latitude)
          setLongitude(loc.coords.longitude)
          const now = Date.now()
          if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
            lastUpdateRef.current = now
            updateProfileLocation(id!, loc.coords.latitude, loc.coords.longitude)
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
    <LocationContext.Provider value={{ latitude, longitude, permissionGranted, error }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
