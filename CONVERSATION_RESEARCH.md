# Conversation and Messaging System - Research Report

## Executive Summary

This application has a complete parent-teacher messaging system built on Supabase. Teachers can view conversations with parents about specific students, create new conversations, send/receive messages, and manage conversation statuses. Conversations are organized by student and displayed in the UI grouped by priority level.

---

## 1. Database Structure

### Three Main Tables

#### 1.1 `conversations` Table
Stores conversation threads between teachers and parents about students.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'archived', 'resolved')),
  subject TEXT,  -- Optional topic (e.g., "Math Performance")
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_conversations_student` - Fetch conversations for a student
- `idx_conversations_teacher` - Fetch conversations for a teacher
- `idx_conversations_class` - Fetch conversations for a class
- `idx_conversations_last_message` - Order conversations by recent activity
- `idx_conversations_status` - Filter by status

**Status Values:**
- `'active'` - Ongoing conversation
- `'archived'` - No longer active but kept for history
- `'resolved'` - Issue/topic has been addressed

#### 1.2 `conversation_messages` Table
Stores individual messages within conversations.

```sql
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('teacher', 'parent')),
  sender_name TEXT NOT NULL,  -- Display name (e.g., "Mrs. Tan")
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_messages_conversation` - Fetch messages for a conversation (ordered by date)
- `idx_messages_unread` - Count unread messages efficiently

#### 1.3 `conversation_participants` Table
Stores participants in each conversation.

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('teacher', 'parent')),
  participant_name TEXT NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Constraint:** Unique participants per conversation (prevents duplicates)

---

## 2. API Routes

### 2.1 GET `/api/conversations`
**Purpose:** List all conversations for the current teacher

**Query Parameters:**
- `teacherId` (optional) - Filter conversations by teacher ID

**Request:**
```bash
GET /api/conversations?teacherId=<teacher-uuid>
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "class_id": "uuid",
      "teacher_id": "uuid",
      "status": "active",
      "subject": "Math Performance",
      "last_message_at": "2025-11-04T10:30:00Z",
      "created_at": "2025-10-20T09:00:00Z",
      "updated_at": "2025-11-04T10:30:00Z",
      "unread_count": 2,
      "latest_message": {
        "id": "msg-uuid",
        "sender_type": "parent",
        "sender_name": "Mrs. Wong",
        "content": "Thank you for the update",
        "created_at": "2025-11-04T10:30:00Z",
        "read": false
      },
      "student": {
        "id": "uuid",
        "name": "John Lee",
        "student_id": "LEE-123"
      },
      "class": {
        "id": "uuid",
        "name": "5A"
      },
      "messages": [
        {
          "id": "msg-uuid",
          "content": "...",
          "sender_name": "...",
          "sender_type": "teacher|parent",
          "created_at": "...",
          "read": false
        }
      ]
    }
  ],
  "total": 15
}
```

---

### 2.2 POST `/api/conversations`
**Purpose:** Create a new conversation

**Request Body:**
```json
{
  "student_id": "uuid",      // REQUIRED
  "class_id": "uuid",        // REQUIRED
  "teacher_id": "uuid",      // REQUIRED
  "subject": "String"        // OPTIONAL - conversation topic
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "conversation": {
    "id": "newly-created-uuid",
    "student_id": "uuid",
    "class_id": "uuid",
    "teacher_id": "uuid",
    "status": "active",
    "subject": "Math Performance",
    "last_message_at": "2025-11-04T10:30:00Z",
    "created_at": "2025-11-04T10:30:00Z",
    "updated_at": "2025-11-04T10:30:00Z",
    "student": { ... },
    "class": { ... }
  }
}
```

**Validation:**
- `student_id` is required (returns 400 if missing)
- `class_id` is required (returns 400 if missing)
- `teacher_id` is required (returns 400 if missing)

---

### 2.3 GET `/api/conversations/[id]/messages`
**Purpose:** Fetch messages for a specific conversation

**Request:**
```bash
GET /api/conversations/conv-uuid/messages
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-uuid",
      "conversation_id": "conv-uuid",
      "sender_type": "teacher",
      "sender_name": "Mr. Tan",
      "content": "Hello, I wanted to discuss...",
      "read": true,
      "created_at": "2025-11-01T09:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "conversation_id": "conv-uuid",
      "sender_type": "parent",
      "sender_name": "Mrs. Wong",
      "content": "Thank you for reaching out",
      "read": false,
      "created_at": "2025-11-02T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 2.4 POST `/api/conversations/[id]/messages`
**Purpose:** Send a new message to a conversation

**Request Body:**
```json
{
  "sender_type": "teacher|parent",  // REQUIRED
  "sender_name": "Mrs. Tan",        // REQUIRED - display name
  "content": "Hello parent..."      // REQUIRED - message text
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": {
    "id": "new-msg-uuid",
    "conversation_id": "conv-uuid",
    "sender_type": "teacher",
    "sender_name": "Mr. Tan",
    "content": "Your message here",
    "read": false,
    "created_at": "2025-11-04T10:30:00Z"
  }
}
```

