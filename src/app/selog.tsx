import * as ImagePicker from 'expo-image-picker';
import { Redirect, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayFilm, type FilmItem } from '@/components/day-film';
import { Glow } from '@/components/glow';
import { Button, Chip, Header, Screen, Sheet, Stepper, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { type Clip, clipUrl, deleteClip, listClips, uploadClip } from '@/lib/clips';
import { addDays, pad, ymd } from '@/lib/date';
import { useRealtime } from '@/lib/realtime';
import { colors, fonts, whoColor } from '@/lib/theme';

export default function Selog() {
  const { session, me, partner } = useAuth();
  const [day, setDay] = useState(new Date());
  const [clips, setClips] = useState<Clip[]>([]);
  const [show, setShow] = useState({ me: true, partner: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState<{ clip: Clip; url: string } | null>(null);
  const [film, setFilm] = useState<FilmItem[] | null>(null);

  const date = ymd(day);
  const isToday = date === ymd(new Date());
  const nowH = new Date().getHours();

  const load = useCallback(() => {
    listClips(date).then(setClips).catch(e => setError(e.message));
  }, [date]);
  useFocusEffect(load);
  useRealtime('clips', me?.couple_id, load);

  if (!session || !me?.couple_id) return <Redirect href="/" />;

  const record = async () => {
    setError('');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return setError('카메라 권한이 필요해요');
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'], videoMaxDuration: 5, cameraType: ImagePicker.CameraType.front,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setBusy(true);
    try {
      const now = new Date();
      await uploadClip({ uri: asset.uri, mimeType: asset.mimeType, coupleId: me.couple_id!, userId: me.id, day: ymd(now), hour: now.getHours() });
      setDay(now);
      setClips(await listClips(ymd(now)));
    } catch (e: any) {
      setError(e.message ?? '업로드에 실패했어요');
    } finally {
      setBusy(false);
    }
  };

  const open = async (clip: Clip) => {
    try {
      setPlaying({ clip, url: await clipUrl(clip.path) });
    } catch (e: any) {
      setError(e.message ?? '영상을 불러오지 못했어요');
    }
  };

  const visible = (c: Clip) => (c.user_id === me.id ? show.me : show.partner);

  const playDay = async () => {
    const list = clips.filter(visible).sort((a, b) => a.hour - b.hour || (a.user_id === me.id ? -1 : 1));
    try {
      const items = await Promise.all(list.map(async c => ({
        url: await clipUrl(c.path),
        label: `${pad(c.hour)}:00 · ${c.user_id === me.id ? me.name : partner?.name ?? '상대'}`,
        color: c.user_id === me.id ? whoColor.me : whoColor.partner,
      })));
      setFilm(items);
    } catch (e: any) {
      setError(e.message ?? '영상을 불러오지 못했어요');
    }
  };
  const hasClips = clips.some(visible);

  return (
    <Screen background={<Glow style={{ top: 40, right: -110 }} />}>
      <Header label="01" title="Selog" />
      <Stepper
        label={day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        sub={isToday ? '오늘' : `${day.getMonth() + 1}월 ${day.getDate()}일`}
        onPrev={() => setDay(addDays(day, -1))}
        onNext={() => setDay(addDays(day, 1))}
      />
      <View style={s.chips}>
        <Chip label={me.name || '나'} color={whoColor.me} on={show.me} onPress={() => setShow({ ...show, me: !show.me || !show.partner })} />
        <Chip label={partner?.name || '상대'} color={whoColor.partner} on={show.partner} onPress={() => setShow({ ...show, partner: !show.partner || !show.me })} />
      </View>
      {!!error && <T style={{ color: '#d0768a', textAlign: 'center', marginBottom: 8 }}>{error}</T>}
      {hasClips && (
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Button label="하루 이어보기" kind="ghost" onPress={playDay} />
        </View>
      )}

      <ScrollView contentContainerStyle={s.grid}>
        {Array.from({ length: 24 }, (_, h) => {
          const here = clips.filter(c => c.hour === h && visible(c));
          const now = isToday && h === nowH;
          return (
            <View key={h} style={[s.slot, now && s.now]}>
              <Text style={[s.hour, now && { color: colors.ink }]}>{pad(h)}</Text>
              <View style={s.dots}>
                {here.map(c => (
                  <Pressable key={c.id} onPress={() => open(c)} style={[s.dot, { backgroundColor: c.user_id === me.id ? whoColor.me : whoColor.partner }]}>
                    <Text style={s.play}>{(c.user_id === me.id ? me.name : partner?.name ?? '')?.slice(0, 1)}</Text>
                  </Pressable>
                ))}
              </View>
              {now && !here.length && <Text style={s.nowTxt}>now</Text>}
            </View>
          );
        })}
      </ScrollView>

      {isToday && (
        <View style={s.fab}>
          {busy ? <ActivityIndicator color={colors.ink} /> : <Button label="지금, 이 순간 남기기" kind="pink" onPress={record} />}
        </View>
      )}

      <Modal visible={!!film} transparent animationType="slide" onRequestClose={() => setFilm(null)}>
        {film && film.length > 0 && <DayFilm items={film} onClose={() => setFilm(null)} />}
      </Modal>

      <Modal visible={!!playing} transparent animationType="slide" onRequestClose={() => setPlaying(null)}>
        {playing && (
          <Player
            url={playing.url}
            canDelete={playing.clip.user_id === me.id}
            onClose={() => setPlaying(null)}
            onDelete={async () => { await deleteClip(playing.clip); setPlaying(null); load(); }}
          />
        )}
      </Modal>
    </Screen>
  );
}

function Player({ url, canDelete, onClose, onDelete }: { url: string; canDelete: boolean; onClose: () => void; onDelete: () => void }) {
  const player = useVideoPlayer(url, p => { p.loop = true; p.play(); });
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet>
      <VideoView player={player} style={s.video} contentFit="cover" nativeControls={false} />
      <View style={s.row}>
        {canDelete && <Button label={confirm ? '정말 지울까요?' : '지우기'} kind="ghost" onPress={() => (confirm ? onDelete() : setConfirm(true))} />}
        <Button label="닫기" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 130 },
  slot: { width: '23%', flexGrow: 1, aspectRatio: 3 / 4, borderRadius: 40, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(255,255,255,0.55)', paddingVertical: 10, alignItems: 'center', justifyContent: 'space-between' },
  now: { borderColor: colors.aqua, backgroundColor: colors.aquaSoft },
  hour: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.inkSoft },
  dots: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  play: { fontFamily: fonts.body, color: colors.ink, fontSize: 12 },
  nowTxt: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.ink },
  fab: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  video: { width: '100%', aspectRatio: 3 / 4, borderRadius: 28, overflow: 'hidden', backgroundColor: '#000' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
});
