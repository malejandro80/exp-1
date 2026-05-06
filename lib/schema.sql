-- Run this in your Supabase SQL editor to set up the database schema
-- Auth-based profiles: users authenticate via Google OAuth, profiles FK to auth.users

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

-- Profiles linked to auth.users (Google OAuth)
alter table profiles enable row level security;
alter table rooms enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;

-- Auth-gated policies (users must be authenticated)
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can create their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Rooms are publicly readable"
  on rooms for select using (true);

create policy "Authenticated users can create rooms"
  on rooms for insert with check (auth.role() = 'authenticated');

create policy "Participants can view conversations"
  on conversations for select using (
    auth.uid() = participant1_id or auth.uid() = participant2_id
  );

create policy "Users can create conversations"
  on conversations for insert with check (auth.uid() = participant1_id);

create policy "Participants can update conversations"
  on conversations for update using (
    auth.uid() = participant1_id or auth.uid() = participant2_id
  );

create policy "Participants can view messages"
  on messages for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on messages for insert with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  );

create policy "Users can view their own blocks"
  on blocks for select using (auth.uid() = blocker_id);

create policy "Users can block others"
  on blocks for insert with check (auth.uid() = blocker_id);

create policy "Users can view their own reports"
  on reports for select using (auth.uid() = reporter_id);

create policy "Users can report others"
  on reports for insert with check (auth.uid() = reporter_id);

-- Admin role for profiles
alter table profiles add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- Admin ownership for rooms
alter table rooms add column if not exists admin_id uuid references profiles(id);
alter table rooms add column if not exists is_active boolean not null default true;

-- Promotions table
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  duration_minutes int not null check (duration_minutes > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Push tokens table
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  token text not null,
  created_at timestamptz not null default now()
);

-- RLS policies for promotions
alter table promotions enable row level security;
alter table push_tokens enable row level security;

create policy "Anyone can read promotions"
  on promotions for select using (true);

create policy "Admins can insert promotions"
  on promotions for insert with check (
    exists (
      select 1 from rooms
      where rooms.id = promotions.room_id
      and rooms.admin_id = auth.uid()
    )
  );

create policy "Admins can update own promotions"
  on promotions for update using (
    exists (
      select 1 from rooms
      where rooms.id = promotions.room_id
      and rooms.admin_id = auth.uid()
    )
  );

create policy "Users can manage their own push token"
  on push_tokens for insert with check (auth.uid() = user_id);

create policy "Users can update their own push token"
  on push_tokens for update using (auth.uid() = user_id);

create policy "Users can read their own push token"
  on push_tokens for select using (auth.uid() = user_id);

-- Update rooms RLS for admin creation
create policy "Admins can insert rooms"
  on rooms for insert with check (auth.uid() = admin_id);

create policy "Admins can update own rooms"
  on rooms for update using (admin_id = auth.uid());
