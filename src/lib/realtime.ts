import { useEffect, useRef } from 'react';

import { supabase } from './supabase';

// 우리 커플의 테이블이 바뀌면 onChange 호출 (상대의 추가·삭제를 바로 반영)
export function useRealtime(table: 'events' | 'clips', coupleId: string | null | undefined, onChange: () => void) {
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });

  useEffect(() => {
    if (!coupleId) return;
    const channel = supabase
      .channel(`${table}:${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `couple_id=eq.${coupleId}` }, () => cb.current())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, coupleId]);
}
