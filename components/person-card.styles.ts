import { StyleSheet } from 'react-native'
import { Colors, Radius } from '@/constants/theme'
import { AVATAR_SIZE, AVATAR_TEXT_SIZE } from '@/constants/layout'

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    marginBottom: 8,
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
  avatarText: {
    color: '#fff',
    fontSize: AVATAR_TEXT_SIZE,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  detail: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
})
