import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, fonts, sticker } from '@/lib/theme';

export default function Home() {
  const { session, me, partner } = useAuth();
  if (!session) return <Redirect href="/" />;
  if (me && !me.couple_id) return <Redirect href="/pair" />;

  const h = new Date().getHours();
  const hi = h < 12 ? '좋은 아침' : h < 18 ? '좋은 오후' : '좋은 밤';

  return (
    <Screen>
      <View style={s.top}>
        <Text style={s.logo}>2uram</Text>
        <Pressable hitSlop={12} onPress={() => router.push('/settings')}><Text style={s.gear}>⚙︎</Text></Pressable>
      </View>
      <Text style={s.greet}>{hi}이에요, {me?.name} ♡ {partner?.name ?? '…'}</Text>
      <View style={{ gap: 16 }}>
        <MenuCard num="01 ✦" title="Selog" desc="한 시간마다 남기는 우리의 짧은 일상" tint={colors.mint} tilt="-1.5deg" onPress={() => router.push('/selog')} />
        <MenuCard num="02 ♡" title="Calendar" desc="각자의 스케줄을 겹쳐서 보기" tint={colors.pink} tilt="1.5deg" onPress={() => router.push('/calendar')} />
      </View>
    </Screen>
  );
}

function MenuCard({ num, title, desc, tint, tilt, onPress }: { num: string; title: string; desc: string; tint: string; tilt: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cardWrap, { transform: [{ rotate: tilt }, { translateY: pressed ? 4 : 0 }] }]}>
      <LinearGradient colors={[colors.white, tint + '99', tint]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <Text style={s.num}>{num}</Text>
        <Text style={s.ttl}>{title}</Text>
        <Text style={s.desc}>{desc}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  logo: { fontFamily: fonts.display, fontSize: 36, color: colors.ink, textShadowColor: colors.pink, textShadowOffset: { width: 2, height: 3 }, textShadowRadius: 0 },
  gear: { fontSize: 24, color: colors.ink },
  greet: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 15, marginTop: 6, marginBottom: 24 },
  cardWrap: { ...sticker, shadowOffset: { width: 0, height: 6 }, borderRadius: 32, marginBottom: 6 },
  card: { borderRadius: 30, paddingVertical: 26, paddingHorizontal: 22, gap: 6 },
  num: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  ttl: { fontFamily: fonts.display, fontSize: 38, color: colors.ink },
  desc: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
});
