import { StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  roomInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  roomName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  roomDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  roomMeta: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: Colors.light.textTertiary,
  },
  promoCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.controlBackground,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  promoDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  promoTimer: {
    fontSize: 13,
    color: Colors.light.brand,
    fontWeight: '600',
    marginTop: 8,
  },
  expiredSection: {
    padding: 20,
  },
  expiredCard: {
    opacity: 0.5,
  },
  expiredText: {
    color: Colors.light.textTertiary,
  },
  createButton: {
    backgroundColor: Colors.light.brand,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.brand,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
