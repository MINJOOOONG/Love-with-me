import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bowl } from '@/components/bowl';
import { useAuth } from '@/lib/auth';
import { isDemo, supabase } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

const stone = require('@/assets/images/stone.png');

export default function Intro() {
  const { width, height } = useWindowDimensions();
  const { session, me } = useAuth();
  const size = Math.min(width * 0.96, height * 0.5, 460);

  const start = async () => {
    if (isDemo && !session) {
      await supabase.auth.signInWithPassword({ email: 'demo@2uram.app', password: 'demo' });
      router.replace('/home');
    } else if (!session) router.push('/login');
    else if (!me?.couple_id) router.push('/pair');
    else router.replace('/home');
  };

  return (
    <ImageBackground source={stone} resizeMode="repeat" style={s.bg}>
      <SafeAreaView style={s.wrap}>
        <View style={s.titleBox}>
          <Text style={s.logo}>2uram</Text>
          <Text style={s.sub}>crystal little days, together</Text>
        </View>
        <Bowl size={size} />
        <View style={s.bottom}>
          <Pressable onPress={start} style={({ pressed }) => [s.start, pressed && { opacity: 0.7 }]}>
            <Text style={s.startTxt}>{isDemo ? '둘러보기' : '시작하기'}</Text>
          </Pressable>
          <Text style={s.credit}>{isDemo ? '체험 모드 · 예시 데이터로 보여드려요' : '01 · 우리 둘만의 하루'}</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const shadow = { textShadowColor: 'rgba(80,68,56,0.35)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 1 } };
const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.stone },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 16 },
  titleBox: { alignItems: 'center', gap: 2 },
  logo: { fontFamily: fonts.display, fontSize: 72, color: colors.white, letterSpacing: 2, ...shadow },
  sub: { fontFamily: fonts.displayItalic, fontSize: 19, color: colors.white, letterSpacing: 1, ...shadow },
  bottom: { alignItems: 'center', gap: 12 },
  start: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 40, backgroundColor: 'rgba(255,255,255,0.18)' },
  startTxt: { fontFamily: fonts.body, fontSize: 15, color: colors.white, letterSpacing: 1, ...shadow },
  credit: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
});
