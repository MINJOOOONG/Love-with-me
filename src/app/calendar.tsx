import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateStepper, TimePicker } from '@/components/pickers';
import { Glow } from '@/components/glow';
import { Button, Chip, Field, Header, Rule, Screen, Sheet, Stepper, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fromYmd, ymd } from '@/lib/date';
import { useRealtime } from '@/lib/realtime';
import { supabase } from '@/lib/supabase';
import { colors, fonts, whoColor } from '@/lib/theme';

type Ev = { id: string; title: string; date: string; start_time: string | null; end_time: string | null; tags: string[] };
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const gingham = require('@/assets/images/gingham.png');
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
    <Screen background={<Glow color="pink" style={{ top: 20, right: -120 }} />}>
      <Header label="02" title="Calendar" />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <Stepper
          label={month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          onPrev={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          onNext={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        />
        <View style={s.chips}>
          <Chip label={me.name || '나'} color={whoColor.me} on={show.me} onPress={() => setShow({ ...show, me: !show.me })} />
          <Chip label={partner?.name || '상대'} color={whoColor.partner} on={show.partner} onPress={() => setShow({ ...show, partner: !show.partner })} />
        </View>

        <View style={s.week}>{WEEK.map((w, i) => <Text key={i} style={s.weekTxt}>{w}</Text>)}</View>
        <Rule />
        <View style={s.grid}>
          {days.map(d => {
            const key = ymd(d);
            const out = d.getMonth() !== month.getMonth();
            const list = visible.filter(e => e.date === key);
            return (
              <Pressable key={key} onPress={() => setSel(key)} style={[s.day, out && { opacity: 0.3 }]}>
                <View style={[s.num, key === today && { backgroundColor: colors.aquaSoft }, key === sel && s.sel]}>
                  <Text style={s.numTxt}>{d.getDate()}</Text>
                </View>
                {list.slice(0, 3).map(e => (
                  <Text key={e.id} numberOfLines={1} style={[s.bar, { backgroundColor: whoColor[owner(e)] }]}>{e.title}</Text>
                ))}
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={s.dayTitle}>{fromYmd(sel).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          {owners.has('me') && owners.has('partner') && <T style={s.hint}>둘 다 일정이 있는 날이에요</T>}
          {!dayEvents.length && <T style={s.hint}>아직 비어 있는 하루예요</T>}
          <Rule />
          {dayEvents.map(e => {
            const o = owner(e);
            return (
              <View key={e.id}>
                <Pressable style={s.ev} onPress={() => setEditing(e)}>
                  <Text style={s.evTime}>{e.start_time ? hhmm(e.start_time) : 'all day'}</Text>
                  {o === 'both'
                    ? <Image source={gingham} resizeMode="repeat" style={s.dot} />
                    : <View style={[s.dot, { backgroundColor: whoColor[o] }]} />}
                  <View style={{ flex: 1 }}>
                    <T>{e.title}</T>
                    <T style={{ fontSize: 12, color: colors.inkSoft }}>{nameOf(o)}{e.end_time ? ` · ~${hhmm(e.end_time)}` : ''}</T>
                  </View>
                  <Pressable hitSlop={12} onPress={() => remove(e.id)}><Text style={s.del}>×</Text></Pressable>
                </Pressable>
                <Rule />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.fab}><Button label="일정 더하기" kind="pink" onPress={() => setEditing('new')} /></View>

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
    <Sheet scroll>
        <Text style={s.sheetTitle}>{ev ? 'Edit' : 'New plan'}</Text>
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
    </Sheet>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 18 },
  week: { flexDirection: 'row', marginBottom: 8 },
  weekTxt: { flex: 1, textAlign: 'center', fontFamily: fonts.displayItalic, fontSize: 13, color: colors.inkSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  day: { width: `${100 / 7}%`, minHeight: 64, paddingVertical: 2, paddingHorizontal: 1, gap: 2 },
  sel: { borderWidth: 1, borderColor: colors.ink },
  num: { alignSelf: 'center', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numTxt: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  bar: { fontFamily: fonts.body, fontSize: 9, color: colors.ink, borderRadius: 999, paddingHorizontal: 4, overflow: 'hidden' },
  dayTitle: { fontFamily: fonts.displayItalic, fontSize: 22, color: colors.ink, marginBottom: 4 },
  hint: { color: colors.inkSoft, fontSize: 13, marginBottom: 10 },
  ev: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  evTime: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.inkSoft, width: 52 },
  dot: { width: 12, height: 12, borderRadius: 6, overflow: 'hidden' },
  del: { fontFamily: fonts.display, fontSize: 22, color: colors.inkSoft },
  fab: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  sheetTitle: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
});
