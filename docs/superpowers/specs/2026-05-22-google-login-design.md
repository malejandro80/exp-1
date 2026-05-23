# Google Login with Supabase Auth

**Date:** 2026-05-22
**Status:** Approved
**Branch:** `feature/google-login`

## Overview

Replace the current anonymous/UUID-based identity system with Google OAuth via Supabase Auth. Users must authenticate with Google before using the app. The profiles table links to `auth.users` and RLS policies require authentication.

## Architecture

### Flow

```
App Launch → AuthProvider checks supabase.auth.getSession()
  ↓
[No session]          [Has session]
  ↓                       ↓
/login screen        IdentityProvider
(Google button)          → fetch profile from DB
  ↓                       ↓
Google OAuth via     [No profile] → create from Google data
  expo-auth-session       → (tabs)
  ↓                   [Has profile] → (tabs)
Create profile from
  Google data
  ↓
(tabs)
```

### Provider Chain

```
AuthProvider
  └→ IdentityProvider (depends on AuthContext → userId from auth.user.id)
       └→ LocationProvider
            └→ RoomProvider
```

## Backend Setup

### Google Cloud Console
1. Create a new project
2. OAuth consent screen → External → scopes: `profile`, `email`
3. Credentials → OAuth client ID → **Web application**
   - Authorized redirect URI: `https://vensxbhckfjojkngptxy.supabase.co/auth/v1/callback`
4. Copy the **Web Client ID**

### Supabase Dashboard
1. Authentication → Providers → Google → Enable
2. Set **Client ID** = Web Client ID from Google Cloud
3. Leave Client Secret empty (PKCE flow)
4. Add **Redirect URLs**: `nearby://` (and Expo Go URL if needed)

## Database Changes

### Schema

```sql
-- Profiles: link to auth.users
alter table profiles
  alter column id set data type uuid,
  add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Existing FK relationships already reference profiles(id), cascade works transitively
```

### RLS Policies

Replace all public policies with auth-gated ones:

**profiles:**
- Select: anyone (profiles are public)
- Insert: only own (`auth.uid() = id`)
- Update: only own

**conversations:**
- Select: only if participant (`auth.uid() = participant1_id OR auth.uid() = participant2_id`)
- Insert: with check (`auth.uid() = participant1_id`)
- Update: only if participant

**messages:**
- Select: only if in conversation (join check)
- Insert: with check (`auth.uid() = sender_id`)

**blocks:**
- Select: only own (`auth.uid() = blocker_id`)
- Insert: with check (`auth.uid() = blocker_id`)

**reports:**
- Select: only own (`auth.uid() = reporter_id`)
- Insert: with check (`auth.uid() = reporter_id`)

**rooms:** remain public select (rooms are fixed seed data)

## App Changes

### New Files

#### `services/auth.ts`
Auth service wrapping Supabase auth:
- `signInWithGoogle()` — triggers `supabase.auth.signInWithOAuth({ provider: 'google', ... })` using `expo-auth-session` + `WebBrowser.openAuthSessionAsync`
- `signOut()` — calls `supabase.auth.signOut()`
- `getSession()` — calls `supabase.auth.getSession()`
- `onAuthStateChange(callback)` — subscribes to `supabase.auth.onAuthStateChange`
- All wrapped in try-catch with `[authService.method]` logging and safe defaults

#### `contexts/AuthContext.tsx`
Supabase session context:
- On mount: `supabase.auth.getSession()` to restore session
- Subscribe to `onAuthStateChange` for real-time updates
- Exposes: `session`, `user`, `loading`, `signInWithGoogle`, `signOut`
- `loading` prevents flash of login screen while checking session

#### `app/login.tsx`
Login screen:
- App title "Nearby" + subtitle
- "Continue with Google" button
- Loading spinner during auth
- Error message on failure
- Uses `useAuth()` from AuthContext

### Modified Files

#### `lib/supabase.ts`
No changes needed — the existing client already supports auth. The `anon key` is a publishable key that works with Supabase Auth.

#### `services/index.ts`
Add: `auth: authService`

#### `app/index.tsx`
New logic:
1. Check `auth.session` first
2. No session → redirect to `/login`
3. Has session → check `identity.isOnboarded`
4. Not onboarded → redirect to `/onboarding`
5. Onboarded → redirect to `/(tabs)/nearby`

#### `contexts/IdentityContext.tsx`
Major refactor:
- Remove `generateId()`, `AsyncStorage` ID persistence
- Remove `loading` state (AuthContext handles auth loading)
- `userId` comes from `useAuth().user.id`
- `loadStoredIdentity()` → `loadProfile()` — fetches from `profiles` table
- On first login: auto-create profile from Google's `display_name` and `avatar_url`
- `resetIdentity()` → calls `signOut()` + deletes profile row
- `isOnboarded` = profile exists in DB

#### `app/onboarding.tsx`
- User is already authenticated at this point
- Pre-fill display name from Google profile data
- On save: upsert profile with `auth.user.id` and the chosen display name
- No more `generateId()` call

#### `app/_layout.tsx`
- Wrap with `AuthProvider` (outermost, before IdentityProvider)
- AuthProvider handles the font-loading loading state

### OAuth Implementation Detail (`services/auth.ts`)

```typescript
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

const redirectUri = makeRedirectUri()

async signInWithGoogle(): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) return false

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

  if (result.type !== 'success') return false

  const { data: { session }, error: sessionError } =
    await supabase.auth.setSessionFromUrl(result.url)

  return !sessionError && !!session
}
```

## Testing

- Update existing tests to mock `supabase.auth.getSession()` returning a fake session
- Test that unauthenticated users are redirected to `/login`
- Test that authenticated users see the app
- Test login flow on iOS Simulator and Android Emulator

## Edge Cases

1. **First login vs returning user**: First login creates profile from Google data; returning user fetches existing profile
2. **Network failure during auth**: Error message on login screen, retry button
3. **Session expiry**: Supabase auto-refreshes; if refresh fails, redirect to login
4. **Revoked Google access**: Next launch → no session → login screen
5. **Existing anonymous users**: Their data (messages, conversations) is tied to old UUIDs — no migration. Fresh start with auth.
6. **Sign out**: User can sign out from profile screen → session cleared → redirect to login
