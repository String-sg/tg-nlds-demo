import { NextRequest } from 'next/server'
import { openai, OPENAI_CONFIG, SYSTEM_PROMPT } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { getPTMStudents } from '@/app/actions/ptm-actions'
import { checkRateLimit, recordRateLimit, trackUsage, calculateCost } from '@/lib/openai/rate-limit'

export const runtime = 'edge' // Enable Edge Runtime for streaming

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  conversationHistory: ChatMessage[]
  isPTMRequest?: boolean
}

/**
 * POST /api/chat/stream
 * Streaming chat endpoint for OpenAI integration
 * Returns Server-Sent Events (SSE) for real-time response streaming
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [], isPTMRequest = false } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID
    let userId: string

    if (mockMode && mockTeacherId) {
      // Use mock teacher ID for demo mode
      userId = mockTeacherId
    } else {
      // Production: require authentication
      const supabase = await createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      userId = user.id
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId, 'chat')
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. You can send ${rateCheck.remaining} more messages. Try again after ${rateCheck.resetAt.toLocaleTimeString()}.`,
          rateLimitExceeded: true,
          resetAt: rateCheck.resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Record rate limit
    await recordRateLimit(userId, 'chat', 'stream')

    // Build system prompt with context
    const systemPrompt = await buildSystemPrompt(isPTMRequest, userId, message)

    // Prepare messages for OpenAI
    // Limit conversation history to last 10 messages to control token usage
    const recentHistory = conversationHistory.slice(-10)

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ]

    // Create OpenAI stream
    const stream = (await openai.chat.completions.create({
      model: OPENAI_CONFIG.chat.model,
      messages: messages as any,
      temperature: OPENAI_CONFIG.chat.temperature,
      max_tokens: OPENAI_CONFIG.chat.max_tokens,
      stream: true, // Enable streaming
    } as any)) as unknown as AsyncIterable<any>

    // Track token usage and cost
    let promptTokens = 0
    let completionTokens = 0
    let fullResponse = ''

    // Create ReadableStream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''

            if (content) {
              fullResponse += content
              completionTokens += 1 // Rough estimate (1 token per chunk)

              // Send chunk to client
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }

            // Check if done
            const finishReason = chunk.choices[0]?.finish_reason
            if (finishReason) {
              // Send completion signal
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ done: true, finishReason })}\n\n`
                )
              )

              // Track usage (estimated tokens)
              // Rough estimation: 4 characters per token
              promptTokens = Math.ceil(
                messages.reduce((sum, m) => sum + m.content.length, 0) / 4
              )
              completionTokens = Math.ceil(fullResponse.length / 4)
              const totalTokens = promptTokens + completionTokens

              const estimatedCost = calculateCost({
                model: OPENAI_CONFIG.chat.model,
                promptTokens,
                completionTokens,
              })

              // Track usage in background (don't await to avoid blocking)
              trackUsage({
                userId: userId,
                type: 'chat',
                model: OPENAI_CONFIG.chat.model,
                promptTokens,
                completionTokens,
                totalTokens,
                estimatedCost,
                requestData: {
                  message,
                  isPTMRequest,
                  historyLength: conversationHistory.length,
                },
                responseData: {
                  responseLength: fullResponse.length,
                  finishReason,
                },
              }).catch((err) => console.error('Failed to track usage:', err))
            }
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)

          // Send error to client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`
            )
          )

          // Track error
          trackUsage({
            userId: userId,
            type: 'chat',
            model: OPENAI_CONFIG.chat.model,
            error: error instanceof Error ? error.message : 'Unknown error',
          }).catch((err) => console.error('Failed to track error:', err))

          controller.close()
        }
      },
    })

    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Request processing error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Build system prompt with contextual information
 * Enriches with PTM data if requested and adds Notion MCP capabilities
 */
