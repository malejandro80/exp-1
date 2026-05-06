/** @format */

import { Platform } from 'react-native'
import {
  TAB_BAR_BG,
  TAB_BAR_BORDER_COLOR,
  TAB_BAR_HEIGHT_IOS,
  TAB_BAR_HEIGHT_ANDROID,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_PADDING_BOTTOM_IOS,
  TAB_BAR_PADDING_BOTTOM_ANDROID,
} from '@/constants/layout'

export const tabBarStyle = {
  backgroundColor: TAB_BAR_BG,
  borderTopWidth: 1,
  borderTopColor: TAB_BAR_BORDER_COLOR,
  height: Platform.OS === 'ios' ? TAB_BAR_HEIGHT_IOS : TAB_BAR_HEIGHT_ANDROID,
  paddingTop: TAB_BAR_PADDING_TOP,
  paddingBottom: Platform.OS === 'ios' ? TAB_BAR_PADDING_BOTTOM_IOS : TAB_BAR_PADDING_BOTTOM_ANDROID,
} as const
