import { StyleSheet } from 'react-native'
import { Colors, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
})
