import * as ImagePicker from 'expo-image-picker';
import { Redirect, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayFilm, type FilmItem } from '@/components/day-film';
import { Button, Chip, Header, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { type Clip, clipUrl, deleteClip, listClips, uploadClip } from '@/lib/clips';
import { addDays, pad, ymd } from '@/lib/date';
import { useRealtime } from '@/lib/realtime';
import { colors, fonts, sticker, whoColor } from '@/lib/theme';

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
    <Screen>
      <Header title="Selog" />
      <View style={s.nav}>
        <Pressable style={s.navBtn} onPress={() => setDay(addDays(day, -1))}><Text style={s.navTxt}>‹</Text></Pressable>
        <T>{day.getMonth() + 1}월 {day.getDate()}일</T>
        <Pressable style={s.navBtn} onPress={() => setDay(addDays(day, 1))}><Text style={s.navTxt}>›</Text></Pressable>
      </View>
      <View style={s.chips}>
        <Chip label={me.name || '나'} color={whoColor.me} on={show.me} onPress={() => setShow({ ...show, me: !show.me || !show.partner })} />
        <Chip label={partner?.name || '상대'} color={whoColor.partner} on={show.partner} onPress={() => setShow({ ...show, partner: !show.partner || !show.me })} />
      </View>
      {!!error && <T style={{ color: '#d0768a', textAlign: 'center', marginBottom: 8 }}>{error}</T>}
      {hasClips && (
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Button label="▶ 하루 이어보기" kind="ghost" onPress={playDay} />
        </View>
      )}

      <ScrollView contentContainerStyle={s.grid}>
        {Array.from({ length: 24 }, (_, h) => {
          const here = clips.filter(c => c.hour === h && visible(c));
          const now = isToday && h === nowH;
          return (
            <View key={h} style={[s.slot, now && s.now]}>
              <Text style={s.hour}>{pad(h)}:00</Text>
              <View style={s.dots}>
                {here.map(c => (
                  <Pressable key={c.id} onPress={() => open(c)} style={[s.dot, { backgroundColor: c.user_id === me.id ? whoColor.me : whoColor.partner }]}>
                    <Text style={s.play}>▶</Text>
                  </Pressable>
                ))}
              </View>
              {now && !here.length && <Text style={s.nowTxt}>지금!</Text>}
            </View>
          );
        })}
      </ScrollView>

      {isToday && (
        <View style={s.fab}>
          {busy ? <ActivityIndicator color={colors.pink} /> : <Button label="● 지금 기록하기" kind="pink" onPress={record} />}
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
    <View style={s.backdrop}>
      <View style={s.sheet}>
        <VideoView player={player} style={s.video} contentFit="cover" nativeControls={false} />
        <View style={s.row}>
          {canDelete && <Button label={confirm ? '정말 지울까요?' : '삭제'} kind="ghost" onPress={() => (confirm ? onDelete() : setConfirm(true))} />}
          <Button label="닫기" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 12 },
  navBtn: { ...sticker, shadowOffset: { width: 0, height: 2 }, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center' },
  navTxt: { fontSize: 20, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 120 },
  slot: { width: '23%', flexGrow: 1, aspectRatio: 3 / 4, borderRadius: 18, borderWidth: 2, borderColor: colors.stoneDot, backgroundColor: 'rgba(255,255,255,0.75)', padding: 6, justifyContent: 'space-between' },
  now: { borderStyle: 'dashed', borderColor: colors.ink, backgroundColor: colors.butter },
  hour: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  dots: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  dot: { borderWidth: 2, borderColor: colors.ink, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  play: { color: colors.ink, fontSize: 10 },
  nowTxt: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(90,80,70,0.35)', justifyContent: 'flex-end' },
  sheet: { ...sticker, shadowOpacity: 0, borderBottomWidth: 0, backgroundColor: colors.stone, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: 36, gap: 12, width: '100%', maxWidth: 480, alignSelf: 'center' },
  video: { width: '100%', aspectRatio: 3 / 4, borderRadius: 24, borderWidth: 2, borderColor: colors.ink, overflow: 'hidden', backgroundColor: '#000' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
});
