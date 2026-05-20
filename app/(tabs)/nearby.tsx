import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native'
import MapView, { Marker, Callout, Circle } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { metersToHuman, haversineDistance } from '@/lib/helpers'
import { PersonCard } from '@/components/person-card'
import { styles } from './nearby.styles'
import { useNearby } from './useNearby'

const ITEM_HEIGHT = 76

export default function NearbyScreen() {
  const {
    latitude,
    longitude,
    currentRoom,
    nearbyRooms,
    roomLoading,
    isJoined,
    leaveRoom,
    people,
    loading,
    refreshing,
    error,
    selectedRoom,
    setSelectedRoom,
    fetchPeopleInRoom,
    setRefreshing,
    handleTapPerson,
    handleJoinRoom,
  } = useNearby()

  if (loading || roomLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
        <Text style={styles.loadingText}>Finding your room...</Text>
      </View>
    )
  }

  if (!currentRoom) {
    return (
      <View style={styles.container}>
        {latitude && longitude && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {nearbyRooms.map(room => {
              const dist = haversineDistance(latitude, longitude, room.latitude, room.longitude)
              return (
                <View key={room.id}>
                  <Marker
                    coordinate={{ latitude: room.latitude, longitude: room.longitude }}
                    onPress={() => setSelectedRoom(room)}
                    pinColor={selectedRoom?.id === room.id ? Colors.light.brand : '#ff6b6b'}
                  >
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>{room.name}</Text>
                        <Text style={styles.calloutMeta}>{metersToHuman(dist)} away</Text>
                        <Text style={styles.calloutMeta}>{Math.round(room.radius_meters)}m radius</Text>
                      </View>
                    </Callout>
                  </Marker>
                  <Circle
                    center={{ latitude: room.latitude, longitude: room.longitude }}
                    radius={room.radius_meters}
                    fillColor={Colors.light.roomRadiusFill}
                    strokeColor={Colors.light.roomRadiusStroke}
                    strokeWidth={2}
                  />
                </View>
              )
            })}
          </MapView>
        )}

        {selectedRoom && (
          <View style={styles.selectedRoomPanel}>
            <Text style={styles.selectedRoomName}>{selectedRoom.name}</Text>
            {selectedRoom.description && (
              <Text style={styles.selectedRoomDesc}>{selectedRoom.description}</Text>
            )}
            <Text style={styles.selectedRoomDist}>
              {metersToHuman(haversineDistance(latitude!, longitude!, selectedRoom.latitude, selectedRoom.longitude))} away
            </Text>
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinRoom}>
              <Text style={styles.joinButtonText}>Join this room</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayTitle}>Rooms near you</Text>
          <Text style={styles.mapOverlaySub}>
            Tap a room to see details, then join to see who&apos;s there.
          </Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.roomHeader}>
          <View style={styles.roomHeaderLeft}>
            <Text style={styles.roomTitle}>{currentRoom.name}</Text>
          </View>
          <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
            <Text style={styles.leaveButtonText}>{isJoined ? 'Leave' : 'Back to map'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={styles.joinButton} onPress={fetchPeopleInRoom}>
            <Text style={styles.joinButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.roomHeader}>
        <View style={styles.roomHeaderLeft}>
          <Text style={styles.roomTitle}>{currentRoom.name}</Text>
          {currentRoom.description && (
            <Text style={styles.roomDescription}>{currentRoom.description}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
          <Text style={styles.leaveButtonText}>{isJoined ? 'Leave' : 'Back to map'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={people}
        keyExtractor={item => item.id}
        contentContainerStyle={people.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchPeopleInRoom() }}
            tintColor={Colors.light.brand}
          />
        }
        getItemLayout={(_data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={12}
        windowSize={5}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="person-outline" size={48} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No one in this room</Text>
            <Text style={styles.emptySubtitle}>
              Be the first! Share the room with friends.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PersonCard person={item} onPress={handleTapPerson} />
        )}
      />
    </View>
  )
}
