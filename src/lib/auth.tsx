import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

export type Profile = { id: string; name: string; couple_id: string | null };

type AuthState = {
  ready: boolean;
  session: Session | null;
  me: Profile | null;
  partner: Profile | null;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthState>({ ready: false, session: null, me: null, partner: null, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setMe(null);
      setPartner(null);
      return;
    }
    let { data: mine } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
    if (!mine) {
      const name = (s.user.user_metadata?.name as string) ?? '';
      ({ data: mine } = await supabase.from('profiles').insert({ id: s.user.id, name }).select().single());
    }
    setMe(mine);
    if (mine?.couple_id) {
      const { data } = await supabase.from('profiles').select('*').eq('couple_id', mine.couple_id).neq('id', s.user.id).maybeSingle();
      setPartner(data);
    } else setPartner(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session).catch(() => {});
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      load(s).catch(() => {});
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(() => load(session), [load, session]);

  return <Ctx.Provider value={{ ready, session, me, partner, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
