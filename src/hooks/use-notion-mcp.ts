import { useState, useCallback, useRef } from 'react'

export interface NotionMCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface NotionSearchResult {
  id: string
  title: string
  url?: string
  last_edited?: string
  created?: string
  object: string
}

export interface NotionPage {
  page: {
    id: string
    title: string
    url?: string
    last_edited?: string
    created?: string
    properties?: any
  }
  content?: any[]
}

export interface NotionMCPState {
  isConnected: boolean
  tools: NotionMCPTool[]
  loading: boolean
  error: string | null
}

/**
 * Hook for read-only interaction with Notion workspace via MCP
 */
export function useNotionMCP() {
  const [state, setState] = useState<NotionMCPState>({
    isConnected: false,
    tools: [],
    loading: false,
    error: null
  })

  // Cache for tools to avoid repeated API calls
  const toolsCache = useRef<NotionMCPTool[]>([])
  const isInitialized = useRef(false)

  /**
   * Initialize connection and load available tools
   */
  const initialize = useCallback(async () => {
    if (isInitialized.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/notion/mcp')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Notion')
      }

      toolsCache.current = data.tools || []
      isInitialized.current = true

      setState({
        isConnected: data.configured,
        tools: data.tools || [],
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Failed to initialize Notion MCP:', error)
      setState({
        isConnected: false,
        tools: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Notion'
      })
    }
  }, [])

  /**
   * Execute a Notion MCP tool
   */
  const executeTool = useCallback(async (toolName: string, args: Record<string, any> = {}) => {
    try {
      const response = await fetch('/api/notion/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'execute_tool',
          tool_name: toolName,
          args
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to execute tool: ${toolName}`)
      }

      return data.result
    } catch (error) {
      console.error(`Failed to execute tool ${toolName}:`, error)
      throw error
    }
  }, [])

  /**
   * Search Notion workspace
   */
  const searchNotionWorkspace = useCallback(async (
    query: string,
    filter?: any,
    sort?: any
  ): Promise<NotionSearchResult[]> => {
    const result = await executeTool('notion_search', { query, filter, sort })
    return result.results || []
  }, [executeTool])

  /**
   * Get content from a specific Notion page
   */
  const getNotionPage = useCallback(async (pageId: string): Promise<NotionPage> => {
    const result = await executeTool('notion_get_page', { page_id: pageId })
    return result
  }, [executeTool])

  /**
   * Query a Notion database
   */
  const queryNotionDatabase = useCallback(async (
    databaseId: string,
    filter?: any,
    sorts?: any[],
    pageSize?: number
  ): Promise<any> => {
    const result = await executeTool('notion_get_database', {
      database_id: databaseId,
      filter,
      sorts,
      page_size: pageSize
    })
    return result
  }, [executeTool])

  /**
   * Check if a specific tool is available
   */
  const hasTool = useCallback((toolName: string): boolean => {
    return state.tools.some(tool => tool.name === toolName)
  }, [state.tools])

  /**
   * Smart search that tries to understand user intent and provides suggestions
   */
  const smartSearch = useCallback(async (query: string): Promise<{
    pages: NotionSearchResult[]
    suggestions: string[]
  }> => {
    // Search for pages
    const pages = await searchNotionWorkspace(query)

    // Generate search suggestions based on common patterns
    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('lesson') || lowerQuery.includes('plan')) {
      suggestions.push('lesson plans', 'curriculum', 'teaching resources')
    }
    if (lowerQuery.includes('student') || lowerQuery.includes('grade')) {
      suggestions.push('student records', 'assessment data', 'progress reports')
    }
    if (lowerQuery.includes('meeting') || lowerQuery.includes('note')) {
      suggestions.push('meeting notes', 'action items', 'follow-ups')
    }
    if (lowerQuery.includes('schedule') || lowerQuery.includes('calendar')) {
      suggestions.push('schedules', 'timetables', 'events')
    }

    return { pages, suggestions }
  }, [searchNotionWorkspace])

  return {
    // State
    ...state,

    // Actions
    initialize,
    executeTool,

    // Read-only convenience methods
    searchNotionWorkspace,
    getNotionPage,
    queryNotionDatabase,
    smartSearch,
    hasTool
  }
}