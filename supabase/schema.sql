create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile_emoji text default '🙂',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.activity_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  default_score int not null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  activity_rule_id uuid references public.activity_rules(id),
  activity_type text not null,
  category text,
  score int not null,
  activity_date date not null,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.activities
  add column if not exists activity_rule_id uuid references public.activity_rules(id),
  add column if not exists category text;

create index if not exists activities_member_id_idx on public.activities(member_id);
create index if not exists activities_activity_rule_id_idx on public.activities(activity_rule_id);
create index if not exists activities_activity_date_idx on public.activities(activity_date);
create index if not exists activities_activity_type_idx on public.activities(activity_type);
create index if not exists activities_category_idx on public.activities(category);
create index if not exists activities_created_at_idx on public.activities(created_at desc);
create index if not exists activity_rules_active_sort_idx on public.activity_rules(is_active, sort_order);
create index if not exists admins_user_id_idx on public.admins(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_activities_updated_at on public.activities;
create trigger set_activities_updated_at
before update on public.activities
for each row
execute function public.set_updated_at();

drop trigger if exists set_activity_rules_updated_at on public.activity_rules;
create trigger set_activity_rules_updated_at
before update on public.activity_rules
for each row
execute function public.set_updated_at();

insert into public.activity_rules (name, category, default_score, sort_order)
select seed.name, seed.category, seed.default_score, seed.sort_order
from (
  values
    ('벙 개설', '벙', 10, 10),
    ('벙 성사', '벙', 30, 20),
    ('벙 참석', '벙', 10, 30),
    ('벙 후기 작성', '벙', 5, 40),
    ('콘텐츠 개최', '콘텐츠', 10, 50),
    ('참여자 5명 이상 보너스', '콘텐츠', 10, 60),
    ('일일 출석', '출석', 1, 70),
    ('7일 연속 출석 보너스', '출석', 10, 80),
    ('30일 연속 출석 보너스', '출석', 50, 90)
) as seed(name, category, default_score, sort_order)
where not exists (
  select 1
  from public.activity_rules existing
  where existing.name = seed.name
);

alter table public.members enable row level security;
alter table public.activity_rules enable row level security;
alter table public.activities enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Public can read active members" on public.members;
drop policy if exists "Anyone can read members" on public.members;
drop policy if exists "Admins can insert members" on public.members;
drop policy if exists "Admins can update members" on public.members;
drop policy if exists "Admins can delete members" on public.members;

create policy "Public can read active members"
on public.members
for select
to anon, authenticated
using (is_active = true or public.is_admin());

create policy "Admins can insert members"
on public.members
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update members"
on public.members
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete members"
on public.members
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can read activity rules" on public.activity_rules;
drop policy if exists "Admins can insert activity rules" on public.activity_rules;
drop policy if exists "Admins can update activity rules" on public.activity_rules;
drop policy if exists "Admins can delete activity rules" on public.activity_rules;

create policy "Public can read activity rules"
on public.activity_rules
for select
to anon, authenticated
using (true);

create policy "Admins can insert activity rules"
on public.activity_rules
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update activity rules"
on public.activity_rules
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete activity rules"
on public.activity_rules
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Anyone can read activities" on public.activities;
drop policy if exists "Public can read activities" on public.activities;
drop policy if exists "Admins can insert activities" on public.activities;
drop policy if exists "Admins can update activities" on public.activities;
drop policy if exists "Admins can delete activities" on public.activities;

create policy "Public can read activities"
on public.activities
for select
to anon, authenticated
using (true);

create policy "Admins can insert activities"
on public.activities
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update activities"
on public.activities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete activities"
on public.activities
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read admins" on public.admins;

create policy "Admins can read admins"
on public.admins
for select
to authenticated
using (public.is_admin());
