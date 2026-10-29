-- 2uram Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  couple_id uuid references public.couples on delete set null
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  tags uuid[] not null,            -- 이 일정에 태그된 사람(profiles.id) 목록. 둘 다면 '함께' 일정
  created_by uuid not null references public.profiles,
  created_at timestamptz default now()
);

create table public.clips (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  hour smallint not null check (hour between 0 and 23),
  path text not null,
  created_at timestamptz default now(),
  unique (user_id, day, hour)
);

-- 내 커플 id
create or replace function public.my_couple() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from profiles where id = auth.uid()
$$;

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.clips enable row level security;

create policy "own couple" on public.couples for select using (id = public.my_couple());

create policy "see me and partner" on public.profiles for select
  using (id = auth.uid() or (couple_id is not null and couple_id = public.my_couple()));
create policy "insert me" on public.profiles for insert with check (id = auth.uid());
create policy "update me" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and couple_id is not distinct from public.my_couple());

create policy "couple events read" on public.events for select using (couple_id = public.my_couple());
create policy "couple events add" on public.events for insert
  with check (couple_id = public.my_couple() and created_by = auth.uid());
-- 두 사람 모두 서로의 일정을 고치고 지울 수 있음
create policy "couple events edit" on public.events for update
  using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());
create policy "couple events delete" on public.events for delete using (couple_id = public.my_couple());

create policy "couple clips read" on public.clips for select using (couple_id = public.my_couple());
create policy "my clips write" on public.clips for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and couple_id = public.my_couple());

-- 커플 만들기 / 초대코드로 참여하기
create or replace function public.create_couple() returns text
language plpgsql security definer set search_path = public as $$
declare c couples;
begin
  if public.my_couple() is not null then
    select * into c from couples where id = public.my_couple();
    return c.code;
  end if;
  insert into couples default values returning * into c;
  update profiles set couple_id = c.id where id = auth.uid();
  return c.code;
end $$;

create or replace function public.join_couple(invite text) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select id into cid from couples where code = upper(trim(invite));
  if cid is null then raise exception '초대코드를 찾을 수 없어요'; end if;
  if (select count(*) from profiles where couple_id = cid) >= 2 then
    raise exception '이미 두 사람이 연결된 코드예요';
  end if;
  update profiles set couple_id = cid where id = auth.uid();
end $$;

-- 영상 저장소 (비공개). 경로: {couple_id}/{user_id}/{day}-{hour}.mp4
insert into storage.buckets (id, name, public) values ('clips', 'clips', false)
  on conflict do nothing;

create policy "couple read clips" on storage.objects for select
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = public.my_couple()::text);
create policy "upload my clips" on storage.objects for insert
  with check (bucket_id = 'clips' and (storage.foldername(name))[1] = public.my_couple()::text
              and (storage.foldername(name))[2] = auth.uid()::text);
create policy "update my clips" on storage.objects for update
  using (bucket_id = 'clips' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "delete my clips" on storage.objects for delete
  using (bucket_id = 'clips' and (storage.foldername(name))[2] = auth.uid()::text);

-- 실시간 동기화: 상대가 올린 일정·영상이 바로 보이도록
alter publication supabase_realtime add table public.events, public.clips;

-- [2026-10-29 업데이트] 이미 스키마를 실행했다면 아래만 실행하세요 (일정 수정 허용)
-- drop policy "couple events" on public.events;
-- 그다음 위의 "couple events read/add/edit/delete" 네 줄을 실행
