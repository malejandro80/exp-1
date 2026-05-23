# Google Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace anonymous UUID-based identity with Google OAuth via Supabase Auth. Users must sign in with Google to use the app.

**Architecture:** Two new contexts: `AuthContext` (Supabase session) wraps `IdentityContext` (profile management). Google OAuth uses `expo-auth-session` + `WebBrowser.openAuthSessionAsync` with Supabase's built-in Google provider. Profiles table links to `auth.users` via FK. RLS policies switch from public to authenticated.

**Tech Stack:** Expo, Supabase Auth, `expo-auth-session`, `expo-web-browser`, Google Cloud OAuth 2.0

---

### Task 0: Google Cloud & Supabase Auth Configuration

**Manual setup — user must complete before running the app.**

- [ ] **Step 1: Create Google Cloud OAuth credentials**

  1. Go to https://console.cloud.google.com → Create a new project (or select existing)
  2. APIs & Services → OAuth consent screen → External → Add `profile` and `email` scopes
  3. Credentials → Create OAuth client ID → **Web application**
  4. Add Authorized redirect URI:
     ```
     https://vensxbhckfjojkngptxy.supabase.co/auth/v1/callback
     ```
  5. Copy the generated **Web Client ID**

- [ ] **Step 2: Enable Google provider in Supabase**

  1. Go to Supabase Dashboard → Authentication → Providers
  2. Find Google → toggle **Enable**
  3. Paste the **Web Client ID** from Google Cloud
  4. Leave **Client Secret** empty (PKCE flow)
  5. Under **Redirect URLs**, add:
     ```
     nearby://
     ```
  6. Save

---

### Task 1: Database Migration — Link Profiles to Auth + RLS Policies

**Files:**
- Modify: `lib/schema.sql`

This migration changes the profiles table to reference `auth.users` and updates all RLS policies from public to authenticated.

- [ ] **Step 1: Write the migration SQL**

Add the following migration to `lib/schema.sql` (at the bottom, after existing schema). Run this SQL in the Supabase SQL Editor.

```sql
-- ============================================================
-- Migration: Auth-gate the app (run after enabling Google Auth)
-- ============================================================

-- Step 1: Add FK constraint from profiles to auth.users
-- Existing profiles with non-matching IDs will fail — drop them first
delete from reports where reporter_id not in (select id from auth.users);
delete from reports where reported_id not in (select id from auth.users);
delete from blocks where blocker_id not in (select id from auth.users);
delete from blocks where blocked_id not in (select id from auth.users);
delete from messages where sender_id not in (select id from auth.users);
delete from conversations where participant1_id not in (select id from auth.users);
delete from conversations where participant2_id not in (select id from auth.users);
delete from profiles where id not in (select id from auth.users);

alter table profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id)
  on delete cascade;

-- Step 2: Drop all existing public policies
drop policy if exists "Public read" on profiles;
drop policy if exists "Public insert" on profiles;
drop policy if exists "Public update" on profiles;
drop policy if exists "Public read" on rooms;
drop policy if exists "Public insert" on rooms;
drop policy if exists "Public read active/pending" on conversations;
drop policy if exists "Public insert" on conversations;
drop policy if exists "Public update" on conversations;
drop policy if exists "Public read" on messages;
drop policy if exists "Public insert" on messages;
drop policy if exists "Public read" on blocks;
drop policy if exists "Public insert" on blocks;
drop policy if exists "Public read" on reports;
drop policy if exists "Public insert" on reports;

-- Step 3: Create auth-gated policies

-- Profiles: anyone can read, only owner can insert/update
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can create their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Rooms: public read, admin insert (same as before)
create policy "Rooms are publicly readable"
  on rooms for select using (true);

create policy "Authenticated users can create rooms"
  on rooms for insert with check (auth.role() = 'authenticated');

-- Conversations: only participants can read, auth user is one participant
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

-- Messages: only conversation participants can read/insert
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

-- Blocks: users can only manage their own blocks
create policy "Users can view their own blocks"
  on blocks for select using (auth.uid() = blocker_id);

create policy "Users can block others"
  on blocks for insert with check (auth.uid() = blocker_id);

-- Reports: users can only manage their own reports
create policy "Users can view their own reports"
  on reports for select using (auth.uid() = reporter_id);

create policy "Users can report others"
  on reports for insert with check (auth.uid() = reporter_id);
```

