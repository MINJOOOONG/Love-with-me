import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { colors, fonts, sticker } from '@/lib/theme';

export type FilmItem = { url: string; label: string; color: string };

// 하루 동안 남긴 영상을 시간순으로 이어서 재생
export function DayFilm({ items, onClose }: { items: FilmItem[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const player = useVideoPlayer(items[0].url, p => p.play());

  useEventListener(player, 'playToEnd', async () => {
    const next = (index + 1) % items.length;
    setIndex(next);
    await player.replaceAsync(items[next].url);
    player.play();
  });

  const item = items[index];
  return (
    <View style={s.backdrop}>
      <View style={s.sheet}>
        <View>
          <VideoView player={player} style={s.video} contentFit="cover" nativeControls={false} />
          <View style={[s.badge, { backgroundColor: item.color }]}>
            <Text style={s.badgeTxt}>{item.label}</Text>
          </View>
          <View style={s.progress}>
            {items.map((it, i) => (
              <View key={i} style={[s.seg, { backgroundColor: i <= index ? it.color : 'rgba(255,255,255,0.5)' }]} />
            ))}
          </View>
        </View>
        <Button label="닫기" onPress={onClose} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(90,80,70,0.35)', justifyContent: 'flex-end' },
  sheet: { ...sticker, shadowOpacity: 0, borderBottomWidth: 0, backgroundColor: colors.stone, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: 36, gap: 12, width: '100%', maxWidth: 480, alignSelf: 'center' },
  video: { width: '100%', aspectRatio: 3 / 4, borderRadius: 24, borderWidth: 2, borderColor: colors.ink, overflow: 'hidden', backgroundColor: '#000' },
  badge: { ...sticker, shadowOffset: { width: 0, height: 2 }, position: 'absolute', left: 12, bottom: 14, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  badgeTxt: { fontFamily: fonts.body, color: colors.ink, fontSize: 14 },
  progress: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
});
