# Message Requests — Design Spec

## Problem

Currently, tapping a person in a room immediately creates a conversation and allows direct messaging without any consent from the recipient. This leads to unwanted messages and spam.

## Solution

Add a `status` column to the `conversations` table that acts as a state machine. Conversations start as `pending` and the recipient must explicitly accept or decline before messaging begins.

## Schema

```sql
alter table conversations add column status text not null default 'pending'
  check (status in ('pending', 'active', 'declined'));
```

- **pending**: Initial state. Sender can see their own message. Recipient sees the message + Accept/Decline buttons.
- **active**: Recipient accepted. Full chat enabled for both.
- **declined**: Recipient declined. Hidden from both user's lists. Reuses the same row if a new request is sent later (upserts on participant pair).

The existing `unique (participant1_id, participant2_id)` constraint stays — no schema changes needed beyond the new column.

## Flows

### Tap person in room (useNearby.ts)

1. Show a cross-platform Modal with a TextInput for the request message (Alert.prompt is iOS-only)
2. On submit: upsert conversation with `status: 'pending'`, insert the first message, navigate to chat screen
3. Chat screen opens in read-only mode (sender sees their own pending request)

### Chats tab (chats.tsx / useChats.ts)

Query `conversations` with `status IN ('pending', 'active')`.

For each conversation:
- **I am the recipient + pending**: Show badge "PENDING" + Accept / Decline buttons
- **I am the sender + pending**: Show "Awaiting response" (no buttons)
- **active**: Normal display as today

On Accept: `UPDATE status = 'active'`, navigate to chat
On Decline: `UPDATE status = 'declined'` (removes from list via query filter)

### Chat screen (chat/[id].tsx / useChat.ts)

Check `conversation.status` on load:
- **pending + I am receiver**: Show the message + Accept/Decline buttons in header area. Keep input disabled.
- **pending + I am sender**: Show the message + "Waiting for them to accept" placeholder. Keep input disabled.
- **active**: Full chat as today (input enabled, realtime messages)

## UI Changes Needed

- **PersonCard / nearby.tsx**: On tap → show input modal (Alert.prompt with TextInput) instead of navigating directly
- **Chats tab**: New render logic for pending items (badge, buttons)
- **Chat screen**: Read-only state for pending, Accept/Decline buttons for recipient
- **ChatCard**: Accept new optional props: `status`, `isPendingRecipient`

## RLS

Current policy is open (`for select using (true)`). Since we don't want declined conversations visible, update:

```sql
drop policy "Public read" on conversations;
create policy "Public read active/pending" on conversations
  for select using (status in ('pending', 'active'));
```

The insert/update policies stay unchanged (open).

## Files to Modify

| File | Change |
|------|--------|
| `lib/schema.sql` | Add `status` column + RLS update |
| `app/(tabs)/useNearby.ts` | Add input modal before conversation creation |
| `app/(tabs)/useNearby.ts` | Create conversation with `status: 'pending'` |
| `app/(chat)/useChats.ts` | Filter by `status IN ('pending','active')`, add accept/decline logic |
| `app/(chat)/chats.tsx` | Render pending items with badge + buttons |
| `app/(chat)/chat/useChat.ts` | Load conversation status, gate input, add accept/decline actions |
| `app/(chat)/chat/[id].tsx` | Read-only state, Accept/Decline UI for recipient |
| `components/chat-card.tsx` | Accept status props, show badge |

## Out of Scope

- Notifications/push when a request is received (future)
- "Message requests" as a separate tab (decided to keep in Chats tab)
- Blocking request spam from same user (handled by existing blocks table)
