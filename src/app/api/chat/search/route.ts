import { NextRequest } from 'next/server'
import { openai, OPENAI_CONFIG, SYSTEM_PROMPT } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, recordRateLimit, trackUsage, calculateCost } from '@/lib/openai/rate-limit'

export const runtime = 'edge'

interface SearchRequest {
  message: string
  conversationHistory: any[]
  subject?: string
  level?: string
  contentType?: string
  isPTMRequest?: boolean
}

/**
 * POST /api/chat/search
 * Parameterized search endpoint with explicit subject/level filtering
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { message, conversationHistory = [], subject, level, contentType, isPTMRequest = false } = body

    console.log('🔍 Parameterized search request:', { message, subject, level, contentType })

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check authentication (same as stream route)
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID
    let userId: string

    if (mockMode && mockTeacherId) {
      userId = mockTeacherId
    } else {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      userId = user.id
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId, 'chat')
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. You can send ${rateCheck.remaining} more messages.`,
          rateLimitExceeded: true,
          resetAt: rateCheck.resetAt.toISOString(),
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await recordRateLimit(userId, 'chat', 'search')

    // Build enhanced system prompt with parameterized search
    const systemPrompt = await buildParameterizedSystemPrompt(isPTMRequest, userId, message, subject, level, contentType)

    // Prepare messages for OpenAI
    const recentHistory = conversationHistory.slice(-10)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ]

    // Create OpenAI completion (non-streaming for parameterized search)
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.chat.model,
      messages: messages as any,
      temperature: OPENAI_CONFIG.chat.temperature,
      max_tokens: OPENAI_CONFIG.chat.max_tokens,
    } as any)

    const response = completion.choices[0]?.message?.content || 'No response generated'

    // Track usage
    const promptTokens = completion.usage?.prompt_tokens || 0
    const completionTokens = completion.usage?.completion_tokens || 0
    const totalTokens = completion.usage?.total_tokens || 0
    const estimatedCost = calculateCost({
      model: OPENAI_CONFIG.chat.model,
      promptTokens,
      completionTokens,
    })

    trackUsage({
      userId,
      type: 'chat',
      model: OPENAI_CONFIG.chat.model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      requestData: { message, subject, level, contentType, isPTMRequest },
      responseData: { responseLength: response.length },
    }).catch((err) => console.error('Failed to track usage:', err))

    return new Response(
      JSON.stringify({
        response,
        searchParameters: { subject, level, contentType },
        tokensUsed: totalTokens
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Parameterized search error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process search request',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Build system prompt with explicit parameters
 */
