import { NextRequest, NextResponse } from 'next/server'
import NotionMCPService from '@/lib/notion/mcp-server'

export const runtime = 'nodejs'

/**
 * Debug endpoint to test Notion integration
 * GET /api/notion/debug
 */
export async function GET(request: NextRequest) {
  try {
    const notionApiKey = process.env.NOTION_API_KEY
    if (!notionApiKey) {
      return NextResponse.json(
        { error: 'Notion API key not configured' },
        { status: 500 }
      )
    }

    const notionMCP = new NotionMCPService({
      apiKey: notionApiKey,
      version: process.env.NOTION_VERSION || '2022-06-28'
    })

    // Test search with a very broad query
    const searchResult = await notionMCP.executeTool('notion_search', {
      query: '' // Empty query should return everything accessible
    })

    return NextResponse.json({
      success: true,
      searchResult,
      totalResults: searchResult?.results?.length || 0,
      message: searchResult?.results?.length > 0
        ? 'Found accessible content'
        : 'No accessible content found - check if pages are shared with integration'
    })

  } catch (error) {
    console.error('Notion debug error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}