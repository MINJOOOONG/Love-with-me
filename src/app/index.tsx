import { router } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Bowl } from '@/components/bowl';
import { Button, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { isConfigured } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

export default function Intro() {
  const { width } = useWindowDimensions();
  const { session, me } = useAuth();
  const size = Math.min(width * 0.8, 340);

  const start = () => {
    if (!session) router.push('/login');
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
      {isConfigured ? <Button label="시작하기" onPress={start} /> : <Text style={s.warn}>.env.local 에 Supabase 키를 넣어주세요</Text>}
    </Screen>
  );
}

const shadow = { textShadowColor: colors.pink, textShadowRadius: 0, textShadowOffset: { width: 3, height: 4 } };
const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 36 },
  logo: { fontFamily: fonts.display, fontSize: 68, color: colors.ink, letterSpacing: 1, transform: [{ rotate: '-4deg' }], ...shadow },
  sub: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft },
  warn: { fontFamily: fonts.body, color: colors.ink },
});