**Side Effects:**
- Updates the `conversations.last_message_at` timestamp to current time
- Marks message as unread (`read: false`) by default

**Validation:**
- `content` cannot be empty (400 if missing/blank)
- `sender_type` must be 'teacher' or 'parent' (400 if invalid)
- `sender_name` is required (400 if empty)

---

## 3. Data Types and Interfaces

### 3.1 Type Definitions

**File:** `/src/types/inbox.ts`

```typescript
// Database records (match Supabase schema)
export interface DbConversation {
  id: string
  student_id: string
  class_id: string
  teacher_id: string
  status: ConversationStatus  // 'active' | 'archived' | 'resolved'
  subject?: string | null
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  sender_type: 'teacher' | 'parent'
  sender_name: string
  content: string
  read: boolean
  created_at: string
}

// API responses
export interface EnrichedConversation extends DbConversation {
  student?: {
    id: string
    name: string
    class_id: string
    class_name: string
  }
  messages?: DbMessage[]
  participants?: DbParticipant[]
  unread_count?: number
}

// Request interfaces
export interface CreateConversationRequest {
  student_id: string
  class_id: string
  teacher_id: string
  subject?: string
}

export interface SendMessageRequest {
  sender_type: 'teacher' | 'parent'
  sender_name: string
  content: string
}
```

### 3.2 UI-Specific Types

**File:** `/src/types/chat.ts`

```typescript
export interface Conversation {
  id: string
  type: '1:1' | 'group'  // Always '1:1' for parent-teacher
  participants: Participant[]
  studentContext: StudentContext
  lastMessage?: Message
  lastMessageAt: Date
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  createdAt: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'parent'
  type: 'text' | 'file' | 'system'
  content: string
  attachments: Attachment[]
  sentAt: Date
  status: 'sending' | 'sent' | 'delivered' | 'failed'
  readBy: Array<{ userId: string; readAt: Date }>
}

export interface StudentContext {
  studentId: string
  studentName: string
  className?: string
}
```

---

## 4. How Conversations Are Fetched and Organized

### 4.1 Query Hook: `useConversationsQuery`

**Location:** `/src/hooks/queries/use-conversations-query.ts`

```typescript
// Usage
const { data: conversationGroups, isLoading, error, refetch } = useConversationsQuery({
  teacherId: user?.user_id,
  enabled: !!user?.user_id
})
```

**Features:**
- Caches conversations by teacher ID
- Transforms raw database data into UI-ready groups
- Refetches on mount if data is > 30 seconds old
- Does NOT refetch on window focus (better UX)
- Keeps previous data during refetch to prevent UI flicker

### 4.2 Data Transformation: `transformToConversationGroups`

**Location:** `/src/lib/utils/conversation-transform.ts`

**Process:**
1. Groups conversations by `student_id` (conversations with same parent about same student are grouped)
2. Converts each group into a `ConversationGroup` structure:
   - `student` - Student information (name, class, etc.)
   - `threads` - Array of conversation threads for this student
   - `priority` - Overall priority ('urgent', 'active', 'follow-up', 'resolved')
   - `unreadCount` - Total unread messages from parent
   - `lastActivityAt` - Most recent message timestamp
   - `needsReply` - Whether conversation has unread parent messages

**Priority Determination:**
```typescript
// Priority logic
if (hasUnreadActivConversations) return 'urgent'    // Active + has unread parent messages
if (hasAnyActiveConversation) return 'active'       // Active but no unread
if (allResolved) return 'resolved'                  // All conversations resolved
return 'follow-up'                                  // Default
```

### 4.3 Inbox Context: `useInbox`

**Location:** `/src/contexts/inbox-context.tsx`

Provides stable conversation data across the entire inbox navigation.

```typescript
// Usage in components
const { conversationGroups, isLoading, error, refetch } = useInbox()

// The context keeps the last valid data in a ref
// This prevents showing empty state during navigation transitions
```

---

## 5. Conversation List Display

### 5.1 ConversationList Component

**Location:** `/src/components/inbox/conversation-list.tsx`

**Features:**
- Displays conversations grouped by priority when filter is 'all'
- Shows parent name as primary text (displayed by name, not student)
- Shows student name and class as secondary text
- Shows unread count as a priority dot
- Searchable by student name or parent name
- Filterable by priority: 'all', 'urgent', 'follow-up', 'active', 'resolved'
- Shows time since last message (e.g., "5m", "2h", "Yesterday")

**Key Display:**
```
Priority Dot (if urgent)  Avatar (Parent Initials)
[RED]                     [JD]
                         Mrs. Jane Doe (Parent Name)
                         John Lee 5A (Student + Class)
                                        5 hours ago
                         Last message preview...
```

---

## 6. Creating a New Conversation Programmatically

### 6.1 Direct API Call

```typescript
async function createConversation(
  studentId: string,
  classId: string,
  teacherId: string,
  subject?: string
) {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      class_id: classId,
      teacher_id: teacherId,
      subject: subject || null
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create conversation')
  }

  return await response.json()
}
```

