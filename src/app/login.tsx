import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Glow } from '@/components/glow';
import { Button, Field, Header, Screen, T } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

export default function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    const res = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
    setLoading(false);
    if (res.error) return setError(res.error.message);
    if (!res.data.session) return setError('메일함에서 인증 링크를 누른 뒤 로그인해 주세요.');
    router.replace('/');
  };

  return (
    <Screen background={<Glow color="pink" style={{ top: 60, right: -130 }} />}>
      <Header label={mode === 'in' ? 'sign in' : 'sign up'} title={mode === 'in' ? 'Hello again' : 'Welcome'} />
      <View style={{ gap: 22 }}>
        {mode === 'up' && <Field label="이름" value={name} onChangeText={setName} maxLength={10} placeholder="상대에게 보일 이름" />}
        <Field label="이메일" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field label="비밀번호" value={password} onChangeText={setPassword} secureTextEntry placeholder="6자 이상" />
        {!!error && <T style={{ color: '#d0768a' }}>{error}</T>}
        <Button label={mode === 'in' ? '로그인' : '가입하기'} onPress={submit} loading={loading} disabled={!email || password.length < 6 || (mode === 'up' && !name.trim())} />
        <Pressable onPress={() => setMode(mode === 'in' ? 'up' : 'in')} style={{ alignItems: 'center', padding: 8 }}>
          <Text style={s.switch}>{mode === 'in' ? '처음이에요 · 가입하기' : '이미 계정이 있어요 · 로그인'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({ switch: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 14 } });
