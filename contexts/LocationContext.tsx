import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import * as Location from 'expo-location'
import { api } from '@/services'
import { useIdentity } from './IdentityContext'
import {
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_WATCH_DISTANCE_INTERVAL,
  LOCATION_WATCH_TIME_INTERVAL,
} from '@/constants/rules'

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

const UPDATE_INTERVAL = LOCATION_UPDATE_INTERVAL_MS

export const LocationProvider = ({ children }: { children: ReactNode }) => {
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

    const start = async () => {
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
          distanceInterval: LOCATION_WATCH_DISTANCE_INTERVAL,
          timeInterval: LOCATION_WATCH_TIME_INTERVAL,
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

  const updateProfileLocation = async (id: string, lat: number, lng: number) => {
    await api.profiles.updateLocation(id, lat, lng)
  }

  return (
    <LocationContext.Provider value={{ latitude, longitude, heading, permissionGranted, gpsReady, error }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
