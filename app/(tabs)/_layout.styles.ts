/** @format */

import { Platform } from 'react-native'

export const tabBarStyle = {
  backgroundColor: '#FAFAF9',
  borderTopWidth: 1,
  borderTopColor: 'rgba(41,37,36,0.06)',
  height: Platform.OS === 'ios' ? 72 : 60,
  paddingTop: 8,
  paddingBottom: Platform.OS === 'ios' ? 16 : 8
} as const