### 6.2 Required Data

To start a conversation with a parent, you need:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | UUID | Yes | The student ID (from `students` table) |
| `class_id` | UUID | Yes | The class ID (from `classes` table) |
| `teacher_id` | UUID | Yes | The teacher ID creating the conversation |
| `subject` | String | No | Optional topic (e.g., "Math Performance", "Behavior Concern") |

### 6.3 Where to Get This Data

**Student ID & Class ID:**
- Available from the `/api/student` endpoints
- Can be found in the PTM view (Parent-Teacher Meetings)
- Available in classroom student lists

**Teacher ID:**
- Available from authenticated user context (`user?.user_id`)
- From `useUser()` hook context

**Example: From PTM Context**
```typescript
// From PTM page, student data includes:
const ptmStudent = {
  student_id: "uuid-123",
  name: "John Lee",
  class_id: "class-uuid",
  class_name: "5A"
}

// Create conversation
const { conversation } = await createConversation(
  ptmStudent.student_id,
  ptmStudent.class_id,
  teacherId,
  "PTM Follow-up Discussion"
)
```

---

## 7. Sending Messages

### 7.1 useSendMessageMutation Hook

**Location:** `/src/hooks/mutations/use-send-message-mutation.ts`

```typescript
const sendMessageMutation = useSendMessageMutation(teacherId)

// Send a message
sendMessageMutation.mutate({
  conversationId: 'conv-uuid',
  content: 'Hello, I wanted to discuss...',
  senderType: 'teacher',
  senderName: 'Mr. Tan'
})
```

**Features:**
- Optimistic updates (message appears immediately)
- Automatic rollback on error
- Cache invalidation to keep conversation list fresh
- Shows 'sending' status during transmission

### 7.2 How It's Used in UI

**File:** `/src/components/inbox/conversation-view.tsx`

```typescript
const handleSendMessage = async () => {
  if (!conversation || !newMessage.trim()) return

  sendMessageMutation.mutate({
    conversationId: conversation.id,
    content: newMessage.trim(),
    senderType: 'teacher',
    senderName: user?.name || 'Teacher'
  })

  setNewMessage('')  // Clear input immediately
}
```

---

## 8. Conversation Status Management

### 8.1 Status Values

| Status | Meaning | Use Case |
|--------|---------|----------|
| `active` | Ongoing conversation | Default for new conversations |
| `archived` | No longer active | Parent conversation still visible but marked as inactive |
| `resolved` | Issue addressed | Conversation has been resolved/concluded |

### 8.2 Current Implementation

- Conversations are created with status `'active'`
- Status can be updated via direct database mutation (not yet exposed in UI)
- Displayed as badge in metadata sidebar

---

## 9. Key Components and Their Roles

| Component | Location | Purpose |
|-----------|----------|---------|
| `InboxLayout` | `/src/components/inbox/inbox-layout.tsx` | Main inbox container with 3-column layout |
| `ConversationList` | `/src/components/inbox/conversation-list.tsx` | Left sidebar showing all conversations |
| `ConversationView` | `/src/components/inbox/conversation-view.tsx` | Center panel showing selected conversation |
| `MetadataSidebar` | `/src/components/inbox/metadata-sidebar.tsx` | Right sidebar with conversation metadata |
| `InboxProvider` | `/src/contexts/inbox-context.tsx` | Context providing stable conversation data |

---

## 10. Current Limitations & Gaps

### No Existing "Start Conversation" Button
The "New Chat" button in `conversation-list.tsx` (line 97) is visible but not connected to create conversation logic.

### No Create Conversation Form
There's no UI component to:
- Select a student
- Enter a subject
- Create a new conversation

### Missing Features
- Mark conversations as resolved/archived in UI
- Edit conversation subject
- Delete conversations
- Pin important conversations
- Mute conversation notifications

---

## 11. Row Level Security (RLS)

All conversation tables have RLS enabled:

```sql
-- Teachers can only view/edit their own conversations
CREATE POLICY "Teachers can view their students' conversations"
  ON conversations FOR SELECT
  USING (teacher_id = auth.uid()::uuid);

CREATE POLICY "Teachers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (teacher_id = auth.uid()::uuid);

-- Development policies allow all operations (for testing)
CREATE POLICY "Allow all operations in dev"
  USING (true) WITH CHECK (true);
```

---

## Summary

The conversation system is:
- **Database-driven** with Supabase tables for conversations, messages, and participants
- **API-based** with RESTful endpoints for CRUD operations
- **Optimized** for querying by teacher/student with proper indexes
- **Real-time capable** (messages update `last_message_at` automatically)
- **Priority-aware** (groups conversations by priority for quick triage)
- **Listed by parent name** (conversations are grouped by student, showing parent name as primary identifier)

To create a conversation, you need: `student_id`, `class_id`, `teacher_id`, and optionally `subject`. The system will initialize it with `status: 'active'` and wait for messages to be sent.
