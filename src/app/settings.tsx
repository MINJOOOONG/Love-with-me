import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { Button, Field, Header, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { getReminder, reminderSupported, setReminder } from '@/lib/reminder';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';

export default function Settings() {
  const { me, partner, refresh } = useAuth();
  const [name, setName] = useState(me?.name ?? '');
  const [remind, setRemind] = useState(false);
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getReminder().then(setRemind);
    if (me?.couple_id) supabase.from('couples').select('code').eq('id', me.couple_id).single().then(({ data }) => setCode(data?.code ?? ''));
  }, [me?.couple_id]);

  const save = async () => {
    if (!me) return;
    await supabase.from('profiles').update({ name: name.trim() }).eq('id', me.id);
    await refresh();
    setSaved(true);
  };

  return (
    <Screen>
      <Header label="etc." title="Settings" />
      <View style={{ gap: 22 }}>
        <Field label="나의 이름" value={name} onChangeText={t => { setName(t); setSaved(false); }} maxLength={10} />
        <Button label={saved ? '저장했어요' : '이름 저장'} onPress={save} disabled={!name.trim()} />
        <T style={{ color: colors.inkSoft }}>연결된 사람 · {partner?.name ?? '아직 없어요'}{code ? `   (초대코드 ${code})` : ''}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T>매 정각 기록 알림 (8시–23시)</T>
          <Switch
            value={remind}
            disabled={!reminderSupported}
            trackColor={{ true: colors.aqua, false: colors.line }}
            onValueChange={async v => setRemind(await setReminder(v))}
          />
        </View>
        {!reminderSupported && <T style={{ fontSize: 12, color: colors.inkSoft }}>알림은 휴대폰 앱에서만 받을 수 있어요</T>}
        <Button label="로그아웃" kind="ghost" onPress={async () => { await supabase.auth.signOut(); router.replace('/'); }} />
      </View>
    </Screen>
  );
}
