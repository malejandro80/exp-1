import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useIdentity } from '@/contexts/IdentityContext'
import { Colors, Spacing, Radius } from '@/constants/theme'
import { DISPLAY_NAME_MAX_LENGTH } from '@/constants/rules'

const OnboardingScreen = () => {
  const { setDisplayName } = useIdentity()
  const [name, setName] = useState('')

  const handleContinue = async () => {
    if (name.trim()) {
      await setDisplayName(name.trim())
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nearby</Text>
          <Text style={styles.subtitle}>Connect with people around you</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Choose your display name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.light.textMuted}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoFocus
            autoCorrect={false}
          />
          <Text style={styles.hint}>This is visible to everyone nearby. No account needed.</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your location is only shared while the app is open.{'\n'}
          You can block or report users at any time.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing.xxl + Spacing.lg },
  title: { fontSize: 42, fontWeight: '800', color: Colors.light.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  form: { marginBottom: Spacing.xxl },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.light.controlBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg + 2,
    paddingVertical: Spacing.lg,
    fontSize: 18,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.06)',
  },
  hint: { fontSize: 12, color: Colors.light.textTertiary, marginTop: Spacing.sm, lineHeight: 18 },
  button: {
    backgroundColor: Colors.light.brand,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: Spacing.xl,
  },
})