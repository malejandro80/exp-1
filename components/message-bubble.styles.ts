import { StyleSheet } from 'react-native'
import { Colors, Radius, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  bubbleMine: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.myMessageBg,
    alignSelf: 'flex-end',
    borderBottomRightRadius: Radius.sm,
    borderBottomLeftRadius: Radius.lg,
  },
  bubbleTheirs: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.theirMessageBg,
    alignSelf: 'flex-start',
    borderBottomRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.sm,
  },
  messageTextMine: {
    fontSize: 15,
    lineHeight: 20,
    color: '#fff',
  },
  messageTextTheirs: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.light.text,
  },
  timeMine: {
    fontSize: 11,
    marginTop: Spacing.xs,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  timeTheirs: {
    fontSize: 11,
    marginTop: Spacing.xs,
    color: Colors.light.textTertiary,
    textAlign: 'right',
  },
})
