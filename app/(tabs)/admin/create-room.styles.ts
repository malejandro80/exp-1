import { StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  form: {
    padding: 16,
    gap: 12,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  input: {
    backgroundColor: Colors.light.controlBackground,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.light.controlBackground,
  },
  radiusChipActive: {
    backgroundColor: Colors.light.brand,
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  radiusChipTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: Colors.light.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: Colors.light.textTertiary,
  },
})
