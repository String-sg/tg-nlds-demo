import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import NotionMCPService from '@/lib/notion/mcp-server'

export const runtime = 'nodejs' // Notion client requires Node.js runtime

interface NotionMCPRequest {
  action: 'list_tools' | 'execute_tool'
  tool_name?: string
  args?: Record<string, any>
}

/**
 * POST /api/notion/mcp
 * Notion MCP server endpoint for tool execution
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: NotionMCPRequest = await request.json()
    const { action, tool_name, args = {} } = body

    // Get authenticated user
    const supabase = await createClient()
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      userId = mockTeacherId
    } else {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Get Notion API key from environment
    const notionApiKey = process.env.NOTION_API_KEY
    if (!notionApiKey) {
      return NextResponse.json(
        { error: 'Notion integration not configured. Please set NOTION_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Initialize Notion MCP service
    const notionMCP = new NotionMCPService({
      apiKey: notionApiKey,
      version: process.env.NOTION_VERSION || '2022-06-28'
    })

    // Handle different actions
    switch (action) {
      case 'list_tools':
        const tools = notionMCP.getTools()
        return NextResponse.json({ tools })

      case 'execute_tool':
        if (!tool_name) {
          return NextResponse.json(
            { error: 'tool_name is required for execute_tool action' },
            { status: 400 }
          )
        }

        try {
          const result = await notionMCP.executeTool(tool_name, args)
          return NextResponse.json({ result })
        } catch (toolError) {
          console.error(`Tool execution error for ${tool_name}:`, toolError)
          return NextResponse.json(
            {
              error: `Tool execution failed: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`,
              tool_name
            },
            { status: 400 }
          )
        }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Notion MCP API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process Notion MCP request',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notion/mcp
 * Get available Notion MCP tools
 */
export async function GET(request: NextRequest) {
  try {
    // Get Notion API key from environment
    const notionApiKey = process.env.NOTION_API_KEY
    if (!notionApiKey) {
      return NextResponse.json(
        { error: 'Notion integration not configured' },
        { status: 500 }
      )
    }

    // Initialize Notion MCP service
    const notionMCP = new NotionMCPService({
      apiKey: notionApiKey,
      version: process.env.NOTION_VERSION || '2022-06-28'
    })

    const tools = notionMCP.getTools()
    return NextResponse.json({
      tools,
      status: 'connected',
      configured: true
    })

  } catch (error) {
    console.error('Notion MCP GET error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get Notion MCP tools',
        status: 'error',
        configured: false
      },
      { status: 500 }
    )
  }
}