/**
 * Seed script — inserts people (profiles) into Supabase near the rooms.
 *
 * Prerequisites:
 *   1. Run schema.sql in your Supabase SQL editor first
 *   2. Then run this script:
 *      npx tsx scripts/seed-people.ts
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
const BASE_LAT = 6.2442   // Medellín city center
const BASE_LNG = -75.5812
// ────────────────────────────────────────────────────────────────

interface Person {
  display_name: string
  latitude: number
  longitude: number
}

// Each offset is relative to BASE_LAT/BASE_LNG, roughly within room radiuses
const people: Person[] = [
  // Parque Lleras area (6.2506, -75.5638)
  { display_name: 'Carlos Pérez', latitude: BASE_LAT + 0.0064, longitude: BASE_LNG + 0.0174 },
  { display_name: 'Ana Gómez', latitude: BASE_LAT + 0.0058, longitude: BASE_LNG + 0.0170 },
  { display_name: 'Luis Martínez', latitude: BASE_LAT + 0.0068, longitude: BASE_LNG + 0.0182 },

  // Museo de Antioquia area (6.2436, -75.5648)
  { display_name: 'María Rodríguez', latitude: BASE_LAT - 0.0006, longitude: BASE_LNG + 0.0164 },
  { display_name: 'Pedro Ramírez', latitude: BASE_LAT - 0.0009, longitude: BASE_LNG + 0.0160 },

  // Comuna 13 area (6.2396, -75.5608)
  { display_name: 'Sofía Herrera', latitude: BASE_LAT - 0.0046, longitude: BASE_LNG + 0.0204 },
  { display_name: 'Diego Torres', latitude: BASE_LAT - 0.0049, longitude: BASE_LNG + 0.0200 },
  { display_name: 'Valentina Ríos', latitude: BASE_LAT - 0.0042, longitude: BASE_LNG + 0.0212 },

  // Estadio Atanasio area (6.2486, -75.5688)
  { display_name: 'Andrés López', latitude: BASE_LAT + 0.0047, longitude: BASE_LNG + 0.0124 },
  { display_name: 'Camila Duque', latitude: BASE_LAT + 0.0041, longitude: BASE_LNG + 0.0120 },

  // Mercado del Río area (6.2496, -75.5668)
  { display_name: 'Felipe Orozco', latitude: BASE_LAT + 0.0057, longitude: BASE_LNG + 0.0144 },

  // Jardín Botánico area (6.2416, -75.5678)
  { display_name: 'Isabel Restrepo', latitude: BASE_LAT - 0.0026, longitude: BASE_LNG + 0.0134 },
  { display_name: 'Jorge Arias', latitude: BASE_LAT - 0.0029, longitude: BASE_LNG + 0.0130 },

  // Biblioteca España area (6.2466, -75.5698)
  { display_name: 'Laura Sánchez', latitude: BASE_LAT + 0.0024, longitude: BASE_LNG + 0.0114 },

  // El Tesoro area (6.2526, -75.5618)
  { display_name: 'Manuel Vargas', latitude: BASE_LAT + 0.0087, longitude: BASE_LNG + 0.0194 },
  { display_name: 'Gabriela Ruiz', latitude: BASE_LAT + 0.0081, longitude: BASE_LNG + 0.0190 },

  // Pueblito Paisa area (6.2426, -75.5628)
  { display_name: 'Fernando Castro', latitude: BASE_LAT - 0.0016, longitude: BASE_LNG + 0.0184 },

  // Universidad EAFIT area (6.2516, -75.5648)
  { display_name: 'Daniela Mejía', latitude: BASE_LAT + 0.0077, longitude: BASE_LNG + 0.0164 },
  { display_name: 'Santiago Pineda', latitude: BASE_LAT + 0.0071, longitude: BASE_LNG + 0.0160 },

  // San Francisco rooms - additional people
  { display_name: 'Alex Chen', latitude: 37.7879, longitude: -122.4074 },
  { display_name: 'Sam Rivera', latitude: 37.8080, longitude: -122.4177 },
  { display_name: 'Jordan Kim', latitude: 37.7694, longitude: -122.4862 },
  { display_name: 'Taylor Singh', latitude: 37.7599, longitude: -122.4148 },
  { display_name: 'Morgan Lee', latitude: 37.7764, longitude: -122.4347 },
]

async function seed() {
  const { error: checkError } = await supabase.from('profiles').select('id').limit(1)
  if (checkError) {
    console.log('The "profiles" table does not exist yet.')
    console.log('')
    console.log('Run the schema.sql first.')
    process.exit(1)
  }

  console.log(`Seeding ${people.length} people around (${BASE_LAT}, ${BASE_LNG})...\n`)

  let inserted = 0
  let skipped = 0

  for (const p of people) {
    const id = crypto.randomUUID()
    const { error } = await supabase.from('profiles').upsert(
      {
        id,
        display_name: p.display_name,
        latitude: p.latitude,
        longitude: p.longitude,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )

    if (error && error.message.includes('duplicate key')) {
      console.log(`  ~ ${p.display_name} (already exists)`)
      skipped++
    } else if (error) {
      console.error(`  ✗ ${p.display_name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${p.display_name}`)
      inserted++
    }
  }

  console.log(`\nDone! ${inserted} inserted, ${skipped} skipped.`)
}

seed().catch(console.error)
