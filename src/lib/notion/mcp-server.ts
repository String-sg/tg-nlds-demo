/**
 * Notion MCP Server Integration
 * Provides a bridge between the web app and Notion workspace
 */

import { Client } from '@notionhq/client'

// MCP Server types (simplified)
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

interface NotionMCPConfig {
  apiKey: string
  version?: string
}

export class NotionMCPService {
  private client: Client
  private tools: MCPTool[]

  constructor(config: NotionMCPConfig) {
    this.client = new Client({
      auth: config.apiKey,
      notionVersion: config.version || '2022-06-28'
    })

    // Read-only tools for Notion workspace access
    this.tools = [
      {
        name: 'notion_search',
        description: 'Search across all accessible pages and databases in the Notion workspace',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute'
            },
            filter: {
              type: 'object',
              description: 'Optional filter to limit search scope'
            },
            sort: {
              type: 'object',
              description: 'Optional sort configuration'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'notion_get_page',
        description: 'Retrieve content from a specific Notion page',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'The ID of the page to retrieve'
            }
          },
          required: ['page_id']
        }
      },
      {
        name: 'notion_get_database',
        description: 'Query a Notion database and retrieve entries (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The ID of the database to query'
            },
            filter: {
              type: 'object',
              description: 'Filter criteria for database query'
            },
            sorts: {
              type: 'array',
              description: 'Sort configuration for results'
            },
            page_size: {
              type: 'number',
              description: 'Number of results to return (max 100)'
            }
          },
          required: ['database_id']
        }
      }
    ]
  }

  /**
   * Get available MCP tools
   */
  getTools(): MCPTool[] {
    return this.tools
  }

  /**
   * Execute a read-only MCP tool
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    try {
      switch (toolName) {
        case 'notion_search':
          return await this.searchPages(args.query, args.filter, args.sort)

        case 'notion_get_page':
          return await this.getPage(args.page_id)

        case 'notion_get_database':
          return await this.queryDatabase(args.database_id, args.filter, args.sorts, args.page_size)

        default:
          throw new Error(`Unknown or unsupported tool: ${toolName}. Only read-only operations are supported.`)
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error)
      throw error
    }
  }

  /**
   * Search across Notion workspace
   */
  private async searchPages(query: string, filter?: any, sort?: any) {
    const response = await this.client.search({
      query,
      filter,
      sort,
      page_size: 20
    })

    return {
      results: response.results.map(page => ({
        id: page.id,
        title: this.extractPageTitle(page),
        url: (page as any).url,
        last_edited: (page as any).last_edited_time,
        created: (page as any).created_time,
        object: page.object
      })),
      has_more: response.has_more,
      next_cursor: response.next_cursor
    }
  }

  /**
   * Get page content
   */
  private async getPage(pageId: string) {
    // Get page metadata
    const page = await this.client.pages.retrieve({ page_id: pageId })

    // Get page content blocks
    const blocks = await this.client.blocks.children.list({
      block_id: pageId,
      page_size: 50
    })

    return {
      page: {
        id: page.id,
        title: this.extractPageTitle(page),
        url: (page as any).url,
        last_edited: (page as any).last_edited_time,
        created: (page as any).created_time,
        properties: (page as any).properties
      },
      content: blocks.results.map(block => this.formatBlock(block))
    }
  }

  /**
   * Query database
   */
  private async queryDatabase(databaseId: string, filter?: any, sorts?: any[], pageSize: number = 20) {
    const response = await (this.client.databases as any).query({
      database_id: databaseId,
      filter,
      sorts,
      page_size: Math.min(pageSize, 100)
    })

    return {
      results: response.results.map((page: any) => ({
        id: page.id,
        properties: page.properties,
        url: page.url,
        created: page.created_time,
        last_edited: page.last_edited_time
      })),
      has_more: response.has_more,
      next_cursor: response.next_cursor
    }
  }


  /**
   * Extract page title from page object
   */
  private extractPageTitle(page: any): string {
    try {
      if (page.properties?.title?.title?.[0]?.plain_text) {
        return page.properties.title.title[0].plain_text
      }
      if (page.properties?.Name?.title?.[0]?.plain_text) {
        return page.properties.Name.title[0].plain_text
      }
      if (page.properties) {
        // Find any title property
        const titleProp = Object.values(page.properties).find((prop: any) =>
          prop.type === 'title' && prop.title?.[0]?.plain_text
        )
        if (titleProp) {
          return (titleProp as any).title[0].plain_text
        }
      }
      return 'Untitled'
    } catch {
      return 'Untitled'
    }
  }

  /**
   * Format block content for display
   */
  private formatBlock(block: any): any {
    const baseBlock = {
      id: block.id,
      type: block.type,
      created: block.created_time,
      last_edited: block.last_edited_time
    }

    switch (block.type) {
      case 'paragraph':
        return {
          ...baseBlock,
          text: block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        return {
          ...baseBlock,
          text: block[block.type]?.rich_text?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return {
          ...baseBlock,
          text: block[block.type]?.rich_text?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'to_do':
        return {
          ...baseBlock,
          text: block.to_do?.rich_text?.map((t: any) => t.plain_text).join('') || '',
          checked: block.to_do?.checked || false
        }
      case 'file':
        return {
          ...baseBlock,
          type: 'file',
          file_url: block.file?.url || block.file?.file?.url,
          file_name: block.file?.name || block.file?.file?.name || 'Unnamed file',
          caption: block.file?.caption?.map((t: any) => t.plain_text).join('') || '',
          file_type: block.file?.type || 'unknown'
        }
      case 'pdf':
        return {
          ...baseBlock,
          type: 'pdf',
          file_url: block.pdf?.url || block.pdf?.file?.url,
          file_name: block.pdf?.name || block.pdf?.file?.name || 'Unnamed PDF',
          caption: block.pdf?.caption?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'video':
        return {
          ...baseBlock,
          type: 'video',
          file_url: block.video?.url || block.video?.file?.url || block.video?.external?.url,
          file_name: block.video?.name || block.video?.file?.name || 'Video',
          caption: block.video?.caption?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'image':
        return {
          ...baseBlock,
          type: 'image',
          file_url: block.image?.url || block.image?.file?.url || block.image?.external?.url,
          file_name: block.image?.name || block.image?.file?.name || 'Image',
          caption: block.image?.caption?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'audio':
        return {
          ...baseBlock,
          type: 'audio',
          file_url: block.audio?.url || block.audio?.file?.url || block.audio?.external?.url,
          file_name: block.audio?.name || block.audio?.file?.name || 'Audio',
          caption: block.audio?.caption?.map((t: any) => t.plain_text).join('') || ''
        }
      case 'embed':
        return {
          ...baseBlock,
          type: 'embed',
          url: block.embed?.url,
          caption: block.embed?.caption?.map((t: any) => t.plain_text).join('') || ''
        }
      default:
        // Log unknown block types for debugging
        console.log('Unknown block type:', block.type, block)
        return baseBlock
    }
  }
}

export default NotionMCPService