- [ ] **Step 2: Apply the migration**

Run the SQL above in the Supabase Dashboard SQL Editor.

- [ ] **Step 3: Verify**

```sql
-- Check that the FK was created
select * from information_schema.table_constraints
where constraint_name = 'profiles_id_fkey';

-- Check a policy exists
select * from pg_policies where tablename = 'profiles';
```

---

### Task 2: Auth Service

**Files:**
- Create: `services/auth.ts`
- Modify: `services/index.ts`

- [ ] **Step 1: Create `services/auth.ts`**

```typescript
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

WebBrowser.maybeCompleteAuthSession()

const redirectUri = makeRedirectUri()

export interface AuthState {
  session: Session | null
  user: User | null
}

export const authService = {
  async signInWithGoogle(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      })

      if (error || !data.url) {
        console.error('[authService.signInWithGoogle]', error?.message ?? 'No URL returned')
        return false
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

      if (result.type !== 'success') {
        console.error('[authService.signInWithGoogle] Auth cancelled or failed:', result.type)
        return false
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSessionFromUrl(result.url)

      if (sessionError) {
        console.error('[authService.signInWithGoogle] Session error:', sessionError.message)
        return false
      }

      return !!sessionData.session
    } catch (err) {
      console.error('[authService.signInWithGoogle] Unexpected error:', err)
      return false
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[authService.signOut]', error.message)
      }
    } catch (err) {
      console.error('[authService.signOut] Unexpected error:', err)
    }
  },

  async getSession(): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('[authService.getSession]', error.message)
        return { session: null, user: null }
      }
      return {
        session: data.session,
        user: data.session?.user ?? null,
      }
    } catch (err) {
      console.error('[authService.getSession] Unexpected error:', err)
      return { session: null, user: null }
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  },
}
```

- [ ] **Step 2: Test the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Export from services facade**

Modify `services/index.ts`:

```typescript
// At the top, add import:
import { authService } from './auth'

// In the api object, add:
export const api = {
  auth: authService,
  profiles: profileService,
  rooms: roomService,
  conversations: conversationService,
  messages: messageService,
  blocks: blockService,
  reports: reportService,
}
```

- [ ] **Step 4: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add services/auth.ts services/index.ts
git commit -m "feat: add auth service with Google OAuth"
```

---

### Task 3: AuthContext

**Files:**
- Create: `contexts/AuthContext.tsx`

- [ ] **Step 1: Create `contexts/AuthContext.tsx`**

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { api } from '@/services'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signInWithGoogle: async () => false,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = async () => {
    const state = await api.auth.getSession()
    setSession(state.session)
    setUser(state.user)
    setLoading(false)
  }

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    const { data: { subscription } } = api.auth.onAuthStateChange((updatedSession) => {
      setSession(updatedSession)
      setUser(updatedSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const ok = await api.auth.signInWithGoogle()
    return ok
  }

  const signOut = async () => {
    await api.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add contexts/AuthContext.tsx
git commit -m "feat: add AuthContext for Supabase session management"
```

---

### Task 4: Login Screen

**Files:**
- Create: `app/login.tsx`
- Create: `app/login.styles.ts`

- [ ] **Step 1: Create `app/login.styles.ts`**

```typescript
import { StyleSheet } from 'react-native'
import { Colors, Spacing, Radius } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl * 2,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.controlBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.06)',
    gap: Spacing.sm,
    minWidth: 260,
  },
  googleButtonDisabled: {
    opacity: 0.4,
  },
  googleIcon: {
    fontSize: 20,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  loader: {
    marginTop: Spacing.xl,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
})
```

