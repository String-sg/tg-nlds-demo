# Feature Plan: Message Parents Button Update

## Overview

Update the "Message Parents" button in the student profile component to navigate users to the Parents & Communications tab and automatically start (or open existing) conversation with the student's parent/guardian.

## Current State Analysis

### Student Profile Component
**Location**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/components/student-profile.tsx`

**Current Implementation** (Lines 185-200):
```tsx
<Button
  variant="outline"
  size="sm"
  className="w-full"
  onClick={() => {
    // Check if conversation exists for this student
    // In real app, would query backend to find or create conversation
    // For now, navigate to inbox with conversation #1 as demo (Bryan Yeo's parents)
    router.push('/inbox/conv-1')
  }}
>
  <MessageSquare className="w-4 h-4 mr-2" />
  Message Parents
</Button>
```

**Issues**:
- Hardcoded navigation to `/inbox/conv-1`
- No logic to find existing conversation
- No logic to create new conversation if none exists
- No context passing to identify which student's parent to message

**Available Data**:
```tsx
studentData.guardian: {
  name: string
  email: string | null
  phone: string
  relationship: string
} | null
```

### Conversation System
**API Endpoints**:
- `GET /api/conversations` - Fetch all conversations for teacher
- `POST /api/conversations` - Create new conversation
  - Required: `student_id`, `class_id`, `teacher_id`
  - Optional: `subject`

**Navigation Pattern**:
- `/inbox` - Opens inbox in default chat tab
- `/inbox/{conversationId}` - Opens specific conversation

**Conversation Listing**:
- Conversations are grouped by student
- Displayed with parent name as primary identifier
- Each group shows: parent name, student name, class

## Requirements

### Functional Requirements

1. **Find Existing Conversation**
   - When button is clicked, check if conversation already exists for this student
   - Use student ID to search existing conversations
   - If found, navigate to that conversation

2. **Create New Conversation**
   - If no conversation exists, create one automatically
   - Use student ID, class ID, and current teacher ID
   - Set appropriate subject (e.g., "Conversation with [Parent Name]")

3. **Navigate to Inbox**
   - Navigate to `/inbox/{conversationId}` with the found/created conversation ID
   - Ensure conversation is highlighted in the conversation list
   - Load conversation view with message history (if existing) or empty state (if new)

4. **Parent Context**
   - Ensure parent name is properly displayed in conversation list
   - Link conversation to student's primary guardian
   - Display guardian information in metadata sidebar

5. **Error Handling**
   - Handle case where student has no guardian
   - Handle API failures gracefully
   - Show user-friendly error messages

### Technical Requirements

1. **Data Flow**
   - Student profile → Click "Message Parents" button
   - Check existing conversations via API/cache
   - Create conversation if needed via POST API
   - Navigate to `/inbox/{conversationId}`
   - InboxLayout loads conversation and displays it

2. **State Management**
   - Use React Query for conversation lookup/creation
   - Utilize existing `useConversationsQuery` hook
   - Implement optimistic navigation with loading state

3. **User Experience**
   - Show loading state while checking/creating conversation
   - Disable button during operation to prevent double-clicks
   - Provide feedback on success/error

## Implementation Plan

### Step 1: Create Conversation Helper Function

**File**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/lib/conversation-helpers.ts` (new file)

**Purpose**: Encapsulate logic for finding or creating conversations

**Function**: `findOrCreateConversation(studentId: string, classId: string, teacherId: string)`

**Logic**:
1. Fetch all conversations for teacher (use existing query or API call)
2. Filter conversations by `student_id` matching the target student
3. If conversation exists (status: 'active' or 'archived'), return its ID
4. If no conversation exists:
   - Create new conversation via POST `/api/conversations`
   - Return new conversation ID
5. Handle errors and return appropriate response

**Return Type**:
```tsx
{
  conversationId: string | null
  isNewConversation: boolean
  error?: string
}
```

### Step 2: Create Custom Hook for Message Parent Action

