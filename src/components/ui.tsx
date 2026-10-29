import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkles } from '@/components/sparkles';
import { colors, fonts, sticker } from '@/lib/theme';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={s.safe}>
      <Sparkles />
      <View style={[s.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

export function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <Pressable hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} style={s.back}>
        <Text style={s.backTxt}>‹</Text>
      </Pressable>
      <Text style={s.title}>{title}</Text>
      <View style={s.iconBtn}>{right}</View>
    </View>
  );
}

export function Button({ label, onPress, kind = 'mint', loading, disabled }: {
  label: string; onPress: () => void; kind?: 'mint' | 'pink' | 'ghost'; loading?: boolean; disabled?: boolean;
}) {
  const bg = kind === 'mint' ? colors.mint : kind === 'pink' ? colors.pink : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, pressed && s.pressed]}>
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={s.btnText}>{label}</Text>}
    </Pressable>
  );
}

export function Chip({ label, on, color, onPress }: { label: string; on: boolean; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: on ? color : colors.white, opacity: on ? 1 : 0.6, transform: [{ rotate: on ? '-2deg' : '0deg' }] }]}>
      <Text style={s.chipText}>{on ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.inkSoft} style={s.input} {...props} />
    </View>
  );
}

export const T = ({ children, style }: { children: ReactNode; style?: object }) => <Text style={[s.body, style]}>{children}</Text>;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.stone },
  inner: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  back: { ...sticker, shadowOffset: { width: 0, height: 2 }, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 26, color: colors.ink, lineHeight: 28, marginTop: -2 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, transform: [{ rotate: '-2deg' }] },
  btn: { ...sticker, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 999, alignItems: 'center' },
  pressed: { transform: [{ translateY: 3 }], shadowOffset: { width: 0, height: 1 } },
  btnText: { fontFamily: fonts.body, color: colors.ink, fontSize: 17 },
  chip: { ...sticker, shadowOffset: { width: 0, height: 2 }, paddingVertical: 7, paddingHorizontal: 16, borderRadius: 999 },
  chipText: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginLeft: 6 },
  input: { ...sticker, shadowOffset: { width: 0, height: 2 }, fontFamily: fonts.body, fontSize: 16, color: colors.ink, backgroundColor: colors.white, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16 },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 15 },
});
