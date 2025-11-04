# OpenAI Integration Plan: Student Image Generation + Assistant Panel

**Created**: November 4, 2025
**Status**: 🔄 Planning
**Priority**: P1 - High Priority

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements](#requirements)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Checklist](#deployment-checklist)
8. [Cost & Performance Considerations](#cost--performance-considerations)

---

## Executive Summary

This plan outlines the integration of OpenAI services into two core features:
1. **Student Image Generation**: AI-generated profile photos for students using DALL-E 3
2. **Assistant Panel Enhancement**: Direct OpenAI Chat API integration for intelligent responses

### Key Goals
- ✅ Generate realistic student profile photos with DALL-E 3
- ✅ Replace simulated assistant responses with real OpenAI Chat completions
- ✅ Maintain all existing functionality (PTM feature, shortcuts, natural language triggers)
- ✅ Implement streaming responses for better UX
- ✅ Add proper error handling and rate limiting

### Success Metrics
- Students can have AI-generated profile photos
- Assistant provides contextually relevant responses using OpenAI
- PTM feature continues to work with enhanced AI analysis
- Response time < 3 seconds for most queries
- Zero breaking changes to existing features

---

## Current State Analysis

### 1. Assistant Panel (Current Implementation)
**File**: `src/components/assistant-panel.tsx` (887 lines)

**Current Behavior**:
- **Simulated responses** with hardcoded 1-5 second timeouts
- PTM feature works with real Supabase data
- No actual LLM integration
- Pattern matching for PTM natural language triggers
- Slash commands: `/ptm`, `/lesson`, `/progress`

**Key Functions**:
```typescript
// Line 414: handleSendMessage - Simulates responses
const handleSendMessage = async () => {
  // Pattern matching for PTM requests
  if (isPTMRequest) {
    setTimeout(() => {
      // Shows PTMResponseContent component with real data
    }, 5000)
  } else {
    setTimeout(() => {
      // Generic placeholder response
      content: 'This is a simulated response...'
    }, 1000)
  }
}
```

**Message Type**:
```typescript
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string | React.ReactNode  // Can be JSX (for PTM response)
  timestamp: Date
  isThinking?: boolean
  command?: string       // For slash commands
  fullPrompt?: string    // Expanded prompt
}
```

**State Management**:
- Uses `AssistantContext` (`src/contexts/assistant-context.tsx`)
- SessionStorage persistence (300ms debounce)
- Max 50 messages in history

### 2. Student Images (Current Implementation)

**Database Schema**:
```sql
-- students table (migration: 20250110000001)
CREATE TABLE students (
  id UUID PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_photo TEXT,  -- ⚠️ Currently unused, NULL for all students
  ...
)
```

**TypeScript Types**:
```typescript
// src/types/classroom.ts
export interface Student {
  student_id: string
  name: string
  avatar?: string  // ⚠️ Currently generated from initials, not real photos
  ...
}
```

**Current Avatar System**:
- Initials-based with color hash (e.g., "JD" for "John Doe")
- No actual profile photos stored or displayed
- Utility functions: `getInitials()`, `getAvatarColor()` in `src/lib/utils.ts`

### 3. Dependencies (Current)
**No OpenAI or LLM libraries installed**:
```json
// package.json - Current dependencies (relevant ones)
{
  "@supabase/supabase-js": "^2.75.0",
  "@tanstack/react-query": "^5.90.5",
  "react": "^19.2.0",
  "next": "^16.0.0"
  // ❌ No OpenAI SDK
  // ❌ No AI/LLM libraries
}
```

### 4. Data Flow (Current)
```
User Input → Component State → setTimeout (fake delay) → Hardcoded Response
                              ↓
                         (PTM only) Fetch real data from Supabase
```

---

## Requirements

### Functional Requirements

#### FR1: Student Image Generation
- **FR1.1**: Generate photorealistic student portraits using DALL-E 3
- **FR1.2**: Store generated images in Supabase Storage
- **FR1.3**: Update `students.profile_photo` with image URL
- **FR1.4**: Provide UI trigger in student profile or admin panel
- **FR1.5**: Batch generation capability for multiple students
- **FR1.6**: Regeneration option if teacher is unsatisfied

#### FR2: Assistant OpenAI Integration
- **FR2.1**: Replace simulated responses with real OpenAI Chat completions
- **FR2.2**: Support streaming responses for better UX
- **FR2.3**: Maintain PTM feature functionality with AI enhancement
- **FR2.4**: Keep slash command shortcuts working
- **FR2.5**: Support natural language PTM triggers
- **FR2.6**: Provide context-aware responses using student data

### Non-Functional Requirements

#### NFR1: Security
- API keys stored in environment variables only
- No client-side API key exposure
- Server-side API calls only

#### NFR2: Performance
- Image generation: < 10 seconds per image
- Chat responses: Start streaming within 1 second
- Complete responses: < 5 seconds for most queries

#### NFR3: Cost Management
- Track token usage per request
- Implement rate limiting (10 requests/minute per user)
- DALL-E 3: Budget for ~50 images/day maximum
- Chat API: GPT-4o-mini for cost efficiency

#### NFR4: Error Handling
- Graceful fallbacks to simulated responses
- User-friendly error messages
- Retry logic for transient failures
- Logging for debugging

---

## Technical Architecture

### 1. OpenAI SDK Integration

#### Installation
```bash
npm install openai
npm install --save-dev @types/node  # Already installed
```

#### Environment Variables
```bash
# .env.local (add to .gitignore)
OPENAI_API_KEY=sk-proj-...

# Optional: Configuration
OPENAI_ORG_ID=org-...
OPENAI_IMAGE_STORAGE_BUCKET=student-photos
```

#### OpenAI Client Setup
**New File**: `src/lib/openai/client.ts`
```typescript
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
})

// Default configuration
export const OPENAI_CONFIG = {
  chat: {
    model: 'gpt-4o-mini',  // Cost-effective for education context
    temperature: 0.7,
    max_tokens: 1000,
  },
  image: {
    model: 'dall-e-3',
    size: '1024x1024' as const,
    quality: 'standard' as const,
    style: 'natural' as const,
  },
} as const
```

### 2. Image Generation Architecture

#### Data Flow
```
Teacher Clicks "Generate Photo"
  → Client calls Server Action (generateStudentImage)
    → Server Action validates student data
      → Calls OpenAI DALL-E 3 API
        → Downloads generated image
          → Uploads to Supabase Storage
            → Updates students.profile_photo URL
              → Returns success + URL to client
                → UI updates with new image
```

#### Server Action: Image Generation
**New File**: `src/app/actions/openai-image-actions.ts`
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { openai, OPENAI_CONFIG } from '@/lib/openai/client'
import { revalidatePath } from 'next/cache'

export interface GenerateStudentImageParams {
  studentId: string
  studentName: string
  gender?: 'male' | 'female' | 'other'
  ethnicity?: string  // Optional: For more accurate representation
  age?: number        // Optional: Defaults to 11 (Primary 5)
}

export async function generateStudentImage(params: GenerateStudentImageParams) {
  try {
    const { studentId, studentName, gender = 'male', ethnicity, age = 11 } = params

    // 1. Validate student exists
    const supabase = await createClient()
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, name, student_id')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      return {
        success: false,
        error: 'Student not found'
      }
    }

    // 2. Generate detailed prompt for DALL-E 3
    const prompt = buildStudentPortraitPrompt({
      name: studentName,
      gender,
      ethnicity,
      age,
    })

    // 3. Call OpenAI DALL-E 3
    const response = await openai.images.generate({
      model: OPENAI_CONFIG.image.model,
      prompt,
      n: 1,
      size: OPENAI_CONFIG.image.size,
      quality: OPENAI_CONFIG.image.quality,
      style: OPENAI_CONFIG.image.style,
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      return {
        success: false,
        error: 'Failed to generate image'
      }
    }

    // 4. Download image from OpenAI (temporary URL)
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    // 5. Upload to Supabase Storage
    const fileName = `${studentId}-${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('student-photos')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: 'Failed to upload image to storage'
      }
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('student-photos')
      .getPublicUrl(fileName)

    // 7. Update student record
    const { error: updateError } = await supabase
      .from('students')
      .update({ profile_photo: publicUrlData.publicUrl })
      .eq('id', studentId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update student record'
      }
    }

    // 8. Revalidate relevant paths
    revalidatePath('/my-classes')
    revalidatePath(`/student/${studentName}`)

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      message: 'Student photo generated successfully',
    }

  } catch (error) {
    console.error('Error generating student image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper: Build detailed prompt for DALL-E 3
function buildStudentPortraitPrompt(params: {
  name: string
  gender: string
  ethnicity?: string
  age: number
}): string {
  const { name, gender, ethnicity, age } = params

  const genderDesc = gender === 'male' ? 'boy' : gender === 'female' ? 'girl' : 'child'
  const ethnicityDesc = ethnicity ? `${ethnicity} ` : 'Singaporean '

  return `Professional school portrait photo of a ${ethnicityDesc}${genderDesc}, age ${age},
    wearing a school uniform (white shirt), friendly smile,
    neutral indoor background with soft lighting,
    high quality, photorealistic, passport photo style,
    centered composition, looking at camera`
}
```

#### Batch Generation Support
**New File**: `src/app/actions/openai-image-actions.ts` (continued)
```typescript
export async function generateStudentImagesBatch(studentIds: string[]) {
  const results = []

  for (const studentId of studentIds) {
    const supabase = await createClient()
    const { data: student } = await supabase
      .from('students')
      .select('id, name, gender, date_of_birth')
      .eq('id', studentId)
      .single()

    if (student) {
      const age = student.date_of_birth
        ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
        : 11

      const result = await generateStudentImage({
        studentId: student.id,
        studentName: student.name,
        gender: student.gender as 'male' | 'female' | undefined,
        age,
      })

      results.push({ studentId, studentName: student.name, ...result })

      // Rate limiting: 1 request per 2 seconds (30/minute OpenAI limit)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return results
}
```

#### UI Component: Image Generation Trigger
**New File**: `src/components/student/generate-photo-dialog.tsx`
```typescript
'use client'

import { useState } from 'react'
import { Loader2Icon, ImageIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { generateStudentImage } from '@/app/actions/openai-image-actions'
import { toast } from 'sonner'

interface GeneratePhotoDialogProps {
  studentId: string
  studentName: string
  currentPhotoUrl?: string
  gender?: 'male' | 'female' | 'other'
}

export function GeneratePhotoDialog({
  studentId,
  studentName,
  currentPhotoUrl,
  gender,
}: GeneratePhotoDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const result = await generateStudentImage({
        studentId,
        studentName,
        gender,
      })

      if (result.success && result.imageUrl) {
        setPreviewUrl(result.imageUrl)
        toast.success('Photo generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate photo')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentPhotoUrl ? (
            <>
              <RefreshCwIcon className="mr-2 size-4" />
              Regenerate Photo
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 size-4" />
              Generate Photo
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Student Photo with AI</DialogTitle>
          <DialogDescription>
            Create a photorealistic portrait for {studentName} using DALL-E 3
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Preview Area */}
          <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-8">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Generated photo of ${studentName}`}
                className="size-48 rounded-lg object-cover"
              />
            ) : currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt={`Current photo of ${studentName}`}
                className="size-48 rounded-lg object-cover opacity-50"
              />
            ) : (
              <div className="flex size-48 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            <p>This will generate a professional school portrait photo.</p>
            <p className="mt-1">Generation typically takes 5-10 seconds.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Assistant Panel OpenAI Integration

#### Data Flow
```
User Input
  → AssistantBody component
    → Server Action (sendChatMessage)
      → Build context (include PTM data if requested)
        → OpenAI Chat API (streaming)
          → Stream response back to client
            → Update UI incrementally
              → Store final message in context
```

#### Server Action: Chat Completion
**New File**: `src/app/actions/openai-chat-actions.ts`
```typescript
'use server'

import { openai, OPENAI_CONFIG } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { getPTMStudents } from './ptm-actions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface SendChatMessageParams {
  message: string
  conversationHistory: ChatMessage[]
  isPTMRequest?: boolean
  teacherId?: string
}

export async function sendChatMessage(params: SendChatMessageParams) {
  const { message, conversationHistory, isPTMRequest, teacherId } = params

  try {
    // 1. Build system context
    const systemPrompt = await buildSystemPrompt(isPTMRequest, teacherId)

    // 2. Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    // 3. Call OpenAI Chat API (non-streaming for server action)
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.chat.model,
      messages: messages as any,
      temperature: OPENAI_CONFIG.chat.temperature,
      max_tokens: OPENAI_CONFIG.chat.max_tokens,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      return {
        success: false,
        error: 'No response from AI',
      }
    }

    return {
      success: true,
      message: assistantMessage,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    }

  } catch (error) {
    console.error('OpenAI Chat Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Build system prompt with context
async function buildSystemPrompt(
  isPTMRequest: boolean,
  teacherId?: string
): Promise<string> {
  const basePrompt = `You are an AI teaching assistant for Singapore primary school teachers.
Your role is to help teachers with student management, parent-teacher meetings,
lesson planning, and administrative tasks.

Be professional, concise, and supportive. Use Singapore education terminology.
Current academic year: 2025`

  // If PTM request, enrich with student data
  if (isPTMRequest && teacherId) {
    try {
      const ptmData = await getPTMStudents(teacherId)

      if (ptmData.students && ptmData.students.length > 0) {
        const studentSummary = ptmData.students
          .slice(0, 10) // Top 10 priority students
          .map((s, i) =>
            `${i + 1}. ${s.name} (${s.priorityLevel} priority): ${s.attendanceRate}% attendance, ${s.activeCases.length} active cases`
          )
          .join('\n')

        return `${basePrompt}

Current Context: Parent-Teacher Meeting Preparation
You have access to the following student data for form class ${ptmData.formClassName}:

Priority Students:
${studentSummary}

Focus your response on:
- Students needing urgent attention (high priority)
- Specific talking points for each student
- Suggested strategies for parents
- Positive highlights to balance concerns`
      }
    } catch (error) {
      console.error('Failed to fetch PTM data:', error)
    }
  }

  return basePrompt
}
```

#### Streaming Support (Advanced)
**New File**: `src/app/api/chat/stream/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { openai, OPENAI_CONFIG } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge' // Enable Edge Runtime for streaming

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, teacherId } = await request.json()

    // Build system prompt (same as sendChatMessage)
    const systemPrompt = `You are an AI teaching assistant...`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    // Create OpenAI stream
    const stream = await openai.chat.completions.create({
      model: OPENAI_CONFIG.chat.model,
      messages: messages as any,
      temperature: OPENAI_CONFIG.chat.temperature,
      max_tokens: OPENAI_CONFIG.chat.max_tokens,
      stream: true, // ✅ Enable streaming
    })

    // Create ReadableStream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${content}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

#### Updated AssistantBody Component
**Modified File**: `src/components/assistant-panel.tsx`

Replace `handleSendMessage` function:

```typescript
const handleSendMessage = async () => {
  if (!input.trim() || isLoading) return

  const userMessage: Message = {
    id: generateMessageId(),
    role: 'user',
    content: input.trim(),
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, userMessage])
  const messageText = input.trim().toLowerCase()
  setInput('')
  setIsLoading(true)

  // Check if PTM request
  const ptmPatterns = [
    'parent teacher meeting',
    'parents teacher meeting',
    'parent-teacher meeting',
    'ptm',
  ]

  const isPTMRequest = ptmPatterns.some(pattern =>
    messageText.includes(pattern)
  )

  try {
    // ✅ NEW: Call OpenAI via server action
    const result = await sendChatMessage({
      message: input.trim(),
      conversationHistory: messages
        .filter(m => typeof m.content === 'string')
        .map(m => ({
          role: m.role,
          content: m.content as string,
        })),
      isPTMRequest,
      teacherId: user?.user_id,
    })

    if (result.success && result.message) {
      // If PTM request, show PTM component alongside AI response
      if (isPTMRequest) {
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Add PTM response as separate message
        const ptmMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: (
            <PTMResponseContent
              onStudentClick={onStudentClick}
              onStudentClickWithClass={onStudentClickWithClass}
            />
          ),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, ptmMessage])
      } else {
        // Regular AI response
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } else {
      // Fallback to simulated response on error
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  } catch (error) {
    console.error('Chat error:', error)
    // Fallback response
    const assistantMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: 'An error occurred. Please try again later.',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
  } finally {
    setIsLoading(false)
  }
}
```

#### Streaming UI Component (Optional Enhancement)
**New Component**: `src/components/assistant/streaming-message.tsx`
```typescript
'use client'

