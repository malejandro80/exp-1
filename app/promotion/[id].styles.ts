import { StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.light.controlBackground,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
  },
  timerBadgeExpired: {
    backgroundColor: Colors.light.controlBackground,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.brand,
  },
  timerTextExpired: {
    color: Colors.light.textTertiary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textTertiary,
  },
})
