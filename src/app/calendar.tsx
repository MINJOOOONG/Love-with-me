import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateStepper, TimePicker } from '@/components/pickers';
import { Button, Chip, Field, Header, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fromYmd, ymd } from '@/lib/date';
import { useRealtime } from '@/lib/realtime';
import { supabase } from '@/lib/supabase';
import { colors, fonts, sticker, whoColor } from '@/lib/theme';

type Ev = { id: string; title: string; date: string; start_time: string | null; end_time: string | null; tags: string[] };
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '');

export default function Calendar() {
  const { session, me, partner } = useAuth();
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [sel, setSel] = useState(ymd(new Date()));
  const [events, setEvents] = useState<Ev[]>([]);
  const [show, setShow] = useState({ me: true, partner: true });
  // null = 닫힘, 'new' = 새 일정, Ev = 수정
  const [editing, setEditing] = useState<Ev | 'new' | null>(null);

  const from = ymd(new Date(month.getFullYear(), month.getMonth() - 1, 20));
  const to = ymd(new Date(month.getFullYear(), month.getMonth() + 1, 15));
  const load = useCallback(() => {
    supabase.from('events').select('id,title,date,start_time,end_time,tags').gte('date', from).lte('date', to)
      .order('start_time', { nullsFirst: true }).then(({ data }) => setEvents((data as Ev[]) ?? []));
  }, [from, to]);
  useFocusEffect(load);
  useRealtime('events', me?.couple_id, load);

  const owner = useCallback((e: Ev) => (e.tags.length > 1 ? 'both' : e.tags[0] === me?.id ? 'me' : 'partner') as keyof typeof whoColor, [me]);
  const visible = useMemo(() => events.filter(e => e.tags.some(t => (t === me?.id ? show.me : show.partner))), [events, show, me]);

  if (!session || !me?.couple_id) return <Redirect href="/" />;

  const start = new Date(month);
  start.setDate(1 - start.getDay());
  const today = ymd(new Date());
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const dayEvents = visible.filter(e => e.date === sel);
  const owners = new Set(dayEvents.map(owner));
  const nameOf = (o: string) => (o === 'both' ? '우리' : o === 'me' ? me.name : partner?.name ?? '상대');

  const remove = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    load();
  };

  return (
    <Screen>
      <Header title="Calendar" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.nav}>
          <Pressable style={s.navBtn} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Text style={s.navTxt}>‹</Text></Pressable>
          <T>{month.getFullYear()}. {month.getMonth() + 1}</T>
          <Pressable style={s.navBtn} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Text style={s.navTxt}>›</Text></Pressable>
        </View>
        <View style={s.chips}>
          <Chip label={me.name || '나'} color={whoColor.me} on={show.me} onPress={() => setShow({ ...show, me: !show.me })} />
          <Chip label={partner?.name || '상대'} color={whoColor.partner} on={show.partner} onPress={() => setShow({ ...show, partner: !show.partner })} />
        </View>

        <View style={s.week}>{WEEK.map(w => <Text key={w} style={s.weekTxt}>{w}</Text>)}</View>
        <View style={s.grid}>
          {days.map(d => {
            const key = ymd(d);
            const out = d.getMonth() !== month.getMonth();
            const list = visible.filter(e => e.date === key);
            return (
              <Pressable key={key} onPress={() => setSel(key)} style={[s.day, out && { opacity: 0.3 }, key === sel && s.sel]}>
                <View style={[s.num, key === today && { backgroundColor: colors.pink }]}>
                  <Text style={[s.numTxt, key === today && { color: colors.white }]}>{d.getDate()}</Text>
                </View>
                {list.slice(0, 3).map(e => (
                  <Text key={e.id} numberOfLines={1} style={[s.bar, { backgroundColor: whoColor[owner(e)] }]}>{e.title}</Text>
                ))}
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 8, marginTop: 16 }}>
          {owners.has('me') && owners.has('partner') && <T style={s.hint}>둘 다 일정이 있는 날이에요 ♡</T>}
          {!dayEvents.length && <T style={s.hint}>일정이 없어요</T>}
          {dayEvents.map(e => {
            const o = owner(e);
            return (
              <Pressable key={e.id} style={s.ev} onPress={() => setEditing(e)}>
                <View style={[s.dot, { backgroundColor: whoColor[o] }]} />
                <View style={{ flex: 1 }}>
                  <T>{e.title}</T>
                  <T style={{ fontSize: 12, color: colors.inkSoft }}>{nameOf(o)} · {e.start_time ? `${hhmm(e.start_time)}${e.end_time ? '–' + hhmm(e.end_time) : ''}` : '하루 종일'}</T>
                </View>
                <Pressable hitSlop={10} onPress={() => remove(e.id)}><Text style={{ color: colors.inkSoft }}>✕</Text></Pressable>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.fab}><Button label="＋ 일정 추가" kind="pink" onPress={() => setEditing('new')} /></View>

      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        {editing && <EventSheet
          date={sel}
          event={editing === 'new' ? undefined : editing}
          meId={me.id} meName={me.name} partnerId={partner?.id} partnerName={partner?.name}
          coupleId={me.couple_id}
          onClose={() => setEditing(null)}
          onSaved={date => { setEditing(null); setSel(date); const d = fromYmd(date); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); load(); }}
        />}
      </Modal>
    </Screen>
  );
}

function EventSheet(p: { date: string; event?: Ev; meId: string; meName: string; partnerId?: string; partnerName?: string; coupleId: string; onClose: () => void; onSaved: (date: string) => void }) {
  const ev = p.event;
  const [title, setTitle] = useState(ev?.title ?? '');
  const [date, setDate] = useState(ev?.date ?? p.date);
  const [startT, setStartT] = useState(hhmm(ev?.start_time ?? null));
  const [endT, setEndT] = useState(hhmm(ev?.end_time ?? null));
  const [tags, setTags] = useState<string[]>(ev?.tags ?? [p.meId]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => setTags(t => (t.includes(id) ? (t.length > 1 ? t.filter(x => x !== id) : t) : [...t, id]));

  const save = async () => {
    if (startT && endT && endT <= startT) return setError('끝나는 시간이 시작보다 늦어야 해요');
    setLoading(true);
    const fields = { title: title.trim(), date, start_time: startT || null, end_time: (startT && endT) || null, tags };
    const { error } = ev
      ? await supabase.from('events').update(fields).eq('id', ev.id)
      : await supabase.from('events').insert({ ...fields, couple_id: p.coupleId, created_by: p.meId });
    setLoading(false);
    if (error) return setError(error.message);
    p.onSaved(date);
  };

  return (
    <View style={s.backdrop}>
      <ScrollView style={s.sheet} contentContainerStyle={{ gap: 12 }}>
        <Text style={s.sheetTitle}>{ev ? '일정 수정' : '새 일정'}</Text>
        <Field label="제목" value={title} onChangeText={setTitle} maxLength={30} />
        <DateStepper value={date} onChange={setDate} />
        <TimePicker label="시작" value={startT} onChange={setStartT} />
        {!!startT && <TimePicker label="끝" value={endT} onChange={setEndT} />}
        <T style={{ fontSize: 13, color: colors.inkSoft }}>태그 · 둘 다 고르면 함께하는 일정</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label={p.meName || '나'} color={whoColor.me} on={tags.includes(p.meId)} onPress={() => toggle(p.meId)} />
          {p.partnerId && <Chip label={p.partnerName || '상대'} color={whoColor.partner} on={tags.includes(p.partnerId)} onPress={() => toggle(p.partnerId!)} />}
        </View>
        {!!error && <T style={{ color: '#d0768a' }}>{error}</T>}
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
          <Button label="취소" kind="ghost" onPress={p.onClose} />
          <Button label="저장" onPress={save} loading={loading} disabled={!title.trim()} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 12 },
  navBtn: { ...sticker, shadowOffset: { width: 0, height: 2 }, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center' },
  navTxt: { fontSize: 20, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 14 },
  week: { flexDirection: 'row', marginBottom: 6 },
  weekTxt: { flex: 1, textAlign: 'center', fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: `${100 / 7}%`, minHeight: 66, padding: 2, gap: 2, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  sel: { borderColor: colors.ink, backgroundColor: colors.white },
  num: { alignSelf: 'center', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numTxt: { fontFamily: fonts.body, fontSize: 12, color: colors.ink },
  bar: { fontFamily: fonts.body, fontSize: 9, color: colors.ink, borderRadius: 6, paddingHorizontal: 3, overflow: 'hidden' },
  hint: { textAlign: 'center', color: colors.inkSoft, fontSize: 14 },
  ev: { ...sticker, shadowOffset: { width: 0, height: 3 }, backgroundColor: colors.white, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.ink },
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(90,80,70,0.35)', justifyContent: 'flex-end' },
  sheet: { ...sticker, shadowOpacity: 0, borderBottomWidth: 0, backgroundColor: colors.stone, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, width: '100%', maxWidth: 480, maxHeight: '90%', alignSelf: 'center', flexGrow: 0 },
  sheetTitle: { fontFamily: fonts.body, fontSize: 26, color: colors.ink, transform: [{ rotate: '-2deg' }] },
});