- [ ] **Step 2: Create `app/login.tsx`**

```typescript
import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './login.styles'
import { useAuth } from '@/contexts/AuthContext'

const LoginScreen = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const ok = await signInWithGoogle()
    setLoading(false)
    if (!ok) {
      setError('Could not sign in. Please try again.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nearby</Text>
      <Text style={styles.subtitle}>Connect with people around you</Text>

      <TouchableOpacity
        style={[styles.googleButton, loading && styles.googleButtonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleButtonText}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.disclaimer}>
        Your location is only shared while the app is open.{'\n'}
        You can block or report users at any time.
      </Text>
    </SafeAreaView>
  )
}

export default LoginScreen
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/login.tsx app/login.styles.ts
git commit -m "feat: add Google login screen"
```

---

### Task 5: Update App Layout and Index Redirect

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: Modify `app/_layout.tsx` to wrap with AuthProvider**

Add AuthProvider as the outermost provider (before IdentityProvider):

```typescript
// At the top, add import:
import { AuthProvider } from '@/contexts/AuthContext'

// Wrap providers:
return (
    <AuthProvider>
      <IdentityProvider>
        <LocationProvider>
          <RoomProvider>
            <RootScreens />
            <StatusBar style="auto" />
          </RoomProvider>
        </LocationProvider>
      </IdentityProvider>
    </AuthProvider>
  )
```

- [ ] **Step 2: Modify `app/index.tsx` to check auth session first**

```typescript
import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useIdentity } from '@/contexts/IdentityContext'

const Index = () => {
  const { user, loading: authLoading } = useAuth()
  const { isOnboarded, loading: profileLoading } = useIdentity()

  if (authLoading || profileLoading) {
    return null // or a splash/loading component
  }

  if (!user) {
    return <Redirect href="/login" />
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />
  }

  return <Redirect href="/(tabs)/nearby" />
}

export default Index
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx app/index.tsx
git commit -m "feat: add AuthProvider to layout, update index redirect to check auth"
```

---

### Task 6: Refactor IdentityContext to Use Auth

**Files:**
- Modify: `contexts/IdentityContext.tsx`
- Modify: `constants/storage.ts`

- [ ] **Step 1: Rewrite `contexts/IdentityContext.tsx`**

Replace the entire file with a version that derives `userId` from AuthContext:

```typescript
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/services'
import { useAuth } from './AuthContext'
import type { Profile } from '@/lib/types'

interface IdentityState {
  userId: string | null
  displayName: string
  avatarUrl: string | null
  isOnboarded: boolean
  loading: boolean
  setDisplayName: (name: string) => Promise<void>
  signOut: () => Promise<void>
}

const IdentityContext = createContext<IdentityState>({
  userId: null,
  displayName: '',
  avatarUrl: null,
  isOnboarded: false,
  loading: true,
  setDisplayName: async () => {},
  signOut: async () => {},
})

export const IdentityProvider = ({ children }: { children: ReactNode }) => {
  const { user, signOut: authSignOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = user?.id ?? null

  const fetchProfile = async () => {
    if (!userId) return
    const existing = await api.profiles.get(userId)
    setProfile(existing)
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const setDisplayName = async (name: string) => {
    if (!userId) return
    const ok = await api.profiles.upsert({
      id: userId,
      display_name: name,
      last_seen: new Date().toISOString(),
    })
    if (ok) {
      setProfile((prev) => prev ? { ...prev, display_name: name } : null)
    }
  }

  const signOut = useCallback(async () => {
    await authSignOut()
  }, [authSignOut])

  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? ''
  const isOnboarded = !!profile

  return (
    <IdentityContext.Provider value={{ userId, displayName, avatarUrl, isOnboarded, loading, setDisplayName, signOut }}>
      {children}
    </IdentityContext.Provider>
  )
}

export const useIdentity = () => useContext(IdentityContext)
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Check all consumers of IdentityContext**

Check that `app/index.tsx`, `app/onboarding.tsx`, `app/(tabs)/profile.tsx`, `contexts/LocationContext.tsx`, `contexts/RoomContext.tsx`, `app/(tabs)/useNearby.ts`, `app/(tabs)/useProfile.ts`, `app/(chat)/chat/useChat.ts` still work with the new IdentityState interface.

Key things that changed:
- `userId` can still be `string | null` (now from auth.user.id instead of generated)
- `displayName` is still `string` (now from profile or Google metadata)
- `isOnboarded` is now `!!profile` (profile exists in DB)
- `resetIdentity` is removed → replaced by `signOut`
- `setDisplayName` is still the same

- [ ] **Step 4: Commit**

```bash
git add contexts/IdentityContext.tsx
git commit -m "feat: refactor IdentityContext to use auth user ID"
```

---

### Task 7: Update Onboarding Screen

**Files:**
- Modify: `app/onboarding.tsx`

- [ ] **Step 1: Update `app/onboarding.tsx`**

Replace the file with a version that pre-fills from Google profile data and uses `auth.user.id`:

```typescript
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useIdentity } from '@/contexts/IdentityContext'
import { Colors, Spacing, Radius } from '@/constants/theme'
import { DISPLAY_NAME_MAX_LENGTH } from '@/constants/rules'

