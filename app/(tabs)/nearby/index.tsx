import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import MapView, { Marker, Callout, Circle } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { metersToHuman, haversineDistance } from '@/utils/helpers'
import { MESSAGE_MAX_LENGTH } from '@/constants/rules'
import {
  ITEM_HEIGHT,
  MAP_LATITUDE_DELTA,
  MAP_LONGITUDE_DELTA,
  MODAL_BORDER_RADIUS,
  MODAL_PADDING,
  MODAL_MAX_WIDTH,
} from '@/constants/layout'
import { PersonCard } from '@/components/person-card'
import { styles } from './nearby.styles'
import { useNearby } from './useNearby'

const NearbyScreen = () => {
  const {
    latitude,
    longitude,
    gpsReady,
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
    requestTarget,
    requestMessage,
    setRequestMessage,
    sending,
    handleSendRequest,
    handleCancelRequest,
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
        {gpsReady && latitude && longitude ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: MAP_LATITUDE_DELTA,
              longitudeDelta: MAP_LONGITUDE_DELTA,
            }}
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
            rotateEnabled={false}
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
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.light.brand} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
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

      <Modal visible={!!requestTarget} transparent animationType="fade" onRequestClose={handleCancelRequest}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{
            backgroundColor: Colors.light.background,
            borderRadius: MODAL_BORDER_RADIUS,
            padding: MODAL_PADDING,
            width: '85%',
            maxWidth: MODAL_MAX_WIDTH,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
              Message {requestTarget?.display_name || 'user'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.light.textTertiary, marginBottom: 16 }}>
              They&apos;ll need to accept before you can chat freely.
            </Text>
            <TextInput
              style={{
                backgroundColor: Colors.light.controlBackground,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: Colors.light.text,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              value={requestMessage}
              onChangeText={setRequestMessage}
              placeholder="Write your message..."
              placeholderTextColor={Colors.light.textMuted}
              multiline
              maxLength={MESSAGE_MAX_LENGTH}
              autoFocus
            />
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.light.controlBackground }}
                onPress={handleCancelRequest}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.light.brand, opacity: (!requestMessage.trim() || sending) ? 0.4 : 1 }}
                onPress={handleSendRequest}
                disabled={!requestMessage.trim() || sending}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{sending ? 'Sending...' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

export default NearbyScreen
