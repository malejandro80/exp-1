import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'

export const styles = StyleSheet.create({
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
    borderColor: Colors.light.border,
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
})
