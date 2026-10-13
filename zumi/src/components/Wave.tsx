import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { color } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

function wavePath(
  width: number,
  height: number,
  k: number,
  shift: number,
  ampMul: number,
  phase: number,
  level: number,
  calm: number,
) {
  'worklet';
  const mid = height / 2;
  const amp = (height / 2 - 4) * Math.min(1, calm + level * 0.9) * ampMul;
  const steps = 48;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * width;
    // envelope: quiet at the edges, loud in the middle — like a voice blob
    const env = Math.pow(Math.sin(Math.PI * t), 1.6);
    const y =
      mid +
      Math.sin(t * Math.PI * k + phase + shift) * amp * env +
      Math.sin(t * Math.PI * k * 2.3 - phase * 2) * amp * 0.25 * env;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

/**
 * Zumi's signature: a lilac → mint voice wave. Idle it breathes gently,
 * while recording its amplitude follows the microphone level (0..1).
 */
export function Wave({
  width,
  height,
  level,
  speed = 1,
  calm = 0.35,
}: {
  width: number;
  height: number;
  level?: SharedValue<number>;
  speed?: number;
  /** base amplitude when silent, 0..1 */
  calm?: number;
}) {
  const phase = useSharedValue(0);
  const fallback = useSharedValue(0);
  const lvl = level ?? fallback;

  useEffect(() => {
    phase.value = 0;
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 5200 / speed, easing: Easing.linear }), -1);
  }, [phase, speed]);

  const p1 = useAnimatedProps(() => ({ d: wavePath(width, height, 3, 0, 1, phase.value, lvl.value, calm) }));
  const p2 = useAnimatedProps(() => ({ d: wavePath(width, height, 2.4, 1.6, 0.75, phase.value, lvl.value, calm) }));
  const p3 = useAnimatedProps(() => ({ d: wavePath(width, height, 4, 3.1, 0.5, phase.value, lvl.value, calm) }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="wv" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color.ultra} stopOpacity={0.15} />
            <Stop offset="0.35" stopColor={color.ultra} stopOpacity={1} />
            <Stop offset="0.7" stopColor={color.volt} stopOpacity={1} />
            <Stop offset="1" stopColor={color.volt} stopOpacity={0.15} />
          </LinearGradient>
          <LinearGradient id="wvFill" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0.2" stopColor={color.ultra} stopOpacity={0.35} />
            <Stop offset="0.8" stopColor={color.volt} stopOpacity={0.3} />
          </LinearGradient>
        </Defs>
        <AnimatedPath animatedProps={p3} stroke="url(#wv)" strokeWidth={1.5} fill="none" opacity={0.5} />
        <AnimatedPath animatedProps={p2} stroke="url(#wv)" strokeWidth={2} fill="url(#wvFill)" opacity={0.7} />
        <AnimatedPath animatedProps={p1} stroke="url(#wv)" strokeWidth={3} fill="url(#wvFill)" />
      </Svg>
    </View>
  );
}
