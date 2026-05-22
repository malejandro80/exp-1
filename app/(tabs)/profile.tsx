import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { DISPLAY_NAME_MAX_LENGTH } from '@/constants/rules'
import { styles } from './profile.styles'
import { useProfile } from './useProfile'

const ProfileScreen = () => {
  const { profile, nameInput, saving, error, setNameInput, upsertProfile, handleReset } = useProfile()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {(profile?.display_name || nameInput || '?')[0].toUpperCase()}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Your name"
            placeholderTextColor={Colors.light.textMuted}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={upsertProfile}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        {error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Ionicons name="alert-circle" size={16} color={Colors.light.destructive} />
            <Text style={{ marginLeft: 6, fontSize: 13, color: Colors.light.destructive }}>{error}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.disposableHint}>
          You are using a disposable profile.{'\n'}
          No account or email required.
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ProfileScreen
