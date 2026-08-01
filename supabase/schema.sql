-- Habu — Supabase schema (run in Dashboard → SQL Editor)
-- Mirrors types/database.types.ts and lib/db/schema.ts.
-- Note: reminder_time is "HH:MM" text; ids are app-generated text keys.

create table if not exists public.boards (
  id text primary key,
  user_id uuid not null,
  name text not null,
  icon text not null,
  color text not null,
  reminder_enabled boolean not null default false,
  reminder_time text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists idx_completions_board_date on public.completions (board_id, completed_on);
create index if not exists idx_widget_configs_scope on public.widget_configs (scope, board_id, position);

-- Row Level Security: users only ever see/write their own data.
alter table public.boards enable row level security;
alter table public.completions enable row level security;
alter table public.widget_configs enable row level security;

create policy "boards_select_own" on public.boards for select using (auth.uid() = user_id);
create policy "boards_insert_own" on public.boards for insert with check (auth.uid() = user_id);
create policy "boards_update_own" on public.boards for update using (auth.uid() = user_id);
create policy "boards_delete_own" on public.boards for delete using (auth.uid() = user_id);

-- completions have no user_id column; ownership comes from the owning board.
create policy "completions_select_own" on public.completions for select using (
  exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
);
create policy "completions_insert_own" on public.completions for insert with check (
  exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
);
create policy "completions_update_own" on public.completions for update using (
  exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
);
create policy "completions_delete_own" on public.completions for delete using (
  exists (select 1 from public.boards b where b.id = completions.board_id and b.user_id = auth.uid())
);

create policy "widgets_select_own" on public.widget_configs for select using (auth.uid() = user_id);
create policy "widgets_insert_own" on public.widget_configs for insert with check (auth.uid() = user_id);
create policy "widgets_update_own" on public.widget_configs for update using (auth.uid() = user_id);
create policy "widgets_delete_own" on public.widget_configs for delete using (auth.uid() = user_id);