async function buildParameterizedSystemPrompt(
  isPTMRequest: boolean,
  userId: string,
  message: string,
  subject?: string,
  level?: string,
  contentType?: string
): Promise<string> {
  let prompt = SYSTEM_PROMPT

  // Add Notion content with explicit parameters
  let notionSearchResults = ''
  try {
    const { default: NotionMCPService } = await import('@/lib/notion/mcp-server')
    const notionApiKey = process.env.NOTION_API_KEY

    if (notionApiKey) {
      const notionMCP = new NotionMCPService({
        apiKey: notionApiKey,
        version: process.env.NOTION_VERSION || '2022-06-28'
      })

      console.log('🎯 Parameterized search:', { subject, level, contentType })

      // Get all databases first
      const allContentResult = await notionMCP.executeTool('notion_search', {
        query: '',
        filter: { object: 'database' }
      })

      let enrichedPages: any[] = []

      if (allContentResult?.results?.length) {
        for (const db of allContentResult.results.slice(0, 5)) {
          try {
            // Build explicit filters based on parameters
            let filter: any = undefined

            if (subject || level || contentType) {
              const filterConditions: any[] = []

              // Subject filtering
              if (subject) {
                const subjectVariations = [
                  subject,
                  subject.charAt(0).toUpperCase() + subject.slice(1),
                  subject.toUpperCase()
                ]

                for (const variation of subjectVariations) {
                  filterConditions.push(
                    { property: 'Subject', select: { equals: variation } },
                    { property: 'Type', select: { equals: variation } },
                    { property: 'Level', multi_select: { contains: variation } },
                    { property: 'Category', multi_select: { contains: variation } }
                  )
                }
              }

              // Level filtering
              if (level) {
                const levelVariations = [
                  level,
                  level.charAt(0).toUpperCase() + level.slice(1),
                  `${level.charAt(0).toUpperCase()}${level.slice(1)} School`
                ]

                for (const variation of levelVariations) {
                  filterConditions.push(
                    { property: 'Level', multi_select: { contains: variation } },
                    { property: 'Type', select: { equals: variation } }
                  )
                }
              }

              // Content type filtering
              if (contentType) {
                const typeVariations = [
                  contentType,
                  contentType.charAt(0).toUpperCase() + contentType.slice(1)
                ]

                for (const variation of typeVariations) {
                  filterConditions.push(
                    { property: 'Type', select: { equals: variation } },
                    { property: 'Category', multi_select: { contains: variation } }
                  )
                }
              }

              if (filterConditions.length > 0) {
                filter = { or: filterConditions.slice(0, 10) }
              }
            }

            const dbResult = await notionMCP.executeTool('notion_get_database', {
              database_id: db.id,
              page_size: 20,
              filter
            })

            console.log(`📊 Database ${db.title} returned ${dbResult?.results?.length || 0} entries for parameters`)

            if (dbResult?.results?.length) {
              // Process database entries (similar to stream route)
              for (const entry of dbResult.results) {
                const properties = entry.properties || {}

                // Extract title
                let entryTitle = 'Database Entry'
                const titleProp = Object.values(properties).find((prop: any) =>
                  prop.type === 'title' && prop.title?.[0]?.plain_text
                )
                if (titleProp) {
                  entryTitle = (titleProp as any).title[0].plain_text
                }

                // Extract properties
                const propertyText = Object.entries(properties)
                  .map(([key, value]: [string, any]) => {
                    if (value.type === 'select' && value.select?.name) return `${key}: ${value.select.name}`
                    if (value.type === 'multi_select' && value.multi_select?.length) return `${key}: ${value.multi_select.map((s: any) => s.name).join(', ')}`
                    if (value.type === 'rich_text' && value.rich_text?.length) {
                      const text = value.rich_text.map((t: any) => t.plain_text).join('').trim()
                      return text ? `${key}: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}` : null
                    }
                    if (value.type === 'url' && value.url) return `${key}: ${value.url}`
                    return null
                  })
                  .filter(Boolean)
                  .join(' | ')

                enrichedPages.push({
                  id: entry.id,
                  title: entryTitle,
                  object: 'database_entry',
                  url: entry.url,
                  contentPreview: `Database: ${db.title}\n  ${propertyText}`,
                  database: db.title,
                  searchParameters: { subject, level, contentType }
                })
              }
            }
          } catch (error) {
            console.error(`Error querying database ${db.id} with parameters:`, error)
          }
        }
      }

      if (enrichedPages.length > 0) {
        const pageList = enrichedPages.map((page: any) =>
          `- **${page.title}** (${page.object}): ${page.url}\n  ${page.contentPreview}`
        ).join('\n')

        notionSearchResults = `

===== FILTERED NOTION WORKSPACE CONTENT =====

Search Parameters: ${subject ? `Subject: ${subject}` : ''}${level ? ` | Level: ${level}` : ''}${contentType ? ` | Type: ${contentType}` : ''}

Found content matching your criteria:

${pageList}

CRITICAL: YOU MUST ONLY USE THE FILTERED CONTENT ABOVE TO ANSWER THE QUESTION.

The content has been specifically filtered for ${subject || 'your query'}${level ? ` at ${level} level` : ''}${contentType ? ` focusing on ${contentType} content` : ''}.

Use [source] hyperlinked citations: [source](URL) format.

`
      } else {
        notionSearchResults = `

===== NO MATCHING CONTENT FOUND =====

I searched your Notion workspace with the specified parameters:
- Subject: ${subject || 'Any'}
- Level: ${level || 'Any'}
- Content Type: ${contentType || 'Any'}

No content was found matching these criteria. Please try:
1. Broadening your search parameters
2. Checking that content exists for these specific criteria
3. Verifying that the content is shared with the Notion integration

`
      }
    }
  } catch (error) {
    console.error('Error in parameterized Notion search:', error)
  }

  prompt += notionSearchResults
  return prompt
}