**File**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/hooks/use-message-parent.ts` (new file)

**Purpose**: Provide a reusable hook for triggering message parent action

**Hook**: `useMessageParent()`

**Features**:
- Uses React Query mutation for creating conversations
- Provides loading state
- Handles navigation after success
- Returns error state for UI feedback

**Return Value**:
```tsx
{
  messageParent: (studentId: string, classId: string, guardianName: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

**Implementation Details**:
- Use `useMutation` from React Query
- Invalidate conversations query after creating new conversation
- Use `useRouter` for navigation
- Handle edge cases (no guardian, API errors)

### Step 3: Update Student Profile Component

**File**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/components/student-profile.tsx`

**Changes**:

1. **Import new hook**:
```tsx
import { useMessageParent } from '@/hooks/use-message-parent'
```

2. **Use hook in component**:
```tsx
const { messageParent, isLoading, error } = useMessageParent()
```

3. **Update button onClick handler**:
```tsx
const handleMessageParent = async () => {
  // Validate guardian exists
  if (!studentData.guardian) {
    toast.error('No guardian information available for this student')
    return
  }

  // Call messageParent function
  await messageParent(
    studentData.student_id,
    studentData.form_class_id || '',
    studentData.guardian.name
  )
}
```

4. **Update button component**:
```tsx
<Button
  variant="outline"
  size="sm"
  className="w-full"
  onClick={handleMessageParent}
  disabled={isLoading || !studentData.guardian}
>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Opening conversation...
    </>
  ) : (
    <>
      <MessageSquare className="w-4 h-4 mr-2" />
      Message Parents
    </>
  )}
</Button>
```

5. **Add error display** (optional toast or inline error):
```tsx
{error && (
  <p className="text-xs text-red-500 mt-1">{error}</p>
)}
```

### Step 4: Update API Endpoint for Finding Conversations

**File**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/app/api/conversations/route.ts`

**Enhancement**: Ensure GET endpoint supports filtering by student_id via query parameter

**Current**: Returns all conversations for teacher
**Update**: Add optional `student_id` query parameter for filtering

**Example**:
```tsx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')

  // ... existing auth logic

  let query = supabase
    .from('conversations')
    .select('*')
    .eq('teacher_id', teacherId)

  // Filter by student if provided
  if (studentId) {
    query = query.eq('student_id', studentId)
  }

  // ... rest of logic
}
```

This allows efficient lookup: `GET /api/conversations?student_id={studentId}`

### Step 5: Ensure Conversation List Context

**Verification**: Confirm conversation list properly displays parent name

**Current Implementation**:
- Conversations are transformed via `transformToConversationGroups()`
- Groups show student info and parent name
- Already working correctly based on research

**Action**: No changes needed - existing implementation already handles parent name display

**Validation Points**:
1. Conversation includes `student_id` foreign key
2. Student data includes primary guardian info
3. ConversationList displays guardian name from student relationship

### Step 6: Handle Edge Cases

**Scenarios to Handle**:

1. **No Guardian Data**:
   - Disable "Message Parents" button
   - Show tooltip: "No guardian information available"
   - Consider adding visual indicator

2. **No Class ID**:
   - Use form_class_id from student data
   - If null, show error message
   - Button should be disabled if class_id is missing

3. **Conversation Creation Fails**:
   - Show error toast
   - Allow retry
   - Log error for debugging

4. **Multiple Conversations for Same Student** (edge case):
   - Return most recent active conversation
   - Or allow teacher to choose (future enhancement)

5. **Network Errors**:
   - Show retry option
   - Cache the action for retry
   - Display user-friendly error message

### Step 7: Add Loading and Success States

**Loading State**:
- Disable button
- Show spinner icon
- Update text to "Opening conversation..."

**Success State**:
- Navigate to inbox with conversation
- Show toast: "Conversation opened with [Parent Name]"
- Highlight conversation in list

**Implementation**:
```tsx
// In useMessageParent hook
const messageParent = async (studentId, classId, guardianName) => {
  try {
    setIsLoading(true)

    // Find or create conversation
    const result = await findOrCreateConversation(studentId, classId, teacherId)

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    // Success feedback
    if (result.isNewConversation) {
      toast.success(`New conversation started with ${guardianName}`)
    } else {
      toast.success(`Conversation with ${guardianName} opened`)
    }

    // Navigate to inbox
    router.push(`/inbox/${result.conversationId}`)

  } catch (err) {
    const errorMsg = 'Failed to open conversation. Please try again.'
    setError(errorMsg)
    toast.error(errorMsg)
  } finally {
    setIsLoading(false)
  }
}
```

### Step 8: Update Types (if needed)

