# Key Files for Conversation System

## Database & API
| File | Purpose |
|------|---------|
| `/supabase/migrations/20251027112648_create_conversations_tables.sql` | Database schema for conversations, messages, participants tables |
| `/src/app/api/conversations/route.ts` | GET (fetch conversations) & POST (create conversation) endpoints |
| `/src/app/api/conversations/[id]/messages/route.ts` | GET (fetch messages) & POST (send message) endpoints |

## Type Definitions
| File | Purpose |
|------|---------|
| `/src/types/inbox.ts` | Inbox types: DbConversation, DbMessage, ConversationGroup, ConversationThread, etc. |
| `/src/types/chat.ts` | Chat types: Conversation, Message, Participant, StudentContext |

## Data Fetching & Transformation
| File | Purpose |
|------|---------|
| `/src/hooks/queries/use-conversations-query.ts` | React Query hook to fetch conversations with caching & transformation |
| `/src/lib/utils/conversation-transform.ts` | Transform database conversations to UI-ready ConversationGroups |
| `/src/lib/chat/utils.ts` | Utility functions: getInitials(), getAvatarColor(), formatTime(), etc. |

## State Management & Context
| File | Purpose |
|------|---------|
| `/src/contexts/inbox-context.tsx` | Context providing stable conversation data to avoid flicker during navigation |
| `/src/hooks/use-conversation-lookup.ts` | O(1) lookup map for conversations by ID |

## Mutations & Message Sending
| File | Purpose |
|------|---------|
| `/src/hooks/mutations/use-send-message-mutation.ts` | React Query mutation hook for sending messages with optimistic updates |

## UI Components
| File | Purpose |
|------|---------|
| `/src/components/inbox/inbox-layout.tsx` | Main inbox container with 3-column layout |
| `/src/components/inbox/conversation-list.tsx` | Left sidebar: list of conversations grouped by priority |
| `/src/components/inbox/conversation-view.tsx` | Center: selected conversation with message history |
| `/src/components/inbox/metadata-sidebar.tsx` | Right sidebar: conversation metadata, student info, quick actions |
| `/src/components/inbox/conversation-list-skeleton.tsx` | Loading skeleton for conversation list |
| `/src/components/inbox/metadata-sidebar-skeleton.tsx` | Loading skeleton for metadata sidebar |

## Alternative Message Components (Mock Data)
| File | Purpose |
|------|---------|
| `/src/components/messages/conversation-content.tsx` | Alternative conversation display (uses mock data) |
| `/src/lib/mock-data/chat-data.ts` | Mock conversation and message data |

---

## Quick Reference: Creating a Conversation

### Data Required
```typescript
{
  student_id: string,    // UUID - from students table
  class_id: string,      // UUID - from classes table
  teacher_id: string,    // UUID - from teachers table (current user)
  subject?: string       // Optional topic
}
```

### API Endpoint
```
POST /api/conversations
```

### How to Use (Programmatic)
```typescript
const response = await fetch('/api/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_id: 'uuid-123',
    class_id: 'uuid-456',
    teacher_id: 'uuid-789',
    subject: 'Optional subject'
  })
})

const { conversation } = await response.json()
```

---

## How Conversations Are Listed

1. **Fetch**: `useConversationsQuery()` calls `/api/conversations`
2. **Transform**: `transformToConversationGroups()` groups by student_id
3. **Display**: `ConversationList` shows parent name as primary, student name as secondary
4. **Priority**: Shows badge/dot if 'urgent' (active + unread parent messages)
5. **Context**: `InboxProvider` keeps data stable across navigation

---

## File Paths (Absolute)

All paths are relative to the project root at:
`/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/`

Example absolute paths:
- `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/types/inbox.ts`
- `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/components/inbox/conversation-list.tsx`
- `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/supabase/migrations/20251027112648_create_conversations_tables.sql`