import { useState, useEffect } from 'react'

interface StreamingMessageProps {
  messageId: string
}

export function StreamingMessage({ messageId }: StreamingMessageProps) {
  const [content, setContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/stream?id=${messageId}`)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setIsComplete(true)
        eventSource.close()
      } else {
        setContent(prev => prev + event.data)
      }
    }

    eventSource.onerror = () => {
      setIsComplete(true)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [messageId])

  return (
    <div className="whitespace-pre-wrap">
      {content}
      {!isComplete && <span className="animate-pulse">▊</span>}
    </div>
  )
}
```

---

## Implementation Plan

### Phase 1: Setup & Infrastructure (Day 1)

#### 1.1 Install Dependencies
```bash
cd /Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/jackson
npm install openai
```

#### 1.2 Environment Configuration
1. Create/update `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```
2. Add to `.gitignore`:
   ```
   .env.local
   .env*.local
   ```
3. Update Vercel environment variables (production)

#### 1.3 OpenAI Client Setup
- Create `src/lib/openai/client.ts`
- Add configuration constants
- Test connection with simple API call

#### 1.4 Supabase Storage Setup
```sql
-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true);

-- Set up RLS policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');
```

**Tasks**:
- [ ] Install OpenAI SDK
- [ ] Configure environment variables
- [ ] Create OpenAI client module
- [ ] Set up Supabase Storage bucket
- [ ] Test API connectivity

---

### Phase 2: Student Image Generation (Days 2-3)

#### 2.1 Server Actions
- Create `src/app/actions/openai-image-actions.ts`
- Implement `generateStudentImage()`
- Implement `generateStudentImagesBatch()`
- Add error handling and logging

#### 2.2 UI Components
- Create `src/components/student/generate-photo-dialog.tsx`
- Add trigger button to student profile
- Implement loading states
- Add success/error toast notifications

#### 2.3 Integration Points
**Update these components**:
1. `src/components/student-profile.tsx` - Add "Generate Photo" button
2. Student list views - Show real avatars when available
3. PTM response cards - Display real photos in student cards

#### 2.4 Testing
- Test single image generation
- Test batch generation (5 students)
- Verify Supabase Storage upload
- Check database updates
- Test regeneration flow

**Tasks**:
- [ ] Create server actions for image generation
- [ ] Build UI dialog component
- [ ] Integrate with student profile
- [ ] Test image generation flow
- [ ] Handle edge cases and errors

---

### Phase 3: Assistant OpenAI Integration (Days 4-5)

#### 3.1 Server Actions - Basic
- Create `src/app/actions/openai-chat-actions.ts`
- Implement `sendChatMessage()`
- Build context enrichment (PTM data integration)
- Add token usage tracking

#### 3.2 Update Assistant Panel
- Modify `src/components/assistant-panel.tsx`
- Replace simulated responses with OpenAI calls
- Update `handleSendMessage()` function
- Update `handleShortcutSelect()` function
- Maintain PTM component rendering

#### 3.3 Error Handling
- Add graceful fallbacks
- Implement retry logic
- User-friendly error messages
- Logging for debugging

#### 3.4 Testing
- Test basic queries
- Test PTM slash command
- Test natural language PTM triggers
- Verify conversation history
- Check token limits

**Tasks**:
- [ ] Create chat server action
- [ ] Update assistant panel component
- [ ] Integrate OpenAI API calls
- [ ] Maintain PTM functionality
- [ ] Test all assistant features

---

### Phase 4: Streaming Support (Optional - Day 6)

#### 4.1 Streaming API Route
- Create `src/app/api/chat/stream/route.ts`
- Implement Edge Runtime streaming
- Handle SSE (Server-Sent Events)

#### 4.2 Client-Side Streaming
- Create `src/components/assistant/streaming-message.tsx`
- Update Message type to support streaming
- Implement incremental UI updates

#### 4.3 Testing
- Test streaming responses
- Verify UI updates in real-time
- Check connection stability
- Handle disconnections

**Tasks**:
- [ ] Create streaming API route
- [ ] Build streaming UI component
- [ ] Update assistant panel for streaming
- [ ] Test streaming functionality
- [ ] Handle edge cases

---

### Phase 5: Rate Limiting & Monitoring (Day 7)

#### 5.1 Rate Limiting
**New File**: `src/lib/rate-limit.ts`
```typescript
import { createClient } from '@/lib/supabase/server'

const RATE_LIMITS = {
  chat: { requests: 10, window: 60 * 1000 }, // 10 per minute
  image: { requests: 5, window: 60 * 1000 },  // 5 per minute
}

export async function checkRateLimit(
  userId: string,
  type: 'chat' | 'image'
): Promise<boolean> {
  const supabase = await createClient()

  // Check recent requests from rate_limit table
  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('created_at', new Date(Date.now() - RATE_LIMITS[type].window).toISOString())

  if (error || !data) return true // Allow if error

  return data.length < RATE_LIMITS[type].requests
}
```

**Database Migration**:
```sql
-- Add rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES teachers(id),
  type TEXT NOT NULL CHECK (type IN ('chat', 'image')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_rate_limits_user_type ON rate_limits(user_id, type, created_at);
```

#### 5.2 Usage Tracking
**New File**: `src/lib/openai/tracking.ts`
```typescript
import { createClient } from '@/lib/supabase/server'

export async function trackUsage(params: {
  userId: string
  type: 'chat' | 'image'
  tokens?: number
  cost?: number
  metadata?: any
}) {
  const supabase = await createClient()

  await supabase.from('openai_usage').insert({
    user_id: params.userId,
    type: params.type,
    tokens: params.tokens || 0,
    cost: params.cost || 0,
    metadata: params.metadata,
  })
}
```

**Database Migration**:
```sql
-- Add usage tracking table
CREATE TABLE openai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES teachers(id),
  type TEXT NOT NULL CHECK (type IN ('chat', 'image')),
  tokens INTEGER DEFAULT 0,
  cost NUMERIC(10, 4) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_openai_usage_user ON openai_usage(user_id, created_at);
CREATE INDEX idx_openai_usage_type ON openai_usage(type, created_at);
```

**Tasks**:
- [ ] Implement rate limiting
- [ ] Create usage tracking
- [ ] Add database migrations
- [ ] Integrate with server actions
- [ ] Test rate limits

---

### Phase 6: Polish & Documentation (Day 8)

#### 6.1 Error Messages
- Create user-friendly error component
- Add retry buttons
- Show helpful suggestions

#### 6.2 Loading States
- Enhance loading indicators
- Add progress bars for image generation
- Skeleton loaders for chat responses

#### 6.3 Documentation
- Update `.agent` docs
- Add code comments
- Create developer guide for OpenAI integration
- Document environment variables

#### 6.4 Final Testing
- End-to-end testing
- Cross-browser testing
- Mobile responsiveness
- Performance testing

**Tasks**:
- [ ] Improve error handling UI
- [ ] Enhance loading states
- [ ] Write documentation
- [ ] Perform final testing
- [ ] Create demo video/screenshots

---

## Testing Strategy

### Unit Tests
1. **OpenAI Client**:
   - Test API key validation
   - Test configuration defaults

2. **Server Actions**:
   - Test `generateStudentImage` with mock OpenAI
   - Test `sendChatMessage` with various inputs
   - Test error handling

3. **Rate Limiting**:
   - Test limit enforcement
   - Test window reset

### Integration Tests
1. **Image Generation Flow**:
   - Generate single image
   - Upload to Supabase Storage
   - Update database record
   - UI updates correctly

2. **Chat Flow**:
   - Send message
   - Receive OpenAI response
   - Display in UI
   - Conversation history maintained

3. **PTM Enhancement**:
   - PTM request detection
   - Context enrichment
   - AI + PTM component display

### E2E Tests (Playwright)
1. User opens assistant panel
2. User types PTM request
3. System calls OpenAI
4. PTM data loads
5. UI displays both AI response and PTM cards
6. User clicks "Generate Photo" on student
7. System generates image
8. UI updates with new photo

### Manual Testing Checklist
- [ ] Generate image for single student
- [ ] Generate images for multiple students (batch)
- [ ] Regenerate existing photo
- [ ] Send regular chat message
- [ ] Send PTM slash command `/ptm`
- [ ] Send natural language PTM request
- [ ] Test conversation history (multi-turn)
- [ ] Test rate limiting (exceed limits)
- [ ] Test with invalid API key
- [ ] Test with network error
- [ ] Test on mobile device
- [ ] Test in production environment

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured in Vercel
- [ ] Supabase Storage bucket created in production
- [ ] Database migrations applied
- [ ] OpenAI API key added to production env
- [ ] Rate limiting tested

### Deployment Steps
1. **Database Migrations**:
   ```bash
   supabase db push
   ```

2. **Supabase Storage**:
   - Create `student-photos` bucket in production
   - Set public access
   - Configure RLS policies

3. **Environment Variables** (Vercel):
   ```bash
   OPENAI_API_KEY=sk-proj-...
   OPENAI_ORG_ID=org-...  # Optional
   ```

4. **Deploy to Vercel**:
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

5. **Verify Deployment**:
   - Test assistant panel chat
   - Test image generation
   - Check error handling
   - Monitor Vercel logs
   - Check OpenAI usage dashboard

### Post-Deployment
- [ ] Monitor OpenAI usage and costs
- [ ] Check error logs
- [ ] Verify all features working
- [ ] Get feedback from users
- [ ] Update documentation

---

## Cost & Performance Considerations

### OpenAI Pricing (as of Nov 2025)

#### Chat API (GPT-4o-mini)
- **Input**: $0.150 / 1M tokens (~$0.00015 per 1K tokens)
- **Output**: $0.600 / 1M tokens (~$0.0006 per 1K tokens)

**Typical Chat Request**:
- Input: ~500 tokens (context + message) = $0.000075
- Output: ~300 tokens (response) = $0.00018
- **Total per request**: ~$0.000255 (~$0.26 per 1,000 requests)

**Daily Estimates**:
- 20 teachers × 10 requests/day = 200 requests
- Daily cost: 200 × $0.000255 = **$0.051/day (~$1.53/month)**

#### Image Generation (DALL-E 3)
- **Standard quality**: $0.040 per image (1024×1024)
- **HD quality**: $0.080 per image (1024×1024)

**Batch Generation**:
- 50 students × $0.040 = **$2.00 per full class**
- Regenerations: ~10% of images = $0.20/month

**Monthly Total Estimate**:
- Chat: $1.53/month
- Images: $2.00 one-time + $0.20/month ongoing
- **Total: ~$3.73/month** (after initial setup)

### Performance Targets

| Operation | Target | Acceptable | Notes |
|-----------|--------|-----------|-------|
| Chat response (start) | < 1s | < 2s | First token |
| Chat response (complete) | < 3s | < 5s | Full response |
| Image generation | < 10s | < 15s | DALL-E 3 |
| Batch images (10 students) | < 120s | < 180s | With 2s delays |

### Rate Limiting Strategy

| Type | Limit | Window | Reason |
|------|-------|--------|--------|
| Chat | 10 requests | 1 minute | Prevent abuse, control costs |
| Image | 5 images | 1 minute | DALL-E 3 has 30/min limit |
| Batch | 50 images | 1 hour | Prevent runaway batch jobs |

### Optimization Strategies

1. **Caching**:
   - Cache similar PTM requests (same teacher, same day)
   - Use TanStack Query for student data caching

2. **Token Management**:
   - Limit conversation history to last 5 messages
   - Truncate system prompts when possible
   - Use gpt-4o-mini instead of gpt-4o for cost savings

3. **Image Optimization**:
   - Use "standard" quality instead of "HD" by default
   - Allow regeneration but warn about costs
   - Consider lazy loading in batch generation

4. **Monitoring**:
   - Track daily token usage
   - Set up alerts for unusual spending
   - Weekly cost reports

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API downtime | High | Fallback to simulated responses |
| Rate limit exceeded | Medium | Client-side queue with retry |
| Invalid images generated | Low | Allow regeneration, manual upload option |
| Token costs exceed budget | High | Rate limiting + usage alerts |
| Supabase Storage full | Medium | Set up storage limits + cleanup policy |

### Security Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API key exposure | Critical | Server-side only, env variables |
| Unauthorized image generation | Medium | Server action auth checks |
| PII leakage to OpenAI | High | Sanitize data, avoid sending sensitive info |
| Prompt injection | Medium | Input validation, system prompt protection |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unexpected high usage | High | Rate limiting, cost alerts |
| Poor image quality | Low | Regeneration option, manual override |
| Slow response times | Medium | Streaming, loading indicators |

---

## Success Metrics

### Quantitative Metrics
- [ ] Image generation success rate > 95%
- [ ] Chat response time p95 < 5 seconds
- [ ] Error rate < 2%
- [ ] Monthly costs < $5
- [ ] User satisfaction rating > 4.5/5

### Qualitative Metrics
- [ ] Teachers find assistant helpful for PTM prep
- [ ] Generated images look realistic and appropriate
- [ ] No privacy or ethical concerns raised
- [ ] Positive feedback from teachers

---

## Future Enhancements

### Phase 2 Features (Post-Launch)
1. **Advanced Image Customization**:
   - Custom backgrounds (classroom, playground)
   - Different expressions (smiling, serious)
   - Group photos for class rosters

2. **Enhanced Chat Features**:
   - Voice input/output
   - Document uploads (analyze lesson plans)
   - Calendar integration

3. **Analytics Dashboard**:
   - Token usage trends
   - Most common queries
   - Teacher engagement metrics

4. **Fine-tuning**:
   - Train custom model on Singapore education context
   - Improve PTM recommendations
   - Subject-specific teaching tips

---

## Appendix

### A. OpenAI Models Comparison

| Model | Cost (Input) | Cost (Output) | Speed | Best For |
|-------|--------------|---------------|-------|----------|
| gpt-4o | $5.00/1M | $15.00/1M | Fast | Complex reasoning |
| gpt-4o-mini | $0.150/1M | $0.600/1M | Fastest | General tasks ✅ |
| gpt-4-turbo | $10.00/1M | $30.00/1M | Medium | Legacy |
| dall-e-3 | $0.040/image | - | 10s | Image generation ✅ |

### B. Environment Variables Reference

```bash
# Required
OPENAI_API_KEY=sk-proj-xxx

# Optional
OPENAI_ORG_ID=org-xxx
OPENAI_IMAGE_STORAGE_BUCKET=student-photos

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### C. Useful Links

- [OpenAI API Docs](https://platform.openai.com/docs)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [DALL-E 3 Guide](https://platform.openai.com/docs/guides/images)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## Document History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-04 | 1.0 | Initial plan created | AI Assistant |

---

**Next Steps**: Review this plan with the team, get approval, and proceed with Phase 1 implementation.
