/** @format */

import { Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './login.styles'
import { useLogin } from './useLogin'
import {
  LOGIN_TITLE,
  LOGIN_SUBTITLE,
  LOGIN_BUTTON,
  LOGIN_BUTTON_LOADING,
  LOGIN_DISCLAIMER,
} from '@/constants/labels'

const LoginScreen = () => {
  const { loading, error, handleGoogleSignIn } = useLogin()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{LOGIN_TITLE}</Text>
      <Text style={styles.subtitle}>{LOGIN_SUBTITLE}</Text>

      <TouchableOpacity
        style={[styles.googleButton, loading && styles.googleButtonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>
          {loading ? LOGIN_BUTTON_LOADING : LOGIN_BUTTON}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.disclaimer}>{LOGIN_DISCLAIMER}</Text>
    </SafeAreaView>
  )
}

export default LoginScreen
