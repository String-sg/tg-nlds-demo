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
      // Try multiple search strategies to find relevant content
      const searchQuery = message.toLowerCase()

      // Strategy 1: Exact query search
      let searchResult = await notionMCP.executeTool('notion_search', {
        query: searchQuery
      })

      // Strategy 2: Try broader search terms
      if (!searchResult?.results?.length) {
        const broadTerms = searchQuery.split(' ').filter(word => word.length > 3)
        if (broadTerms.length > 0) {
          searchResult = await notionMCP.executeTool('notion_search', {
            query: broadTerms[0]
          })
        }
      }

      // Strategy 3: Get list of all databases and query them specifically
      let databaseResults = []
      if (!searchResult?.results?.length) {
        try {
          // Get all accessible content to find databases
          console.log('🔍 Searching for databases in workspace...')
          const allContentResult = await notionMCP.executeTool('notion_search', {
            query: '',
            filter: { object: 'database' }
          })
          console.log('📊 Found databases:', allContentResult?.results?.length || 0)

          if (allContentResult?.results?.length) {
            console.log('🎯 Found databases:', allContentResult.results.map((db: any) => ({ id: db.id, title: db.title || 'Untitled' })))

            // Extract search terms for database querying
            const queryTerms = searchQuery.split(' ').filter(word => word.length > 2).slice(0, 3)

            // Enhanced subject and educational area detection
            const subjectAreas = {
              // Core subjects
              'physics': ['physics', 'physical science'],
              'chemistry': ['chemistry', 'chemical science'],
              'biology': ['biology', 'biological science', 'life science'],
              'mathematics': ['mathematics', 'maths', 'math', 'algebra', 'calculus', 'geometry'],
              'english': ['english', 'literature', 'language arts'],
              'history': ['history', 'historical'],
              'geography': ['geography', 'geographical'],
              'science': ['science', 'scientific'],

              // Special Educational Needs
              'send': ['send', 'special needs', 'special educational needs', 'disabilities', 'learning difficulties', 'autism', 'adhd', 'dyslexia', 'sen'],

              // Educational approaches/frameworks
              'teaching': ['teaching', 'pedagogy', 'instruction', 'differentiated instruction'],
              'assessment': ['assessment', 'evaluation', 'testing', 'exam', 'examination'],
              'classroom': ['classroom', 'class management', 'behavior', 'behaviour'],
              'curriculum': ['curriculum', 'syllabus', 'learning outcomes'],

              // Levels
              'primary': ['primary', 'elementary', 'lower primary', 'upper primary'],
              'secondary': ['secondary', 'high school', 'lower secondary', 'upper secondary'],
              'tertiary': ['tertiary', 'university', 'college']
            }

            // Find matching subject/area
            let foundSubject: string | null = null
            let foundKeywords: string[] = []

            for (const [area, keywords] of Object.entries(subjectAreas)) {
              const matchedKeywords = keywords.filter(keyword =>
                searchQuery.toLowerCase().includes(keyword.toLowerCase())
              )
              if (matchedKeywords.length > 0) {
                foundSubject = area
                foundKeywords = matchedKeywords
                break
              }
            }

            console.log('🔤 Search terms:', queryTerms)
            console.log('📚 Detected subject:', foundSubject || 'none')

            for (const db of allContentResult.results.slice(0, 5)) {
              try {
                console.log(`📋 Querying database: ${db.title || db.id}`)
                if (foundSubject) console.log(`🎯 Applying ${foundSubject} filter with keywords:`, foundKeywords)

                // Build filters based on detected subject/area
                let filter = undefined

                if (foundSubject) {
                  const filterConditions = []

                  // Create variations of the subject for matching
                  const subjectVariations = [
                    foundSubject,
                    foundSubject.charAt(0).toUpperCase() + foundSubject.slice(1),
                    foundSubject.toUpperCase(),
                    ...foundKeywords.map(kw => kw.charAt(0).toUpperCase() + kw.slice(1))
                  ]

                  // Add conditions for common database properties
                  for (const variation of subjectVariations) {
                    filterConditions.push(
                      // Level property (multi-select)
                      {
                        property: 'Level',
                        multi_select: { contains: variation }
                      },
                      // Type property (select)
                      {
                        property: 'Type',
                        select: { equals: variation }
                      },
                      // Subject property (if exists)
                      {
                        property: 'Subject',
                        select: { equals: variation }
                      },
                      // Category property (if exists)
                      {
                        property: 'Category',
                        multi_select: { contains: variation }
                      },
                      // Area property (for SEND, Teaching, etc.)
                      {
                        property: 'Area',
                        select: { equals: variation }
                      }
                    )
                  }

                  // Also search in title and description for broader matching
                  filterConditions.push(
                    {
                      property: 'Title',
                      title: { contains: foundKeywords[0] || foundSubject }
                    },
                    {
                      property: 'Description',
                      rich_text: { contains: foundKeywords[0] || foundSubject }
                    }
                  )

                  if (filterConditions.length > 0) {
                    filter = { or: filterConditions.slice(0, 10) } // Limit to prevent API errors
                  }
                }

                const dbResult = await notionMCP.executeTool('notion_get_database', {
                  database_id: db.id,
                  page_size: 15,
                  filter
                })

                console.log(`📊 Database ${db.title} returned ${dbResult?.results?.length || 0} entries`)

                if (dbResult?.results?.length) {
                  databaseResults.push({
                    database: db,
                    entries: dbResult.results,
                    searchTerms: queryTerms,
                    subject: foundSubject
                  })
                }
              } catch (dbError) {
                console.error(`❌ Error querying database ${db.id}:`, dbError)
              }
            }
          }
        } catch (error) {
          console.error('Error searching databases:', error)
        }
      }

      // Strategy 4: If still no results, get recent pages (limited fallback)
      if (!searchResult?.results?.length && !databaseResults.length) {
        searchResult = await notionMCP.executeTool('notion_search', {
          query: '',
          sort: { direction: 'descending', timestamp: 'last_edited_time' }
        })

        // Limit to top 5 most recent if we're doing a fallback search
        if (searchResult?.results?.length) {
          searchResult.results = searchResult.results.slice(0, 5)
        }
      }

      if (searchResult?.results?.length > 0 || databaseResults.length > 0) {
        // Try to get actual page content for the top results
        const enrichedPages = []

        // Process regular search results
        if (searchResult?.results?.length > 0) {
          for (const page of searchResult.results.slice(0, 8)) {
          try {
            if (page.object === 'page') {
              // Get full page content
              const pageContent = await notionMCP.executeTool('notion_get_page', {
                page_id: page.id
              })

              // Extract both text content and files
              const textContent = pageContent.content
                ?.filter((block: any) => block.text)
                .map((block: any) => block.text)
                .filter((text: string) => text.trim())
                .slice(0, 3)
                .join(' ')

              const files = pageContent.content
                ?.filter((block: any) => ['file', 'pdf', 'image', 'video', 'audio', 'embed'].includes(block.type))
                .map((block: any) => `${block.type}: ${block.file_name || block.url || 'Unknown'}`)

              let contentPreview = ''
              if (textContent) {
                contentPreview += `Content: ${textContent}...`
              }
              if (files && files.length > 0) {
                contentPreview += (contentPreview ? '\n  ' : '') + `Files: ${files.join(', ')}`
              }

              enrichedPages.push({
                ...page,
                contentPreview,
                hasFiles: files && files.length > 0,
                fileCount: files ? files.length : 0
              })
            } else {
              enrichedPages.push(page)
            }
          } catch (error) {
            console.error(`Error getting page content for ${page.id}:`, error)
            enrichedPages.push(page)
          }
          }
        }

        // Process database results
        for (const dbResult of databaseResults) {
          try {
            const dbEntries = dbResult.entries.slice(0, 5) // Limit entries per database

            for (const entry of dbEntries) {
              // Extract properties from database entry
              const properties = entry.properties || {}

              // Prioritize description-like fields
              const descriptionFields = ['description', 'notes', 'summary', 'content', 'details', 'text', 'body']
              let descriptionContent = ''
              let otherProperties: string[] = []

              Object.entries(properties).forEach(([key, value]: [string, any]) => {
                const keyLower = key.toLowerCase()
                const isDescriptionField = descriptionFields.some(field => keyLower.includes(field))
                const isUrlField = keyLower.includes('url') || keyLower.includes('link')

                // Handle different property types
                if (value.type === 'title' && value.title?.[0]?.plain_text) {
                  if (!isDescriptionField) {
                    otherProperties.push(`${key}: ${value.title[0].plain_text}`)
                  }
                } else if (value.type === 'rich_text' && value.rich_text?.length) {
                  // Extract full rich_text content, not just first element
                  const fullText = value.rich_text
                    .map((text: any) => text.plain_text)
                    .join('')
                    .trim()

                  if (fullText) {
                    if (isDescriptionField) {
                      // Prioritize description fields - give them more space
                      descriptionContent = `${key}: ${fullText.slice(0, 200)}${fullText.length > 200 ? '...' : ''}`
                    } else {
                      otherProperties.push(`${key}: ${fullText.slice(0, 50)}${fullText.length > 50 ? '...' : ''}`)
                    }
                  }
                } else if (value.type === 'url' && value.url) {
                  // Handle URL fields specifically
                  otherProperties.push(`${key}: ${value.url}`)
                } else if (value.type === 'files' && value.files?.length) {
                  // Handle file attachments
                  const fileNames = value.files.map((file: any) => file.name || 'file').join(', ')
                  otherProperties.push(`${key}: ${fileNames}`)
                } else if (value.type === 'select' && value.select?.name) {
                  otherProperties.push(`${key}: ${value.select.name}`)
                } else if (value.type === 'multi_select' && value.multi_select?.length) {
                  otherProperties.push(`${key}: ${value.multi_select.map((s: any) => s.name).join(', ')}`)
                } else if (value.type === 'date' && value.date?.start) {
                  otherProperties.push(`${key}: ${value.date.start}`)
                } else if (value.type === 'number' && value.number !== null) {
                  otherProperties.push(`${key}: ${value.number}`)
                } else if (value.type === 'checkbox' && value.checkbox !== undefined) {
                  otherProperties.push(`${key}: ${value.checkbox ? 'Yes' : 'No'}`)
                }
              })

              // Combine description and other properties
              const propertyParts = []
              if (descriptionContent) {
                propertyParts.push(descriptionContent)
              }
              // Add up to 3 other properties if there's space
              propertyParts.push(...otherProperties.slice(0, descriptionContent ? 2 : 4))

              const propertyText = propertyParts.join(' | ')

              // Extract title from database entry
              let entryTitle = 'Database Entry'
              const titleProp = Object.values(properties).find((prop: any) =>
                prop.type === 'title' && prop.title?.[0]?.plain_text
              )
              if (titleProp) {
                entryTitle = (titleProp as any).title[0].plain_text
              }

              // Detect if this entry has files or URLs
              const hasUrls = Object.values(properties).some((prop: any) => prop.type === 'url' && prop.url)
              const hasFiles = Object.values(properties).some((prop: any) => prop.type === 'files' && prop.files?.length)

              enrichedPages.push({
                id: entry.id,
                title: entryTitle,
                object: 'database_entry',
                url: entry.url,
                contentPreview: `Database: ${dbResult.database.title || 'Unnamed'}\n  ${propertyText}`,
                hasFiles: hasFiles,
                hasUrls: hasUrls,
                fileCount: hasFiles ? Object.values(properties).filter((prop: any) => prop.type === 'files').reduce((count: number, prop: any) => count + (prop.files?.length || 0), 0) : 0,
                database: dbResult.database.title,
                subject: dbResult.subject || 'General',
                searchTerms: dbResult.searchTerms || []
              })
            }
          } catch (error) {
            console.error(`Error processing database result:`, error)
          }
        }

        const pageList = enrichedPages.map((page: any) => {
          let contentLine = `- **${page.title}** (${page.object}): ${page.url}`

          if (page.contentPreview) {
            contentLine += `\n  ${page.contentPreview}`
          }

          // Add content type indicators
          const indicators = []
          if (page.hasFiles) indicators.push(`${page.fileCount} files attached`)
          if (page.hasUrls) indicators.push('Contains URLs')
          if (page.object === 'database_entry' && page.subject) indicators.push(`Subject: ${page.subject}`)

          if (indicators.length > 0) {
            contentLine += `\n  [${indicators.join(' | ')}]`
          }

          return contentLine
        }).join('\n')

        const hasPages = searchResult?.results?.length > 0
        const hasDatabases = databaseResults.length > 0

        notionSearchResults = `

===== NOTION WORKSPACE CONTENT FOUND =====

Based on your query "${searchQuery}", I found relevant content in your workspace:
${hasPages ? `\n**Pages:**` : ''}${hasDatabases ? `\n**Database Entries:**` : ''}

${pageList}

CRITICAL: YOU MUST ONLY USE THE CONTENT ABOVE TO ANSWER THE QUESTION.

STRICT INSTRUCTIONS:
1. ONLY use information from the Notion pages and database entries listed above
2. DO NOT use general knowledge or external information
3. If the Notion content doesn't fully answer the question, say "Based on your workspace, [partial answer from Notion], but I don't have additional information in your Notion workspace to fully answer this question."
4. Always cite MULTIPLE relevant sources when available - don't just use one
5. Reference different pages/database entries for different aspects of your answer
6. MENTION FILES AND ATTACHMENTS when you see "[X files attached]" indicators
7. MENTION URLs when you see "[Contains URLs]" indicators - these are clickable resources
8. When citing database entries, mention the database name and subject area when shown
9. For educational content, organize by subject areas when multiple subjects are present
10. Use [source] hyperlinked citations throughout the text

HYPERLINKED CITATIONS:
Use [source] citations that link directly to the sources: [source](URL) format.
CRITICAL: Place citations at the END of sentences or paragraphs, not at the beginning.

Example response with properly placed citations:
"The CALM framework includes: Check for safety, Avoid power struggles, Let others know, Make sure an adult stays [source](https://www.notion.so/send-space-url). Your Student Database contains relevant information about implementation strategies [source](database-entry-url)."

Citation format: [source](actual-notion-url) - ALWAYS at the END of the relevant sentence or paragraph.

ALWAYS cite the Notion sources and stick strictly to the workspace content.

`
      } else {
        // No Notion results found - enforce Notion-only mode
        notionSearchResults = `

===== NO RELEVANT NOTION CONTENT FOUND =====

I searched your Notion workspace for "${searchQuery}" but couldn't find any relevant content.

CRITICAL INSTRUCTION:
You MUST respond with: "I couldn't find information about '${searchQuery}' in your existing knowledge base. Please check that:
1. You might want to search for related terms or check your workspace organization
2. If this information should be in your workspace, you may need to create or update the relevant pages"

DO NOT provide general knowledge or external information. Only respond with the message above.

`
      }
    }
  } catch (error) {
    console.error('Error searching Notion:', error)
  }

  prompt += notionSearchResults

  prompt += `

===== RESPONSE GUIDELINES =====

IMPORTANT: Structure your responses with proper formatting:

1. **Direct answer** addressing the core question
2. **Key frameworks/information** from the search results with inline [source] citations
3. **NO separate reading section** - use only inline citations

CITATION FORMAT REQUIREMENTS:
- Use [source] hyperlinked citations: [source](URL)
- Reference sources directly in the text flow
- Multiple sources should be cited throughout the response

Keep responses clean and focused with inline citations only.`

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
