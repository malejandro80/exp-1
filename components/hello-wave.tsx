import Animated from 'react-native-reanimated';
import { styles, waveAnimation } from './hello-wave.styles';

export const HelloWave = () => {
  return (
    <Animated.Text
      style={[styles.wave, waveAnimation]}>
      👋
    </Animated.Text>
  );
};
