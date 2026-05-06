import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#292524',
    textSecondary: '#78716C',
    textTertiary: '#A8A29E',
    textMuted: '#D6D3D1',

    background: '#FAFAF9',
    surface: '#F5F4F2',
    surfaceElevated: '#EDEAE7',

    controlBackground: '#E7E4E2',

    brand: '#D97706',
    brandMuted: '#FDE68A',

    destructive: '#DC2626',
    warning: '#F59E0B',
    success: '#16A34A',

    border: 'rgba(41,37,36,0.06)',
    borderSubtle: 'rgba(41,37,36,0.03)',
    borderStrong: 'rgba(41,37,36,0.12)',
    borderFocus: 'rgba(217,119,6,0.5)',

    tabIconDefault: '#A8A29E',
    tabIconSelected: '#D97706',
    tint: '#D97706',
    icon: '#78716C',

    roomRadiusFill: 'rgba(217,119,6,0.06)',
    roomRadiusStroke: 'rgba(217,119,6,0.25)',

    myMessageBg: '#D97706',
    theirMessageBg: '#EEEAE6',
  },
  dark: {
    text: '#F5F5F4',
    textSecondary: '#A8A29E',
    textTertiary: '#78716C',
    textMuted: '#57534E',

    background: '#1C1917',
    surface: '#292524',
    surfaceElevated: '#34312E',

    controlBackground: '#34312E',

    brand: '#F59E0B',
    brandMuted: '#78350F',

    destructive: '#EF4444',
    warning: '#D97706',
    success: '#22C55E',

    border: 'rgba(245,245,244,0.06)',
    borderSubtle: 'rgba(245,245,244,0.03)',
    borderStrong: 'rgba(245,245,244,0.12)',
    borderFocus: 'rgba(245,158,11,0.5)',

    tabIconDefault: '#78716C',
    tabIconSelected: '#F59E0B',
    tint: '#F59E0B',
    icon: '#A8A29E',

    roomRadiusFill: 'rgba(245,158,11,0.08)',
    roomRadiusStroke: 'rgba(245,158,11,0.3)',

    myMessageBg: '#D97706',
    theirMessageBg: '#34312E',
  },
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
}
