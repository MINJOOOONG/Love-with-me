import { router } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Bowl } from '@/components/bowl';
import { Button, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { isDemo, supabase } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

export default function Intro() {
  const { width } = useWindowDimensions();
  const { session, me } = useAuth();
  const size = Math.min(width * 0.8, 340);

  const start = async () => {
    if (isDemo && !session) {
      await supabase.auth.signInWithPassword({ email: 'demo@2uram.app', password: 'demo' });
      router.replace('/home');
    } else if (!session) router.push('/login');
    else if (!me?.couple_id) router.push('/pair');
    else router.replace('/home');
  };

  return (
    <Screen style={s.wrap}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={s.logo}>2uram</Text>
        <Text style={s.sub}>✦ our little day, together ✦</Text>
      </View>
      <Bowl size={size} />
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Button label={isDemo ? '체험해보기' : '시작하기'} onPress={start} />
        {isDemo && <Text style={s.warn}>체험 모드 · 예시 데이터로 둘러봐요</Text>}
      </View>
    </Screen>
  );
}

const shadow = { textShadowColor: colors.pink, textShadowRadius: 0, textShadowOffset: { width: 3, height: 4 } };
const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 36 },
  logo: { fontFamily: fonts.display, fontSize: 68, color: colors.ink, letterSpacing: 1, transform: [{ rotate: '-4deg' }], ...shadow },
  sub: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft },
  warn: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13 },
});
