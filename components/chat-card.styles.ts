import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'
import { AVATAR_SIZE, AVATAR_TEXT_SIZE } from '@/constants/layout'

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.03)',
  },
  cardPending: {
    borderColor: Colors.light.brandMuted,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPending: {
    backgroundColor: Colors.light.warning,
  },
  avatarDefault: {
    backgroundColor: Colors.light.brand,
  },
  avatarText: {
    color: '#fff',
    fontSize: AVATAR_TEXT_SIZE,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  pendingBadge: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  awaitingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  declineButton: {
    backgroundColor: Colors.light.controlBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  acceptButton: {
    backgroundColor: Colors.light.brand,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
})
