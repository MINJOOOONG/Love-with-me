// 체험 모드: Supabase 키가 없을 때 쓰는 메모리 속 가짜 서버.
// 앱이 쓰는 supabase-js 기능만 흉내 내며, 새로고침하면 처음 상태로 돌아가요.
import { addDays, ymd } from './date';

type Row = Record<string, any>;

const ME = 'demo-me';
const PARTNER = 'demo-partner';
const COUPLE = 'demo-couple';
const today = new Date();
const d = (n: number) => ymd(addDays(today, n));
let seq = 0;
const id = () => `demo-${++seq}`;

const db: Record<string, Row[]> = {
  couples: [{ id: COUPLE, code: 'LOVE26' }],
  profiles: [
    { id: ME, name: '나', couple_id: COUPLE },
    { id: PARTNER, name: '남자친구', couple_id: COUPLE },
  ],
  events: [
    { id: id(), title: '성수 데이트', date: d(0), start_time: '18:30:00', end_time: '21:00:00', tags: [ME, PARTNER] },
    { id: id(), title: '필라테스', date: d(0), start_time: '08:00:00', end_time: '09:00:00', tags: [ME] },
    { id: id(), title: '팀 회식', date: d(1), start_time: '19:00:00', end_time: null, tags: [PARTNER] },
    { id: id(), title: '친구 생일', date: d(3), start_time: null, end_time: null, tags: [ME] },
    { id: id(), title: '풋살', date: d(3), start_time: '20:00:00', end_time: '22:00:00', tags: [PARTNER] },
    { id: id(), title: '100일 ♡', date: d(6), start_time: null, end_time: null, tags: [ME, PARTNER] },
  ],
  clips: [],
};
const files = new Map<string, string>();

let session: any = null;
const listeners = new Set<(e: string, s: any) => void>();
const emit = () => listeners.forEach(l => l('SIGNED_IN', session));
const changes = new Set<() => void>();
const notify = () => setTimeout(() => changes.forEach(c => c()), 0);

class Query implements PromiseLike<{ data: any; error: any }> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private payload: any;
  private filters: ((r: Row) => boolean)[] = [];
  private mode: 'many' | 'single' | 'maybe' = 'many';
  constructor(private table: string) {}

  select() { if (this.op === 'select') this.op = 'select'; return this; }
  insert(v: any) { this.op = 'insert'; this.payload = v; return this; }
  update(v: any) { this.op = 'update'; this.payload = v; return this; }
  upsert(v: any) { this.op = 'upsert'; this.payload = v; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(k: string, v: any) { this.filters.push(r => r[k] === v); return this; }
  neq(k: string, v: any) { this.filters.push(r => r[k] !== v); return this; }
  gte(k: string, v: any) { this.filters.push(r => r[k] >= v); return this; }
  lte(k: string, v: any) { this.filters.push(r => r[k] <= v); return this; }
  order(k: string) { this.sortKey = k; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybe'; return this; }
  private sortKey?: string;

  private run(): Row[] {
    const rows = (db[this.table] ??= []);
    const match = (r: Row) => this.filters.every(f => f(r));
    switch (this.op) {
      case 'insert': {
        const row = { id: id(), ...this.payload };
        rows.push(row);
        notify();
        return [row];
      }
      case 'upsert': {
        const p = this.payload;
        const i = rows.findIndex(r => r.user_id === p.user_id && r.day === p.day && r.hour === p.hour);
        const row = { id: i >= 0 ? rows[i].id : id(), ...p };
        if (i >= 0) rows[i] = row; else rows.push(row);
        notify();
        return [row];
      }
      case 'update': {
        const hit = rows.filter(match);
        hit.forEach(r => Object.assign(r, this.payload));
        notify();
        return hit;
      }
      case 'delete': {
        const hit = rows.filter(match);
        db[this.table] = rows.filter(r => !match(r));
        notify();
        return hit;
      }
      default: {
        const out = rows.filter(match).map(r => ({ ...r }));
        const k = this.sortKey;
        if (k) out.sort((a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? '')));
        return out;
      }
    }
  }

  then<A, B>(ok?: ((v: { data: any; error: any }) => A | PromiseLike<A>) | null, fail?: ((e: any) => B | PromiseLike<B>) | null) {
    const rows = this.run();
    const data = this.mode === 'many' ? rows : rows[0] ?? null;
    const error = this.mode === 'single' && !rows[0] ? { message: '데이터가 없어요' } : null;
    return Promise.resolve({ data, error }).then(ok, fail);
  }
}

export const demoClient = {
  from: (table: string) => new Query(table),
  rpc: async (name: string) => (name === 'create_couple' ? { data: 'LOVE26', error: null } : { data: null, error: null }),
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (cb: (e: string, s: any) => void) => {
      listeners.add(cb);
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
    },
    signInWithPassword: async () => {
      session = { user: { id: ME, user_metadata: { name: '나' } } };
      emit();
      return { data: { session }, error: null };
    },
    signUp: async ({ options }: any) => {
      const name = options?.data?.name || '나';
      db.profiles[0].name = name;
      session = { user: { id: ME, user_metadata: { name } } };
      emit();
      return { data: { session }, error: null };
    },
    signOut: async () => {
      session = null;
      listeners.forEach(l => l('SIGNED_OUT', null));
      return { error: null };
    },
  },
  storage: {
    from: () => ({
      upload: async (path: string, body: ArrayBuffer, opts: { contentType: string }) => {
        files.set(path, URL.createObjectURL(new Blob([body], { type: opts.contentType })));
        return { data: { path }, error: null };
      },
      createSignedUrl: async (path: string) => ({ data: { signedUrl: files.get(path) ?? '' }, error: null }),
      remove: async (paths: string[]) => {
        paths.forEach(p => files.delete(p));
        return { data: null, error: null };
      },
    }),
  },
  channel: () => {
    let cb: () => void = () => {};
    const ch = {
      on: (_t: string, _f: unknown, fn: () => void) => { cb = fn; return ch; },
      subscribe: () => { changes.add(cb); return ch; },
      _off: () => changes.delete(cb),
    };
    return ch;
  },
  removeChannel: (ch: { _off: () => void }) => ch._off(),
};
