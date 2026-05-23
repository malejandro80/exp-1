/** @format */

import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboarding } from './useOnboarding'
import { styles } from './onboarding.styles'
import { DISPLAY_NAME_MAX_LENGTH } from '@/constants/rules'
import {
  ONBOARDING_TITLE,
  ONBOARDING_SUBTITLE,
  ONBOARDING_LABEL,
  ONBOARDING_PLACEHOLDER,
  ONBOARDING_HINT,
  ONBOARDING_BUTTON,
  ONBOARDING_BUTTON_SAVING,
} from '@/constants/labels'

const OnboardingScreen = () => {
  const { name, saving, setName, handleContinue } = useOnboarding()

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{ONBOARDING_TITLE}</Text>
          <Text style={styles.subtitle}>{ONBOARDING_SUBTITLE}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{ONBOARDING_LABEL}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={ONBOARDING_PLACEHOLDER}
            placeholderTextColor="#D6D3D1"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoFocus
            autoCorrect={false}
          />
          <Text style={styles.hint}>{ONBOARDING_HINT}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!name.trim() || saving) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim() || saving}
        >
          <Text style={styles.buttonText}>{saving ? ONBOARDING_BUTTON_SAVING : ONBOARDING_BUTTON}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default OnboardingScreen
