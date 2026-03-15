-- ================================================
-- DBuddy — Supabase Database Setup
-- Run this entire file in your Supabase SQL Editor
-- ================================================

-- 1. Databases table
create table if not exists databases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('PostgreSQL', 'MySQL', 'MongoDB', 'SQLite')),
  schema_json jsonb,
  created_at timestamptz default now() not null
);

alter table databases enable row level security;

drop policy if exists "Users own their databases" on databases;
create policy "Users own their databases" on databases
  for all using (auth.uid() = user_id);

-- 2. Queries table
create table if not exists queries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  database_id uuid references databases(id) on delete cascade,
  natural_language text,
  generated_query text,
  created_at timestamptz default now() not null
);

alter table queries enable row level security;

drop policy if exists "Users own their queries" on queries;
create policy "Users own their queries" on queries
  for all using (auth.uid() = user_id);

-- 3. User settings table
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  claude_api_key text,
  updated_at timestamptz default now() not null
);

alter table user_settings enable row level security;

drop policy if exists "Users own their settings" on user_settings;
create policy "Users own their settings" on user_settings
  for all using (auth.uid() = user_id);

-- 4. Indexes for performance
create index if not exists databases_user_id_idx on databases(user_id);
create index if not exists queries_user_id_idx on queries(user_id);
create index if not exists queries_database_id_idx on queries(database_id);

-- Done!
select 'DBuddy tables created successfully!' as status;
