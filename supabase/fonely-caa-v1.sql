-- Fonely CAA v1 — schema proposal
-- Do not apply automatically to production without review.

alter table public.account_access
  add column if not exists plan_tier text not null default 'base';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'account_access_plan_tier_check'
      and conrelid = 'public.account_access'::regclass
  ) then
    alter table public.account_access
      add constraint account_access_plan_tier_check
      check (plan_tier in ('base','pro'));
  end if;
end $$;

create table if not exists public.caa_profiles (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  public_token text not null unique default encode(gen_random_bytes(18),'hex'),
  published_version integer,
  settings jsonb not null default '{"volume":0.9,"rate":0.95,"voiceName":"","speakOnTap":true,"addToPhrase":true,"columns":4}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(patient_id)
);

create table if not exists public.caa_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.caa_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references public.caa_categories(id) on delete set null,
  label text not null,
  speech_text text,
  image_url text,
  audio_url text,
  is_system boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.caa_board_items (
  id uuid primary key default gen_random_uuid(),
  caa_profile_id uuid not null references public.caa_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid references public.caa_cards(id) on delete set null,
  custom_card jsonb,
  category_name text,
  position integer not null default 0,
  pinned boolean not null default false,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.caa_board_versions (
  id uuid primary key default gen_random_uuid(),
  caa_profile_id uuid not null references public.caa_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  change_summary text,
  published_at timestamptz not null default now(),
  unique(caa_profile_id, version_number)
);

create table if not exists public.caa_phrase_sessions (
  id uuid primary key default gen_random_uuid(),
  caa_profile_id uuid not null references public.caa_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase_text text not null,
  card_sequence jsonb not null default '[]'::jsonb,
  spoken boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.caa_usage_events (
  id uuid primary key default gen_random_uuid(),
  caa_profile_id uuid not null references public.caa_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid references public.caa_cards(id) on delete set null,
  event_type text not null check (event_type in ('card','phrase','open')),
  phrase_session_id uuid references public.caa_phrase_sessions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists caa_profiles_user_id_idx on public.caa_profiles(user_id);
create index if not exists caa_board_items_profile_idx on public.caa_board_items(caa_profile_id,position);
create index if not exists caa_versions_profile_idx on public.caa_board_versions(caa_profile_id,version_number desc);
create index if not exists caa_usage_profile_time_idx on public.caa_usage_events(caa_profile_id,created_at desc);
create index if not exists caa_phrase_profile_time_idx on public.caa_phrase_sessions(caa_profile_id,created_at desc);

alter table public.caa_profiles enable row level security;
alter table public.caa_categories enable row level security;
alter table public.caa_cards enable row level security;
alter table public.caa_board_items enable row level security;
alter table public.caa_board_versions enable row level security;
alter table public.caa_phrase_sessions enable row level security;
alter table public.caa_usage_events enable row level security;

drop policy if exists "caa_profiles_owner_select" on public.caa_profiles;
create policy "caa_profiles_owner_select" on public.caa_profiles for select
to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "caa_profiles_pro_insert" on public.caa_profiles;
create policy "caa_profiles_pro_insert" on public.caa_profiles for insert
to authenticated with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.account_access aa
    where aa.user_id=(select auth.uid())
      and aa.status='active'
      and aa.plan_tier='pro'
  )
);

drop policy if exists "caa_profiles_pro_update" on public.caa_profiles;
create policy "caa_profiles_pro_update" on public.caa_profiles for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.account_access aa
    where aa.user_id=(select auth.uid()) and aa.status='active' and aa.plan_tier='pro'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.account_access aa
    where aa.user_id=(select auth.uid()) and aa.status='active' and aa.plan_tier='pro'
  )
);

drop policy if exists "caa_categories_read" on public.caa_categories;
create policy "caa_categories_read" on public.caa_categories for select
to authenticated using (is_system or user_id=(select auth.uid()));

drop policy if exists "caa_categories_write" on public.caa_categories;
create policy "caa_categories_write" on public.caa_categories for all
to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

drop policy if exists "caa_cards_read" on public.caa_cards;
create policy "caa_cards_read" on public.caa_cards for select
to authenticated using (is_system or user_id=(select auth.uid()));

drop policy if exists "caa_cards_write" on public.caa_cards;
create policy "caa_cards_write" on public.caa_cards for all
to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

drop policy if exists "caa_board_items_owner" on public.caa_board_items;
create policy "caa_board_items_owner" on public.caa_board_items for all
to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

drop policy if exists "caa_versions_owner" on public.caa_board_versions;
create policy "caa_versions_owner" on public.caa_board_versions for select
to authenticated using (user_id=(select auth.uid()));

drop policy if exists "caa_versions_insert" on public.caa_board_versions;
create policy "caa_versions_insert" on public.caa_board_versions for insert
to authenticated with check (
  user_id=(select auth.uid())
  and exists (
    select 1 from public.account_access aa
    where aa.user_id=(select auth.uid()) and aa.status='active' and aa.plan_tier='pro'
  )
);

drop policy if exists "caa_phrase_owner" on public.caa_phrase_sessions;
create policy "caa_phrase_owner" on public.caa_phrase_sessions for select
to authenticated using (user_id=(select auth.uid()));

drop policy if exists "caa_usage_owner" on public.caa_usage_events;
create policy "caa_usage_owner" on public.caa_usage_events for select
to authenticated using (user_id=(select auth.uid()));

create or replace function public.get_caa_board_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  p public.caa_profiles;
  result jsonb;
begin
  select * into p
  from public.caa_profiles
  where public_token=p_token and enabled=true
  limit 1;

  if p.id is null or p.published_version is null then
    return null;
  end if;

  select jsonb_build_object(
    'profileId', p.id,
    'settings', p.settings,
    'version', v.version_number,
    'publishedAt', v.published_at,
    'board', v.snapshot
  ) into result
  from public.caa_board_versions v
  where v.caa_profile_id=p.id and v.version_number=p.published_version
  limit 1;

  return result;
end;
$$;

revoke all on function public.get_caa_board_by_token(text) from public;
grant execute on function public.get_caa_board_by_token(text) to anon, authenticated;

create or replace function public.record_caa_usage_by_token(
  p_token text,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  p public.caa_profiles;
begin
  if p_event_type not in ('card','phrase','open') then
    return false;
  end if;

  select * into p
  from public.caa_profiles
  where public_token=p_token and enabled=true
  limit 1;

  if p.id is null then
    return false;
  end if;

  insert into public.caa_usage_events(caa_profile_id,user_id,event_type,metadata)
  values(p.id,p.user_id,p_event_type,coalesce(p_metadata,'{}'::jsonb));

  return true;
end;
$$;

revoke all on function public.record_caa_usage_by_token(text,text,jsonb) from public;
grant execute on function public.record_caa_usage_by_token(text,text,jsonb) to anon, authenticated;
