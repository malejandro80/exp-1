import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.xl, alignItems: 'center' },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl + Spacing.sm,
  },
  avatarLargeText: { color: '#fff', fontSize: 34, fontWeight: '700' },
  field: { width: '100%', marginBottom: Spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: Spacing.sm },
  input: {
    width: '100%',
    backgroundColor: Colors.light.controlBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.06)',
  },
  saveButton: {
    width: '100%',
    backgroundColor: Colors.light.brand,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(41,37,36,0.06)',
    width: '100%',
    marginVertical: Spacing.xxl,
  },
  disposableHint: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  resetButton: { padding: Spacing.md },
  resetText: { color: Colors.light.destructive, fontSize: 16, fontWeight: '500' },
})
