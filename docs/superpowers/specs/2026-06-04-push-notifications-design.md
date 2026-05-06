# Push Notifications for Promotions — Design Spec

## Overview

Automatic push notifications for room promotions in the Nearby app. When an admin creates a promotion, all nearby active users in that room's geo-fence receive a push notification via Expo Push API.

## Architecture

```
Promotion INSERT
       │
       ▼
Supabase Database Webhook (promotions table, INSERT event)
       │
       ▼
send-promotion Edge Function
  - Reads promotion + room data
  - Finds nearby active profiles (< 15 min since last_seen, within room radius)
  - Looks up their Expo push tokens
  - Sends via Expo Push API
  - Processes Expo response: removes DeviceNotRegistered tokens
       │
       ▼
User receives push notification
       │
       ▼
User taps notification → app opens promotion/[id] modal
```

## Trigger

- **Type**: Supabase Database Webhook
- **Table**: `promotions`
- **Event**: `INSERT`
- **Target**: `send-promotion` Edge Function
- **HTTP Method**: POST (Supabase webhooks call Edge Functions directly)

## Edge Function Changes

### Current (`supabase/functions/send-promotion/index.ts`)

Already has:
- Promotion lookup with room join
- Geo-filtering of nearby active profiles via haversine
- Push token lookup and Expo API call

### Changes needed

1. **Accept webhook payload format** — Supabase webhooks send `{ type: 'INSERT', table: 'promotions', record: {...}, ... }`. The function must extract `record.id` as the `promotion_id`.
2. **Process Expo response errors** — On `DeviceNotRegistered`, delete the token from `push_tokens`.
3. **Remove hardcoded emoji** from title (per L-020: strings in labels, no emoji in code).

## App Changes

### Deep linking on notification tap

When a user taps a promotion notification, the app should navigate to the promotion detail modal at `promotion/[id]`.

Implementation in `app/_layout.tsx`:
- Use `Notifications.addNotificationResponseReceivedListener` to listen for taps
- Extract `data.type` and `data.promotion_id` from the notification payload
- Navigate to `promotion/${promotion_id}` via `router.push()`
- Handle both foreground (app already open) and background/closed states (`getInitialNotificationAsync`)

### Code structure

- Add notification response listener in `_layout.tsx` alongside the existing `PushTokenRegister` component
- Extract navigation logic to a dedicated handler function
- Add labels to `constants/labels.ts`

## Notification Design

| Field | Value |
|-------|-------|
| Title | `{promotion.title}` (no emoji) |
| Body | `promotion.description` or fallback `"New promotion at {room.name}!"` |
| Data | `{ type: 'promotion', promotion_id: string, room_id: string }` |
| Sound | Default (already configured in handler) |
| Alert | Show in both foreground and background |

## Error Handling

- **DeviceNotRegistered** — Delete the push token from `push_tokens` table
- **No nearby profiles** — Return `{ sent: 0 }` (already done)
- **No push tokens** — Return `{ sent: 0 }` (already done)
- **Promotion not found** — Return 404 (already done)

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/send-promotion/index.ts` | Accept webhook format, process Expo errors, remove emoji |
| `app/_layout.tsx` | Add notification tap listener for deep linking |
| `constants/labels.ts` | Add notification-related labels |
| `__tests__/push-notifications.test.tsx` | Unit tests for deep link logic |

## Out of Scope

- Direct message push notifications (future feature)
- Conversation request notifications (future feature)
- Notification badges / unread counts
- Push token refresh handling (token is registered on login already via `PushTokenRegister`)
