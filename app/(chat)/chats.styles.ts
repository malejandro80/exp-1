import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'
import { AVATAR_SIZE, AVATAR_TEXT_SIZE } from '@/constants/layout'

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  list: { padding: Spacing.lg },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginTop: Spacing.md },
  emptySubtitle: { fontSize: 14, color: Colors.light.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.03)',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: AVATAR_TEXT_SIZE, fontWeight: '700' },
  chatInfo: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  chatName: { fontSize: 16, fontWeight: '600', color: Colors.light.text },
  lastMessage: { fontSize: 13, color: Colors.light.textTertiary, marginTop: 2 },
  timeAgo: { fontSize: 12, color: Colors.light.textMuted },
})