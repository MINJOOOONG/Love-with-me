import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Sheet } from '@/components/ui';
import { colors, fonts } from '@/lib/theme';

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
    <Sheet>
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
    </Sheet>
  );
}

const s = StyleSheet.create({
  video: { width: '100%', aspectRatio: 3 / 4, borderRadius: 28, overflow: 'hidden', backgroundColor: '#000' },
  badge: { position: 'absolute', left: 14, bottom: 16, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  badgeTxt: { fontFamily: fonts.body, color: colors.ink, fontSize: 13 },
  progress: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 2, borderRadius: 1 },
});
