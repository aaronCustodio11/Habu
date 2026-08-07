-- Habu — Supabase schema (run in Dashboard → SQL Editor)
-- Mirrors types/database.types.ts and lib/db/schema.ts.
-- Note: reminder_time is "HH:MM" text; ids are app-generated text keys.
create table if not exists public.boards (
  id text primary key,
  user_id uuid not null,
  name text not null,
  icon text not null,
  color text not null,
  layout text not null default 'heatmap',
  track_amounts boolean not null default false,
  unit text not null default 'count',
  use_default_amount boolean not null default false,
  default_amount double precision,
  daily_target_amount double precision,
  allow_exceeding boolean not null default false,
  reminder_enabled boolean not null default false,
  reminder_time text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent columns for databases created before amount tracking (v2).
alter table public.boards add column if not exists track_amounts boolean not null default false;
alter table public.boards add column if not exists unit text not null default 'count';
alter table public.boards add column if not exists use_default_amount boolean not null default false;
alter table public.boards add column if not exists default_amount double precision;

-- Daily target amount (goal) for boards.
alter table public.boards add column if not exists daily_target_amount double precision;

-- Whether logged amounts may exceed the daily target.
alter table public.boards add column if not exists allow_exceeding boolean not null default false;

-- Board visualization layout (v3). Defaults to the classic heatmap.
alter table public.boards add column if not exists layout text not null default 'heatmap';

create table if not exists public.completions (
  id text primary key,
  board_id text not null references public.boards (id) on delete cascade,
  completed_on date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (board_id, completed_on)
);

create table if not exists public.widget_configs (
  id text primary key,
  user_id uuid not null,
  board_id text references public.boards (id) on delete cascade,
  scope text not null default 'home',
  widget_type text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_boards_user_id on public.boards (user_id);
create index if not exists idx_completions_board_date on public.completions (board_id, completed_on);
create index if not exists idx_widget_configs_user on public.widget_configs (user_id);
create index if not exists idx_widget_configs_scope on public.widget_configs (scope, board_id, position);

-- Row Level Security: users only ever see/write their own data.
alter table public.boards enable row level security;
alter table public.completions enable row level security;
alter table public.widget_configs enable row level security;

-- Idempotent: drop existing policies before recreating (CREATE POLICY has no IF NOT EXISTS).
drop policy if exists "boards_select_own" on public.boards;
drop policy if exists "boards_insert_own" on public.boards;
drop policy if exists "boards_update_own" on public.boards;
drop policy if exists "boards_delete_own" on public.boards;
drop policy if exists "completions_select_own" on public.completions;
drop policy if exists "completions_insert_own" on public.completions;
drop policy if exists "completions_update_own" on public.completions;
drop policy if exists "completions_delete_own" on public.completions;
drop policy if exists "widgets_select_own" on public.widget_configs;
drop policy if exists "widgets_insert_own" on public.widget_configs;
drop policy if exists "widgets_update_own" on public.widget_configs;
drop policy if exists "widgets_delete_own" on public.widget_configs;

create policy "boards_select_own" on public.boards
  for select to authenticated
  using (auth.uid() = user_id);
create policy "boards_insert_own" on public.boards
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "boards_update_own" on public.boards
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "boards_delete_own" on public.boards
  for delete to authenticated
  using (auth.uid() = user_id);

-- completions have no user_id column; ownership comes from the owning board.
create policy "completions_select_own" on public.completions
  for select to authenticated
  using (
    exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
  );
create policy "completions_insert_own" on public.completions
  for insert to authenticated
  with check (
    exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
  );
create policy "completions_update_own" on public.completions
  for update to authenticated
  using (
    exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
  );
create policy "completions_delete_own" on public.completions
  for delete to authenticated
  using (
    exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
  );

create policy "widgets_select_own" on public.widget_configs
  for select to authenticated
  using (auth.uid() = user_id);
create policy "widgets_insert_own" on public.widget_configs
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "widgets_update_own" on public.widget_configs
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "widgets_delete_own" on public.widget_configs
  for delete to authenticated
  using (auth.uid() = user_id);

-- Email availability lookup (signup stage 1). Clients cannot read auth.users,
-- so mirror emails here via trigger and expose only a boolean RPC. The table
-- itself has no RLS policies (locked down); the RPC is the only access path.
create table if not exists public.user_emails (
  email text primary key,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create or replace function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.user_emails (email, user_id) values (new.email, new.id)
    on conflict (email) do nothing;
  elsif tg_op = 'UPDATE' then
    update public.user_emails set email = new.email where user_id = new.id;
  elsif tg_op = 'DELETE' then
    delete from public.user_emails where user_id = old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email on auth.users;
create trigger on_auth_user_email
after insert or update or delete on auth.users
for each row execute function public.sync_user_email();

-- Backfill existing users (idempotent).
insert into public.user_emails (email, user_id)
select email, id from auth.users
on conflict (email) do nothing;

alter table public.user_emails enable row level security;

create or replace function public.is_email_registered(target text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_emails where lower(email) = lower(target)
  );
$$;

revoke all on function public.is_email_registered(text) from public;
grant execute on function public.is_email_registered(text) to anon, authenticated;

-- User profile (username). Mirrored from auth.users.raw_user_meta_data at
-- signup and kept in sync on update/delete. Stored lowercase; duplicates are
-- allowed — username is a display label and is NEVER used for authorization
-- (user_metadata is user-editable). user_id is the PK (one profile per user).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    insert into public.profiles (user_id, username, updated_at)
    values (
      new.id,
      lower(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1))),
      now()
    )
    on conflict (user_id) do update
      set username = excluded.username, updated_at = now();
  elsif tg_op = 'DELETE' then
    delete from public.profiles where user_id = old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile on auth.users;
create trigger on_auth_user_profile
after insert or update or delete on auth.users
for each row execute function public.sync_user_profile();

-- Backfill existing users (idempotent).
insert into public.profiles (user_id, username)
select
  id,
  lower(coalesce(nullif(raw_user_meta_data ->> 'username', ''), split_part(email, '@', 1)))
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
