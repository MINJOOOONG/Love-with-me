import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/lib/theme';

const paper = require('@/assets/images/paper.png');

export function Screen({ children, style, background }: { children: ReactNode; style?: ViewStyle; background?: ReactNode }) {
  return (
    <ImageBackground source={paper} resizeMode="repeat" style={s.bg} imageStyle={{ opacity: 0.9 }}>
      {background}
      <SafeAreaView style={s.safe}>
        <View style={[s.inner, style]}>{children}</View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// 잡지 목차처럼 작은 번호 + 얇은 세리프 제목
export function Header({ title, label, right }: { title: string; label?: string; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <View style={s.headerRow}>
        <Pressable hitSlop={14} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <View>{right}</View>
      </View>
      {!!label && <Text style={s.label}>{label}</Text>}
      <Text style={s.title}>{title}</Text>
    </View>
  );
}

export function Button({ label, onPress, kind = 'mint', loading, disabled }: {
  label: string; onPress: () => void; kind?: 'mint' | 'pink' | 'ghost'; loading?: boolean; disabled?: boolean;
}) {
  const bg = kind === 'mint' ? colors.aquaSoft : kind === 'pink' ? colors.petalSoft : 'transparent';
  const border = kind === 'mint' ? colors.aqua : kind === 'pink' ? colors.petal : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={s.btnText}>{label}</Text>}
    </Pressable>
  );
}

export function Chip({ label, on, color, onPress }: { label: string; on: boolean; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: on ? color + '55' : 'transparent', borderColor: on ? color : colors.line }]}>
      <View style={[s.chipDot, { backgroundColor: on ? color : colors.line }]} />
      <Text style={[s.chipText, !on && { color: colors.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={colors.inkSoft + '99'} style={s.input} {...props} />
    </View>
  );
}

export const T = ({ children, style }: { children: ReactNode; style?: object }) => <Text style={[s.body, style]}>{children}</Text>;

// ‹  October 29  › 처럼 앞뒤로 넘기는 줄
export function Stepper({ label, sub, onPrev, onNext }: { label: string; sub?: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={s.stepper}>
      <Pressable hitSlop={14} onPress={onPrev}><Text style={s.arrow}>‹</Text></Pressable>
      <View style={{ alignItems: 'center' }}>
        <Text style={s.stepLabel}>{label}</Text>
        {!!sub && <Text style={s.stepSub}>{sub}</Text>}
      </View>
      <Pressable hitSlop={14} onPress={onNext}><Text style={s.arrow}>›</Text></Pressable>
    </View>
  );
}

// 아래에서 올라오는 시트 (모달 안에서 사용)
export function Sheet({ children, scroll }: { children: ReactNode; scroll?: boolean }) {
  const Body = scroll ? ScrollView : View;
  return (
    <View style={s.backdrop}>
      <Body style={s.sheet} {...(scroll ? { contentContainerStyle: { gap: 16 } } : {})}>{children}</Body>
    </View>
  );
}

// 얇은 구분선
export const Rule = () => <View style={s.rule} />;

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.paper },
  safe: { flex: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 8 },
  header: { marginBottom: 18, gap: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 40 },
  back: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.inkSoft, letterSpacing: 1, marginTop: 6 },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.ink, letterSpacing: -0.5 },
  btn: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 999, alignItems: 'center' },
  btnText: { fontFamily: fonts.body, color: colors.ink, fontSize: 15, letterSpacing: 0.5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  fieldLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, letterSpacing: 0.5 },
  input: { fontFamily: fonts.body, fontSize: 17, color: colors.ink, borderBottomWidth: 1, borderBottomColor: colors.ink + '55', paddingVertical: 10, outlineWidth: 0 },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 15, lineHeight: 24 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 14 },
  arrow: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, paddingHorizontal: 6 },
  stepLabel: { fontFamily: fonts.displayItalic, fontSize: 20, color: colors.ink },
  stepSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,57,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 40, gap: 16, width: '100%', maxWidth: 480, maxHeight: '92%', alignSelf: 'center', flexGrow: 0 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.ink + '40' },
});
