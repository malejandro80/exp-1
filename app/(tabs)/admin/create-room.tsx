import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native'
import MapView, { Marker, Circle } from 'react-native-maps'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { MAP_LATITUDE_DELTA, MAP_LONGITUDE_DELTA } from '@/constants/layout'
import { useIdentity } from '@/contexts/IdentityContext'
import { useLocation } from '@/contexts/LocationContext'
import { api } from '@/services'
import { styles } from './create-room.styles'

const RADIUS_PRESETS = [50, 100, 200, 500]

const CreateRoom = () => {
  const { userId } = useIdentity()
  const { latitude, longitude } = useLocation()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pinLat, setPinLat] = useState(latitude || 40.4168)
  const [pinLng, setPinLng] = useState(longitude || -3.7038)
  const [radius, setRadius] = useState(100)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim() || !userId) return
    setSaving(true)
    const room = await api.rooms.create({
      name: name.trim(),
      description: description.trim(),
      latitude: pinLat,
      longitude: pinLng,
      radius_meters: radius,
      admin_id: userId,
    })
    setSaving(false)
    if (room) {
      Alert.alert('Room created!', `${name.trim()} is now live.`)
      router.replace('/(tabs)/admin/manage-room')
    } else {
      Alert.alert('Error', 'Could not create room. Try a different name.')
    }
  }

  if (!latitude || !longitude) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.hint}>Waiting for your location...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pinLat,
            longitude: pinLng,
            latitudeDelta: MAP_LATITUDE_DELTA,
            longitudeDelta: MAP_LONGITUDE_DELTA,
          }}
          onPress={(e) => {
            setPinLat(e.nativeEvent.coordinate.latitude)
            setPinLng(e.nativeEvent.coordinate.longitude)
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{ latitude: pinLat, longitude: pinLng }}
            draggable
            onDragEnd={(e) => {
              setPinLat(e.nativeEvent.coordinate.latitude)
              setPinLng(e.nativeEvent.coordinate.longitude)
            }}
            pinColor={Colors.light.brand}
          />
          <Circle
            center={{ latitude: pinLat, longitude: pinLng }}
            radius={radius}
            fillColor={Colors.light.roomRadiusFill}
            strokeColor={Colors.light.roomRadiusStroke}
            strokeWidth={2}
          />
        </MapView>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Room name (e.g., Café Central)"
          placeholderTextColor={Colors.light.textMuted}
          maxLength={50}
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          placeholderTextColor={Colors.light.textMuted}
          maxLength={200}
        />

        <Text style={styles.label}>Radius: {radius}m</Text>
        <View style={styles.radiusRow}>
          {RADIUS_PRESETS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
                {r}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createButton, (!name.trim() || saving) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim() || saving}
        >
          <Text style={styles.createButtonText}>{saving ? 'Creating...' : 'Create room'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default CreateRoom
