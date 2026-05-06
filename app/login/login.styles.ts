import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl * 2,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.controlBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
    minWidth: 260,
  },
  googleButtonDisabled: {
    opacity: 0.4,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.destructive,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  loader: {
    marginTop: Spacing.xl,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
})
