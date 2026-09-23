-- Fonely Team v1
-- Equipe com login individual, permissões e acesso seguro ao workspace.

create table if not exists public.clinic_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'Profissional',
  permissions jsonb not null default '{"finance":false,"reports":false,"manage_team":false}'::jsonb,
  status text not null default 'active' check (status in ('active','removed')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,user_id),
  unique(owner_id,email)
);

create index if not exists clinic_members_user_status_idx on public.clinic_members(user_id,status);
create index if not exists clinic_members_owner_status_idx on public.clinic_members(owner_id,status);
create index if not exists clinic_members_invited_by_idx on public.clinic_members(invited_by);

alter table public.clinic_members enable row level security;

create schema if not exists fonely_private;
revoke all on schema fonely_private from public;
grant usage on schema fonely_private to authenticated;

create or replace function fonely_private.is_active_member(target_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.clinic_members m
    where m.owner_id = target_owner
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

revoke all on function fonely_private.is_active_member(uuid) from public;
grant execute on function fonely_private.is_active_member(uuid) to authenticated;

drop policy if exists clinic_members_select_allowed on public.clinic_members;
create policy clinic_members_select_allowed
on public.clinic_members for select to authenticated
using (owner_id = (select auth.uid()) or user_id = (select auth.uid()));

drop policy if exists account_access_select_own on public.account_access;
drop policy if exists account_access_select_workspace on public.account_access;
create policy account_access_select_workspace
on public.account_access for select to authenticated
using (
  user_id = (select auth.uid())
  or fonely_private.is_active_member(user_id)
);

drop policy if exists caa_public_boards_owner_select on public.caa_public_boards;
create policy caa_public_boards_owner_select
on public.caa_public_boards for select to authenticated
using (owner_id = (select auth.uid()) or fonely_private.is_active_member(owner_id));

drop policy if exists caa_public_boards_owner_insert on public.caa_public_boards;
create policy caa_public_boards_owner_insert
on public.caa_public_boards for insert to authenticated
with check (owner_id = (select auth.uid()) or fonely_private.is_active_member(owner_id));

drop policy if exists caa_public_boards_owner_update on public.caa_public_boards;
create policy caa_public_boards_owner_update
on public.caa_public_boards for update to authenticated
using (owner_id = (select auth.uid()) or fonely_private.is_active_member(owner_id))
with check (owner_id = (select auth.uid()) or fonely_private.is_active_member(owner_id));
