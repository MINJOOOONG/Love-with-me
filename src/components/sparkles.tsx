import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { colors } from '@/lib/theme';

// 배경에 떠다니는 반짝이·별·하트·구름
const BITS = [
  { g: '✦', x: '8%', y: '6%', s: 22, c: colors.butter },
  { g: '♡', x: '84%', y: '9%', s: 20, c: colors.pink },
  { g: '☁︎', x: '70%', y: '22%', s: 34, c: colors.sky },
  { g: '★', x: '14%', y: '30%', s: 14, c: colors.lilac },
  { g: '✧', x: '90%', y: '44%', s: 18, c: colors.mint },
  { g: '☁︎', x: '4%', y: '58%', s: 28, c: colors.lilacSoft },
  { g: '✦', x: '80%', y: '70%', s: 14, c: colors.pink },
  { g: '♡', x: '10%', y: '82%', s: 16, c: colors.lilac },
  { g: '★', x: '88%', y: '90%', s: 20, c: colors.butter },
  { g: '✧', x: '46%', y: '96%', s: 14, c: colors.sky },
] as const;

function Bit({ g, x, y, s, c, i }: (typeof BITS)[number] & { i: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(i * 350, withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [i, t]);
  const anim = useAnimatedStyle(() => ({
    opacity: 0.55 + t.value * 0.45,
    transform: [{ translateY: -t.value * 6 }, { rotate: `${(t.value - 0.5) * 16}deg` }],
  }));
  return <Animated.Text style={[{ position: 'absolute', left: x, top: y, fontSize: s, color: c }, anim]}>{g}</Animated.Text>;
}

export function Sparkles() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BITS.map((b, i) => <Bit key={i} {...b} i={i} />)}
    </View>
  );
}
