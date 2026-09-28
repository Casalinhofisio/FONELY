-- Fonely Billing v1 — planos anuais, upgrade e cupons
alter table public.account_access
  add column if not exists plan_price_cents integer,
  add column if not exists last_order_id uuid,
  add column if not exists coupon_code text;

create table if not exists public.billing_coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  redemptions integer not null default 0,
  applies_to text[] not null default array['base','pro'],
  created_at timestamptz not null default now()
);

create table if not exists public.billing_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('new','renewal','upgrade')),
  from_plan text check (from_plan is null or from_plan in ('base','pro')),
  to_plan text not null check (to_plan in ('base','pro')),
  base_amount_cents integer not null check (base_amount_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  amount_cents integer not null check (amount_cents >= 0),
  coupon_code text,
  status text not null default 'pending' check (status in ('pending','paid','cancelled','failed','refunded')),
  provider text not null default 'infinitepay',
  provider_order_nsu text unique,
  provider_transaction_nsu text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_orders_user_idx on public.billing_orders(user_id,created_at desc);
alter table public.billing_coupons enable row level security;
alter table public.billing_orders enable row level security;

drop policy if exists "billing_orders_owner_read" on public.billing_orders;
create policy "billing_orders_owner_read" on public.billing_orders for select
to authenticated using (user_id=(select auth.uid()));

-- Preço oficial inicial: Básico R$297/ano, Pro R$397/ano.
-- Upgrade Básico -> Pro cobra somente a diferença nominal: R$100.
create or replace function public.billing_quote(p_to_plan text, p_coupon text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  uid uuid := auth.uid();
  current_plan text;
  current_status text;
  base_cents integer;
  discount integer := 0;
  c public.billing_coupons;
  kind text := 'new';
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_to_plan not in ('base','pro') then raise exception 'invalid plan'; end if;

  select plan_tier,status into current_plan,current_status
  from public.account_access where user_id=uid limit 1;

  if current_status='active' and current_plan='base' and p_to_plan='pro' then
    base_cents := 10000;
    kind := 'upgrade';
  elsif p_to_plan='base' then
    base_cents := 29700;
  else
    base_cents := 39700;
  end if;

  if nullif(upper(trim(coalesce(p_coupon,''))),'') is not null then
    select * into c from public.billing_coupons
    where upper(code)=upper(trim(p_coupon)) and active=true
      and (starts_at is null or starts_at<=now())
      and (ends_at is null or ends_at>=now())
      and (max_redemptions is null or redemptions<max_redemptions)
      and p_to_plan=any(applies_to)
    limit 1;
    if c.id is null then raise exception 'invalid coupon'; end if;
    if c.discount_type='percent' then
      discount := least(base_cents,round(base_cents*c.discount_value/100.0)::integer);
    else
      discount := least(base_cents,c.discount_value);
    end if;
  end if;

  return jsonb_build_object(
    'kind',kind,'from_plan',current_plan,'to_plan',p_to_plan,
    'base_amount_cents',base_cents,'discount_cents',discount,
    'amount_cents',greatest(0,base_cents-discount),
    'coupon_code',case when c.id is null then null else upper(c.code) end
  );
end $$;
revoke all on function public.billing_quote(text,text) from public;
grant execute on function public.billing_quote(text,text) to authenticated;

create or replace function public.billing_create_order(p_to_plan text,p_coupon text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare q jsonb; oid uuid; nsu text;
begin
  q:=public.billing_quote(p_to_plan,p_coupon);
  oid:=gen_random_uuid();
  nsu:='fonely-'||replace(oid::text,'-','');
  insert into public.billing_orders(id,user_id,kind,from_plan,to_plan,base_amount_cents,discount_cents,amount_cents,coupon_code,provider_order_nsu)
  values(oid,auth.uid(),q->>'kind',nullif(q->>'from_plan',''),q->>'to_plan',(q->>'base_amount_cents')::integer,(q->>'discount_cents')::integer,(q->>'amount_cents')::integer,q->>'coupon_code',nsu);
  return q||jsonb_build_object('order_id',oid,'order_nsu',nsu);
end $$;
revoke all on function public.billing_create_order(text,text) from public;
grant execute on function public.billing_create_order(text,text) to authenticated;

-- O webhook deverá marcar billing_orders como paid usando service_role e então:
-- base: ativa por 365 dias; pro: ativa Pro e mantém/estende a validade conforme a regra do pedido.
-- Nunca confiar no redirecionamento do navegador para liberar acesso.


-- Atomic payment activation: call only from a verified provider webhook/service role.
create or replace function public.billing_activate_paid_order(p_order_id uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
declare o public.billing_orders;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  select * into o from public.billing_orders where id=p_order_id for update;
  if o.id is null or o.status<>'paid' then raise exception 'paid order required'; end if;

  insert into public.account_access(user_id,plan_tier,status,plan_started_at,plan_ends_at,plan_price_cents,last_order_id,coupon_code)
  values(o.user_id,o.to_plan,'active',coalesce(o.paid_at,now()),coalesce(o.paid_at,now())+interval '1 year',o.amount_cents,o.id,o.coupon_code)
  on conflict(user_id) do update set
    plan_tier=excluded.plan_tier,
    status='active',
    plan_started_at=case when o.kind='upgrade' then public.account_access.plan_started_at else excluded.plan_started_at end,
    plan_ends_at=case when o.kind='upgrade' and public.account_access.plan_ends_at>now() then public.account_access.plan_ends_at else excluded.plan_ends_at end,
    plan_price_cents=excluded.plan_price_cents,
    last_order_id=o.id,
    coupon_code=o.coupon_code,
    updated_at=now();

  if o.coupon_code is not null then
    update public.billing_coupons set redemptions=redemptions+1 where upper(code)=upper(o.coupon_code);
  end if;
end $$;
revoke all on function public.billing_activate_paid_order(uuid) from public,anon,authenticated;
