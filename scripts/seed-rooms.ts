/**
 * Seed script — inserts rooms into Supabase.
 *
 * Prerequisites:
 *   1. Run schema.sql in your Supabase SQL editor first
 *   2. Then run this script:
 *      npx tsx scripts/seed-rooms.ts
 *
 * To customize coordinates, edit BASE_LAT / BASE_LNG below.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Change these to your city ──────────────────────────────────
const BASE_LAT = 40.4168   // Madrid city center
const BASE_LNG = -3.7038
// ────────────────────────────────────────────────────────────────

const rooms = [
  {
    name: 'Central Perk',
    description: 'Coffee & coworking — bring your laptop',
    latitude: BASE_LAT + 0.002,
    longitude: BASE_LNG - 0.001,
    radius_meters: 80,
  },
  {
    name: 'Rooftop Lounge',
    description: 'Sunset views and good vibes',
    latitude: BASE_LAT - 0.001,
    longitude: BASE_LNG + 0.003,
    radius_meters: 50,
  },
  {
    name: 'Library Quiet Zone',
    description: 'Study room — shh!',
    latitude: BASE_LAT + 0.003,
    longitude: BASE_LNG + 0.002,
    radius_meters: 40,
  },
  {
    name: 'Food Market',
    description: 'Grab a bite and meet people',
    latitude: BASE_LAT - 0.002,
    longitude: BASE_LNG - 0.002,
    radius_meters: 100,
  },
  {
    name: 'Park Bench',
    description: 'Fresh air, casual chat',
    latitude: BASE_LAT + 0.004,
    longitude: BASE_LNG - 0.003,
    radius_meters: 60,
  },
  {
    name: 'Tech Meetup',
    description: 'Devs & founders hanging out',
    latitude: BASE_LAT - 0.003,
    longitude: BASE_LNG + 0.004,
    radius_meters: 70,
  },
]

async function seed() {
  // First check if the table exists
  const { error: checkError } = await supabase.from('rooms').select('id').limit(1)
  if (checkError) {
    console.log('The "rooms" table does not exist yet.')
    console.log('')
    console.log('Run this SQL in your Supabase SQL editor first:')
    console.log('  https://supabase.com/dashboard/project/_/sql/new')
    console.log('')
    console.log('SQL to copy:')
    console.log('')
    console.log('  create table if not exists rooms (')
    console.log('    id uuid default gen_random_uuid() primary key,')
    console.log('    name text not null,')
    console.log('    description text,')
    console.log('    latitude double precision not null,')
    console.log('    longitude double precision not null,')
    console.log('    radius_meters double precision not null default 50,')
    console.log('    created_at timestamptz default now(),')
    console.log('    unique (name)')
    console.log('  );')
    console.log('  alter table rooms enable row level security;')
    console.log('  create policy "Public read" on rooms for select using (true);')
    console.log('  create policy "Public insert" on rooms for insert with check (true);')
    process.exit(1)
  }

  console.log(`Seeding ${rooms.length} rooms around (${BASE_LAT}, ${BASE_LNG})...\n`)

  for (const room of rooms) {
    const { error } = await supabase
      .from('rooms')
      .insert({ ...room })

    if (error && error.message.includes('duplicate key')) {
      console.log(`  ~ ${room.name} (already exists)`)
    } else if (error) {
      console.error(`  ✗ ${room.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${room.name}`)
    }
  }

  console.log('\nDone! Open the Nearby app and you should see rooms on the map.')
}

seed().catch(console.error)