async function buildSystemPrompt(
  isPTMRequest: boolean,
  userId: string,
  message: string
): Promise<string> {
  let prompt = SYSTEM_PROMPT

  // Add Notion content by actually searching the workspace
  let notionSearchResults = ''
  try {
    // Import Notion MCP service
    const { default: NotionMCPService } = await import('@/lib/notion/mcp-server')

    const notionApiKey = process.env.NOTION_API_KEY
    if (notionApiKey) {
      const notionMCP = new NotionMCPService({
        apiKey: notionApiKey,
        version: process.env.NOTION_VERSION || '2022-06-28'
      })

      // Search for content related to the user's message
      const searchQuery = message.toLowerCase()
      const searchResult = await notionMCP.executeTool('notion_search', {
        query: searchQuery
      })

      if (searchResult?.results?.length > 0) {
        const pageList = searchResult.results.slice(0, 10).map((page: any) => {
          return `- **${page.title}** (${page.object}): ${page.url}`
        }).join('\n')

        notionSearchResults = `

===== RELEVANT NOTION CONTENT FOUND =====

Based on your query "${searchQuery}", I found these relevant pages in your workspace:

${pageList}

IMPORTANT INSTRUCTIONS:
1. Use ONLY the content from these pages to answer the question
2. Always cite specific pages when referencing information
3. Structure your response like the example: direct answer, frameworks, citations
4. End with a "Recommended Further Reading" section with clickable links

Citation format: [Page Title](opal2.moe.edu.sg/page-id)

Example response structure:
"According to your [SEND Space](opal2.moe.edu.sg/page-id) resources, the CALM framework includes: Check for safety, Avoid power struggles, Let others know, Make sure an adult stays..."

`
      }
    }
  } catch (error) {
    console.error('Error searching Notion:', error)
  }

  prompt += notionSearchResults

  prompt += `

===== RESPONSE GUIDELINES =====

IMPORTANT: You must search and cite content from the Notion workspace. Structure responses like this:

1. **Direct answer** addressing the core question
2. **Key frameworks/information** from the search results
3. **Recommended Further Reading** with clickable links

Always use this citation format: [Page Title](opal2.moe.edu.sg/[page-id])

If no relevant content is found, say: "I couldn't find specific information about [topic] in your Notion workspace."

Be methodical, data-driven, and use concise expression with maximum information density.`

  // If PTM request, enrich with student data
  if (isPTMRequest) {
    try {
      const ptmData = await getPTMStudents(userId)

      if (ptmData.students && ptmData.students.length > 0) {
        // Get top 10 priority students
        const topStudents = ptmData.students.slice(0, 10)

        const studentSummary = topStudents
          .map(
            (s, i) =>
              `${i + 1}. ${s.name} (${s.priorityLevel} priority):
   - Attendance: ${s.attendanceRate.toFixed(1)}% (${s.attendanceRate < 85 ? '⚠️ Low' : '✓ Good'})
   - Active Cases: ${s.activeCases.length} (${s.activeCases.map((c) => c.case_type).join(', ') || 'None'})
   - Recent Grades: ${s.recentGrades.length > 0 ? s.recentGrades.map((g) => `${g.subject}: ${g.grade}`).slice(0, 3).join(', ') : 'No recent grades'}
   - Concerns: ${s.concernAreas.join(', ') || 'None'}
   - Strengths: ${s.strengths.join(', ') || 'Not specified'}`
          )
          .join('\n\n')

        prompt += `

===== PARENT-TEACHER MEETING CONTEXT =====

You are helping prepare for a parent-teacher meeting for form class ${ptmData.formClassName}.

Priority Students (sorted by attention needed):
${studentSummary}

Summary Statistics:
- Total Students: ${ptmData.totalCount}
- High Priority: ${ptmData.highPriorityCount} students
- Medium Priority: ${ptmData.mediumPriorityCount} students
- Low Priority: ${ptmData.lowPriorityCount} students

Instructions:
1. Focus on high-priority students first
2. Provide specific, actionable talking points for each student
3. Balance concerns with positive highlights
4. Suggest strategies parents can implement at home
5. Be empathetic and solution-oriented
6. Keep responses concise and practical

You can also search your Notion workspace for additional information about these students,
lesson plans, or meeting notes that might be relevant to the parent-teacher meeting.`
      }
    } catch (error) {
      console.error('Failed to fetch PTM data for context:', error)
      // Continue without PTM context
    }
  }

  return prompt
}
