import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const bowl = require('@/assets/images/intro-bowl.png');

// 인트로 일러스트: 위에서 내려다본 크리스탈 딤섬 누들수프. 아주 천천히 돌아요.
export function Bowl({ size }: { size: number }) {
  const t = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
    t.value = withRepeat(withTiming(1, { duration: 90000, easing: Easing.linear }), -1, false);
  }, [fade, t]);
  const anim = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: 0.96 + fade.value * 0.04 }, { rotate: `${t.value * 360}deg` }],
  }));
  return <Animated.Image source={bowl} style={[{ width: size, height: size }, anim]} />;
}
