import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Field, Header, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, sticker } from '@/lib/theme';

export default function Pair() {
  const { me, partner, refresh } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('create_couple');
    setLoading(false);
    if (error) return setError(error.message);
    setCode(data as string);
    refresh();
  };

  const join = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('join_couple', { invite: input });
    setLoading(false);
    if (error) return setError(error.message);
    await refresh();
    router.replace('/home');
  };

  return (
    <Screen>
      <Header title="Pair" />
      <View style={{ gap: 24 }}>
        <T style={{ color: colors.inkSoft }}>{me?.name}님, 한 사람이 초대코드를 만들고{'\n'}다른 사람이 그 코드를 입력하면 연결돼요.</T>

        <View style={s.card}>
          <Text style={s.cardTitle}>초대코드 만들기</Text>
          {code ? (
            <>
              <Text style={s.code} selectable>{code}</Text>
              <Button label="코드 복사" kind="ghost" onPress={() => Clipboard.setStringAsync(code)} />
              <Button label={partner ? '시작하기' : '상대가 입력했으면 눌러주세요'} onPress={async () => { await refresh(); router.replace('/home'); }} />
            </>
          ) : (
            <Button label="코드 만들기" onPress={create} loading={loading} />
          )}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>받은 코드 입력하기</Text>
          <Field label="초대코드" value={input} onChangeText={setInput} autoCapitalize="characters" maxLength={6} />
          <Button label="연결하기" kind="pink" onPress={join} loading={loading} disabled={input.trim().length < 6} />
        </View>
        {!!error && <T style={{ color: '#d0768a' }}>{error}</T>}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { ...sticker, shadowOffset: { width: 0, height: 5 }, backgroundColor: colors.white, borderRadius: 28, padding: 20, gap: 12 },
  cardTitle: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  code: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 8, textAlign: 'center', color: colors.ink },
});
