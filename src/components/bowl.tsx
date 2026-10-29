import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colors, sticker } from '@/lib/theme';

// 인트로 일러스트: 크리스탈 딤섬 누들수프
function Dimsum({ size, style, delay = 0 }: { size: number; style: object; delay?: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      y.value = withRepeat(withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const arm = size * 0.62;
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style, anim]}>
      {/* 네 갈래 피 */}
      {[0, 90].map(r => (
        <View key={r} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: `${r + 45}deg` }] }]}>
          <LinearGradient colors={['#b5e6e3', colors.mint, '#74c2bf']} style={{ width: arm * 0.34, height: size, borderRadius: size }} />
          <LinearGradient colors={['#b5e6e3', colors.mint, '#74c2bf']} style={{ position: 'absolute', width: size, height: arm * 0.34, borderRadius: size }} />
        </View>
      ))}
      {/* 꽃잎 */}
      {[0, 72, 144, 216, 288].map(r => (
        <View key={r} style={[StyleSheet.absoluteFill, { alignItems: 'center', transform: [{ rotate: `${r}deg` }] }]}>
          <LinearGradient colors={[colors.pinkSoft, colors.pink]} style={{ marginTop: size * 0.2, width: size * 0.2, height: size * 0.3, borderRadius: size * 0.12, opacity: 0.95 }} />
        </View>
      ))}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: size * 0.13, height: size * 0.13, borderRadius: size, backgroundColor: '#e6fbfa' }} />
      </View>
    </Animated.View>
  );
}

export function Bowl({ size }: { size: number }) {
  const soup = size * 0.66;
  return (
    <View style={{ width: size, height: size }}>
      <View style={[s.bowl, { width: size, height: size, borderRadius: size }]}>
        <View style={{ width: size * 0.84, height: size * 0.84, borderRadius: size, backgroundColor: '#f1efec', alignItems: 'center', justifyContent: 'center' }}>
          <LinearGradient colors={['#f3e4bb', colors.broth, '#dcc28a']} start={{ x: 0.3, y: 0.2 }} end={{ x: 0.8, y: 1 }}
            style={{ width: soup, height: soup, borderRadius: soup, overflow: 'hidden' }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <View key={i} style={{ position: 'absolute', left: soup * 0.12 + i * soup * 0.055, top: soup * 0.1, width: 2, height: soup * 0.8, backgroundColor: colors.noodle, opacity: 0.8, transform: [{ rotate: '10deg' }] }} />
            ))}
            <Dimsum size={soup * 0.6} style={{ left: soup * 0.02, top: soup * 0.32 }} />
            <Dimsum size={soup * 0.44} style={{ right: -soup * 0.04, top: -soup * 0.02 }} delay={1000} />
          </LinearGradient>
        </View>
      </View>
      <LinearGradient colors={['#f5f5f5', '#b9b9b9']} style={[s.spoon, { width: size * 0.5, height: size * 0.05, right: -size * 0.1, top: size * 0.26 }]} />
    </View>
  );
}

const s = StyleSheet.create({
  bowl: { ...sticker, borderWidth: 3, shadowOffset: { width: 0, height: 8 }, backgroundColor: colors.bowl, alignItems: 'center', justifyContent: 'center' },
  spoon: { position: 'absolute', borderRadius: 8, borderWidth: 2, borderColor: colors.ink, transform: [{ rotate: '-32deg' }] },
});