**File**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/singapore/src/types/student.ts`

**Verification**: Ensure StudentProfileData includes all needed fields
- ✅ `student_id` - Required for conversation lookup
- ✅ `form_class_id` - Required for conversation creation
- ✅ `guardian` - Required for parent context

**Action**: Types already complete, no changes needed

### Step 9: Testing Strategy

**Manual Testing Checklist**:

1. **Happy Path - New Conversation**:
   - Open student profile (student with no existing conversation)
   - Click "Message Parents" button
   - Verify loading state shows
   - Verify navigation to `/inbox/{conversationId}`
   - Verify conversation appears in conversation list
   - Verify parent name is displayed correctly
   - Verify metadata sidebar shows student info

2. **Happy Path - Existing Conversation**:
   - Open student profile (student with existing conversation)
   - Click "Message Parents" button
   - Verify it opens existing conversation (not creating duplicate)
   - Verify conversation history is visible

3. **Error Cases**:
   - Student with no guardian → button disabled
   - Student with no class_id → error message
   - API failure → error toast + retry option

4. **Loading States**:
   - Verify button shows spinner during operation
   - Verify button is disabled during operation
   - Verify button re-enables after completion

5. **Navigation**:
   - Verify URL changes to `/inbox/{conversationId}`
   - Verify conversation is highlighted in list
   - Verify back navigation works correctly

**Integration Testing**:
- Test with multiple students from same class
- Test with students from different classes
- Test conversation list sorting and grouping
- Test simultaneous conversation creation (race conditions)

### Step 10: Documentation Updates

**Files to Update**:

1. **`.agent/System/conversation-system.md`** (create if not exists)
   - Document the "Message Parents" feature
   - Explain conversation lookup/creation flow
   - Document API endpoints and parameters

2. **`.agent/SOP/messaging-workflow.md`** (create if not exists)
   - How to message parents from student profile
   - How conversations are created and managed
   - Best practices for teacher-parent communication

3. **`README.md`** (if applicable)
   - Add feature to feature list
   - Document user workflow

## Technical Considerations

### Performance
- **Conversation Lookup**: Use React Query cache to avoid redundant API calls
- **Optimistic Navigation**: Navigate immediately, show loading state in inbox
- **Debouncing**: Prevent double-clicks with button disabled state

### Security
- **Authorization**: Verify teacher has access to student before creating conversation
- **Validation**: Validate student_id, class_id, and teacher_id on backend
- **RLS Policies**: Ensure Supabase Row-Level Security allows conversation creation

### Data Consistency
- **Unique Constraints**: Prevent duplicate conversations for same student-teacher pair
- **Transaction Safety**: Use database constraints to ensure data integrity
- **Cache Invalidation**: Invalidate conversation cache after creation

### Scalability
- **Pagination**: Conversation list should handle large numbers of conversations
- **Indexing**: Ensure database indexes on student_id, teacher_id, class_id
- **Lazy Loading**: Load conversation messages only when conversation is opened

## Success Criteria

✅ **Functional**:
- Clicking "Message Parents" navigates to correct conversation
- New conversations are created when needed
- Existing conversations are reused (no duplicates)
- Parent name is displayed correctly in conversation list

✅ **UX**:
- Loading states are clear and informative
- Errors are handled gracefully with user-friendly messages
- Button is disabled when guardian data is missing
- Navigation is smooth and responsive

✅ **Technical**:
- API endpoints are efficient and secure
- React Query caching is utilized properly
- Types are complete and accurate
- Code follows project conventions (Next.js 15, TypeScript, shadcn/ui)

## File Checklist

**New Files**:
- [x] `/src/lib/conversation-helpers.ts` - Helper functions
- [x] `/src/hooks/use-message-parent.ts` - Custom hook

**Modified Files**:
- [x] `/src/components/student-profile.tsx` - Update button logic
- [x] `/src/app/api/conversations/route.ts` - Add student_id filter

**Documentation**:
- [ ] `.agent/System/conversation-system.md` - System documentation
- [ ] `.agent/SOP/messaging-workflow.md` - Workflow documentation
- [ ] This file: `.agent/Tasks/message-parents-button-update.md` - Implementation plan

## Dependencies

**Required**:
- React Query (already installed)
- Next.js Router (already available)
- Supabase client (already configured)
- lucide-react icons (already installed)
- Existing conversation API endpoints

**No New Dependencies**: All required libraries are already in the project

## Estimated Implementation Time

- Step 1-2: Helper function + Hook (1-2 hours)
- Step 3: Update student profile component (30 minutes)
- Step 4: API endpoint enhancement (30 minutes)
- Step 5-7: Edge cases + loading states (1 hour)
- Step 8-9: Types + Testing (1-2 hours)
- Step 10: Documentation (30 minutes)

**Total**: 4-6 hours of development + testing

## Rollout Plan

1. **Development**: Implement in feature branch
2. **Testing**: Manual testing with test data
3. **Code Review**: Review by team member
4. **Staging**: Deploy to staging environment
5. **Production**: Deploy after successful testing

## Future Enhancements

- **Multiple Guardians**: Support messaging multiple guardians
- **Conversation Templates**: Pre-filled message templates
- **Scheduled Messages**: Schedule messages to send later
- **Message Read Receipts**: Track when parents read messages
- **Rich Media**: Support attachments (documents, images)
- **Notification System**: Notify parents via email/SMS

## Notes

- This implementation assumes single primary guardian per student
- Conversation list already supports parent name display (no changes needed)
- Existing inbox UI and components are reused (no UI changes needed)
- Focus is on connecting student profile to conversation system seamlessly
