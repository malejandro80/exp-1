import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { DISPLAY_NAME_MAX_LENGTH } from '@/constants/rules'
import {
  PROFILE_SAVING,
  PROFILE_SAVE,
  PROFILE_RESET,
  PROFILE_DISPOSABLE_HINT,
  PROFILE_DISPLAY_NAME,
  ADMIN_MANAGE_ROOM,
  ADMIN_CREATE_ROOM,
  ONBOARDING_PLACEHOLDER,
} from '@/constants/labels'
import { styles } from './profile.styles'
import { useProfile } from './useProfile'

const ProfileScreen = () => {
  const { profile, nameInput, saving, error, role, adminRoom, router, setNameInput, upsertProfile, handleReset } = useProfile()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {(profile?.display_name || nameInput || '?')[0].toUpperCase()}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{PROFILE_DISPLAY_NAME}</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder={ONBOARDING_PLACEHOLDER}
            placeholderTextColor={Colors.light.textMuted}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={upsertProfile}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? PROFILE_SAVING : PROFILE_SAVE}</Text>
        </TouchableOpacity>

        {error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Ionicons name="alert-circle" size={16} color={Colors.light.destructive} />
            <Text style={{ marginLeft: 6, fontSize: 13, color: Colors.light.destructive }}>{error}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.disposableHint}>{PROFILE_DISPOSABLE_HINT}</Text>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>{PROFILE_RESET}</Text>
        </TouchableOpacity>

        {role === 'admin' && (
          <>
            <View style={styles.divider} />
            {adminRoom ? (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push('/(tabs)/admin/manage-room')}
              >
                <Ionicons name="storefront-outline" size={20} color={Colors.light.brand} />
                <Text style={styles.adminButtonText}>{ADMIN_MANAGE_ROOM}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push('/(tabs)/admin/create-room')}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.light.brand} />
                <Text style={styles.adminButtonText}>{ADMIN_CREATE_ROOM}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

export default ProfileScreen
