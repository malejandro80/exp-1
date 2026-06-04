import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
} from 'react-native'
import MapView, { Marker, Circle } from 'react-native-maps'
import { Colors } from '@/constants/theme'
import { MAP_LATITUDE_DELTA, MAP_LONGITUDE_DELTA } from '@/constants/layout'
import { useCreateRoom } from '@/hooks/useCreateRoom'
import {
  ROOM_CREATE_BUTTON,
  ROOM_CREATE_BUTTON_SAVING,
  ROOM_CREATE_NAME_PLACEHOLDER,
  ROOM_CREATE_DESC_PLACEHOLDER,
  ROOM_RADIUS_LABEL,
  ROOM_WAITING_LOCATION,
} from '@/constants/labels'
import { styles } from './create-room.styles'

const RADIUS_PRESETS = [50, 100, 200, 500]

const CreateRoom = () => {
  const {
    name, setName,
    description, setDescription,
    pinLat, setPinLat,
    pinLng, setPinLng,
    radius, setRadius,
    saving,
    latitude, longitude,
    handleCreate,
  } = useCreateRoom()

  if (!latitude || !longitude) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.hint}>{ROOM_WAITING_LOCATION}</Text>
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
          placeholder={ROOM_CREATE_NAME_PLACEHOLDER}
          placeholderTextColor={Colors.light.textMuted}
          maxLength={50}
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder={ROOM_CREATE_DESC_PLACEHOLDER}
          placeholderTextColor={Colors.light.textMuted}
          maxLength={200}
        />

        <Text style={styles.label}>{ROOM_RADIUS_LABEL(radius)}</Text>
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
          <Text style={styles.createButtonText}>{saving ? ROOM_CREATE_BUTTON_SAVING : ROOM_CREATE_BUTTON}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default CreateRoom
