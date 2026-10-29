import { Redirect, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Glow } from '@/components/glow';
import { Rule, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

const gingham = require('@/assets/images/gingham.png');

export default function Home() {
  const { session, me, partner } = useAuth();
  if (!session) return <Redirect href="/" />;
  if (me && !me.couple_id) return <Redirect href="/pair" />;

  const now = new Date();
  const h = now.getHours();
  const hi = h < 12 ? '좋은 아침이에요' : h < 18 ? '좋은 오후예요' : '좋은 밤이에요';
  const dateLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <Screen background={<><Glow style={{ top: -60, right: -90 }} /><Glow color="pink" style={{ bottom: -80, left: -120 }} /></>}>
      <View style={s.top}>
        <Text style={s.logo}>2uram</Text>
        <Pressable hitSlop={12} onPress={() => router.push('/settings')}><Text style={s.menu}>Settings</Text></Pressable>
      </View>
      <Text style={s.date}>{dateLabel}</Text>
      <Text style={s.greet}>{hi},{'\n'}{me?.name} 그리고 {partner?.name ?? '…'}.</Text>

      <View style={s.index}>
        <Rule />
        <Entry num="01" title="Selog" desc="한 시간마다 남기는 우리의 짧은 일상" swatch={<View style={[s.swatch, { backgroundColor: colors.aquaSoft, borderColor: colors.aqua }]} />} onPress={() => router.push('/selog')} />
        <Rule />
        <Entry num="02" title="Calendar" desc="각자의 하루를 겹쳐서 보기" swatch={<Image source={gingham} resizeMode="repeat" style={[s.swatch, { borderColor: colors.petal }]} />} onPress={() => router.push('/calendar')} />
        <Rule />
      </View>
    </Screen>
  );
}

function Entry({ num, title, desc, swatch, onPress }: { num: string; title: string; desc: string; swatch: ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.entry, pressed && { opacity: 0.6 }]}>
      <Text style={s.num}>{num}</Text>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.ttl}>{title}</Text>
        <Text style={s.desc}>{desc}</Text>
      </View>
      {swatch}
    </Pressable>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 },
  logo: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, letterSpacing: 1 },
  menu: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.inkSoft },
  date: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.inkSoft, marginTop: 40 },
  greet: { fontFamily: fonts.body, fontSize: 24, lineHeight: 36, color: colors.ink, marginTop: 8, marginBottom: 48 },
  index: { gap: 0 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 24 },
  num: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.inkSoft, alignSelf: 'flex-start', marginTop: 10 },
  ttl: { fontFamily: fonts.display, fontSize: 40, color: colors.ink, letterSpacing: -0.5 },
  desc: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  swatch: { width: 54, height: 72, borderRadius: 27, borderWidth: 1, overflow: 'hidden' },
});
