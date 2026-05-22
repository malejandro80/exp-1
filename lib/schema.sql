-- Run this in your Supabase SQL editor to set up the database schema
-- Disposable profiles: no auth.users dependency, users identified by client-generated UUID

-- Profiles table
create table if not exists profiles (
  id uuid primary key,
  display_name text not null default 'Anonymous',
  avatar_url text,
  latitude double precision,
  longitude double precision,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- Rooms (geo-fenced chat areas)
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters double precision not null default 50,
  created_at timestamptz default now(),
  unique (name)
);

-- Conversations (pairs of users)
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  participant1_id uuid references profiles(id) on delete cascade not null,
  participant2_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'declined')),
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (participant1_id, participant2_id)
);

-- Messages (enable Realtime for this table in Supabase dashboard)
create table if not exists messages (
  id bigint generated always as identity primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Blocks (users can block each other)
create table if not exists blocks (
  id uuid default gen_random_uuid() primary key,
  blocker_id uuid references profiles(id) on delete cascade not null,
  blocked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

-- Reports (users can report each other)
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reported_id uuid references profiles(id) on delete cascade not null,
  reason text,
  created_at timestamptz default now()
);

-- Seed a test room (update the coordinates to your location)
-- You can add more rooms by inserting additional rows
insert into rooms (name, description, latitude, longitude, radius_meters)
values ('Test Spot', 'A test room near you', 40.7128, -74.006, 100)
on conflict do nothing;

-- Allow public access for the MVP (no auth required)
alter table profiles enable row level security;
alter table rooms enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;

-- Everyone can read/write everything (disposable profile MVP)
create policy "Public read" on profiles for select using (true);
create policy "Public insert" on profiles for insert with check (true);
create policy "Public update" on profiles for update using (true);

create policy "Public read" on rooms for select using (true);
create policy "Public insert" on rooms for insert with check (true);

create policy "Public read active/pending" on conversations for select using (status in ('pending', 'active'));
create policy "Public insert" on conversations for insert with check (true);
create policy "Public update" on conversations for update using (true);

create policy "Public read" on messages for select using (true);
create policy "Public insert" on messages for insert with check (true);

create policy "Public read" on blocks for select using (true);
create policy "Public insert" on blocks for insert with check (true);

create policy "Public read" on reports for select using (true);
create policy "Public insert" on reports for insert with check (true);