const OnboardingScreen = () => {
  const { displayName, setDisplayName } = useIdentity()
  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    await setDisplayName(name.trim())
    setSaving(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Choose your display name</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.light.textMuted}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoFocus
            autoCorrect={false}
          />
          <Text style={styles.hint}>This is visible to everyone nearby.</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!name.trim() || saving) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim() || saving}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing.xxl + Spacing.lg },
  title: { fontSize: 42, fontWeight: '800', color: Colors.light.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  form: { marginBottom: Spacing.xxl },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.light.controlBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg + 2,
    paddingVertical: Spacing.lg,
    fontSize: 18,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.06)',
  },
  hint: { fontSize: 12, color: Colors.light.textTertiary, marginTop: Spacing.sm, lineHeight: 18 },
  button: {
    backgroundColor: Colors.light.brand,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
})
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/onboarding.tsx
git commit -m "feat: update onboarding to work with auth profiles"
```

---

### Task 8: Update Profile Screen — Sign Out

**Files:**
- Modify: `app/(tabs)/profile.tsx`

- [ ] **Step 1: Read current profile screen**

Read `app/(tabs)/profile.tsx` and add a "Sign Out" button that calls `identity.signOut()`.

- [ ] **Step 2: Add sign out button**

Add a sign-out button (destructive style) below the existing content. On press, call `identity.signOut()` which triggers `authSignOut()` → redirects to login via `app/index.tsx`.

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: add sign out button to profile screen"
```

---

### Task 9: Update Tests

**Files:**
- Modify: `__tests__/chats-tab.test.tsx`

- [ ] **Step 1: Update existing tests to mock Supabase auth**

The existing test for the chats tab mocks `supabase` directly. Add mock for `supabase.auth.getSession` to return a fake session:

```typescript
// Before any test, add auth mock:
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' },
            access_token: 'fake-token',
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      setSessionFromUrl: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
        neq: jest.fn(() => ({
          gte: jest.fn(() => ({
            not: jest.fn(() => ({
              not: jest.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
        })),
      })),
      insert: jest.fn().mockResolvedValue({ error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}))
```

- [ ] **Step 2: Run tests**

Run: `npx jest`
Expected: All tests pass (16 passed)

- [ ] **Step 3: Commit**

```bash
git add __tests__/chats-tab.test.tsx
git commit -m "test: update mocks for Supabase Auth"
```

---

### Final Verification

- [ ] **Run full check suite**

```bash
npx expo lint && npx tsc --noEmit && npx jest
```

Expected: 0 lint errors, 0 TypeScript errors, 16+ tests pass

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete Google Login integration"
```
