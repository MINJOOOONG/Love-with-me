import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';

import { addDays, fromYmd, pad, ymd } from '@/lib/date';
import { colors, fonts, sticker } from '@/lib/theme';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// ‹ 10월 29일 (목) › 형태의 날짜 고르기
export function DateStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const d = fromYmd(value);
  return (
    <View style={s.stepper}>
      <Pressable hitSlop={8} style={s.arrow} onPress={() => onChange(ymd(addDays(d, -1)))}><Text style={s.arrowTxt}>‹</Text></Pressable>
      <Text style={s.dateTxt}>{d.getMonth() + 1}월 {d.getDate()}일 ({WEEK[d.getDay()]})</Text>
      <Pressable hitSlop={8} style={s.arrow} onPress={() => onChange(ymd(addDays(d, 1)))}><Text style={s.arrowTxt}>›</Text></Pressable>
    </View>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

// 시·분을 칩으로 고르기. value 는 'HH:MM' 또는 '' (시간 없음)
export function TimePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [h, m] = value ? value.split(':').map(Number) : [null, null];
  const scroll = useRef<ScrollViewInstance>(null);
  useEffect(() => {
    if (h !== null) scroll.current?.scrollTo({ x: Math.max(0, h - 2) * 50, animated: false });
    // 처음 열릴 때만 선택한 시간으로 스크롤
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ gap: 6 }}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        {value ? (
          <Pressable onPress={() => onChange('')}><Text style={s.clear}>{value} · 지우기</Text></Pressable>
        ) : (
          <Text style={s.clear}>시간 없음</Text>
        )}
      </View>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {HOURS.map(x => (
          <Pressable key={x} onPress={() => onChange(`${pad(x)}:${pad(m ?? 0)}`)} style={[s.chip, h === x && s.on]}>
            <Text style={s.chipTxt}>{x}시</Text>
          </Pressable>
        ))}
      </ScrollView>
      {h !== null && (
        <View style={s.chips}>
          {MINUTES.map(x => (
            <Pressable key={x} onPress={() => onChange(`${pad(h)}:${pad(x)}`)} style={[s.chip, m === x && s.on]}>
              <Text style={s.chipTxt}>{pad(x)}분</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  stepper: { ...sticker, shadowOffset: { width: 0, height: 2 }, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 10 },
  arrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { fontSize: 20, color: colors.ink },
  dateTxt: { fontFamily: fonts.body, fontSize: 17, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 6 },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  clear: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 2 },
  chip: { borderWidth: 2, borderColor: colors.stoneDot, backgroundColor: colors.white, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, minWidth: 44, alignItems: 'center' },
  on: { borderColor: colors.ink, backgroundColor: colors.lilac },
  chipTxt: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
});
