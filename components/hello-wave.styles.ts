import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  wave: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
})

export const waveAnimation = {
  animationIterationCount: 4 as const,
  animationDuration: '300ms',
} as const
