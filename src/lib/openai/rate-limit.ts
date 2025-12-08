import { createServiceClient } from '@/lib/supabase/server'

/**
 * Rate limit configuration
 * Prevents abuse and controls OpenAI API costs
 */
export const RATE_LIMITS = {
  chat: {
    requests: 10,
    window: 60 * 1000, // 1 minute in milliseconds
  },
  image: {
    requests: 5,
    window: 60 * 1000, // 1 minute in milliseconds
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Check if a user has exceeded their rate limit
 *
 * @param userId - Teacher's user ID
 * @param type - Type of request ('chat' or 'image')
 * @returns true if rate limit is OK, false if exceeded
 */
export async function checkRateLimit(
  userId: string,
  type: RateLimitType
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  try {
    const supabase = createServiceClient()
    const config = RATE_LIMITS[type]

    // Calculate time window start
    const windowStart = new Date(Date.now() - config.window)

    // Count recent requests within the time window
    // Note: rate_limits table exists but types may not be generated yet
    const { data, error } = (await supabase
      .from('rate_limits' as any)
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })) as {
      data: Array<{ id: string; created_at: string }> | null
      error: any
    }

    if (error) {
      console.error('Rate limit check error:', error)
      // SECURITY: On error, deny the request (fail closed)
      return { allowed: false, remaining: 0, resetAt: new Date(Date.now() + config.window) }
    }

    const requestCount = data?.length || 0
    const remaining = Math.max(0, config.requests - requestCount)

    // Calculate when the rate limit will reset (oldest request + window)
    let resetAt = new Date(Date.now() + config.window)
    if (data && data.length > 0) {
      const oldestRequest = new Date(data[data.length - 1].created_at)
      resetAt = new Date(oldestRequest.getTime() + config.window)
    }

    return {
      allowed: requestCount < config.requests,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // SECURITY: On error, deny the request (fail closed)
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + RATE_LIMITS[type].window),
    }
  }
}

/**
 * Record a rate limit event
 *
 * @param userId - Teacher's user ID
 * @param type - Type of request ('chat' or 'image')
 * @param endpoint - Optional endpoint name
 */
export async function recordRateLimit(
  userId: string,
  type: RateLimitType,
  endpoint?: string
): Promise<void> {
  try {
    const supabase = createServiceClient()

    // Note: rate_limits table exists but types may not be generated yet
    await supabase.from('rate_limits' as any).insert({
      user_id: userId,
      type,
      endpoint,
    })
  } catch (error) {
    console.error('Failed to record rate limit:', error)
    // Don't throw - rate limiting is best effort
  }
}

/**
 * Track OpenAI API usage for cost monitoring and analytics
 *
 * @param params - Usage tracking parameters
 */
export async function trackUsage(params: {
  userId: string
  type: RateLimitType
  model: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  estimatedCost?: number
  requestData?: any
  responseData?: any
  error?: string
}): Promise<void> {
  try {
    const supabase = createServiceClient()

    // Note: openai_usage table exists but types may not be generated yet
    await supabase.from('openai_usage' as any).insert({
      user_id: params.userId,
      type: params.type,
      model: params.model,
      prompt_tokens: params.promptTokens || 0,
      completion_tokens: params.completionTokens || 0,
      total_tokens: params.totalTokens || 0,
      estimated_cost: params.estimatedCost || 0,
      request_data: params.requestData,
      response_data: params.responseData,
      error: params.error,
    })
  } catch (error) {
    console.error('Failed to track usage:', error)
    // Don't throw - tracking is best effort
  }
}

/**
 * Calculate estimated cost for OpenAI API usage
 * Pricing as of November 2025
 */
export function calculateCost(params: {
  model: string
  promptTokens?: number
  completionTokens?: number
  imageCount?: number
}): number {
  const { model, promptTokens = 0, completionTokens = 0, imageCount = 0 } = params

  // GPT-5 models (per 1M tokens)
  // Note: Pricing estimates based on GPT-5 release - verify with OpenAI pricing page
  if (model === 'gpt-5-mini') {
    const inputCost = (promptTokens / 1_000_000) * 0.2 // Estimated $0.200 per 1M input tokens
    const outputCost = (completionTokens / 1_000_000) * 0.8 // Estimated $0.800 per 1M output tokens
    return inputCost + outputCost
  }

  if (model === 'gpt-5-nano') {
    const inputCost = (promptTokens / 1_000_000) * 0.1 // Estimated $0.100 per 1M input tokens
    const outputCost = (completionTokens / 1_000_000) * 0.4 // Estimated $0.400 per 1M output tokens
    return inputCost + outputCost
  }

  if (model === 'gpt-5') {
    const inputCost = (promptTokens / 1_000_000) * 1.0 // Estimated $1.00 per 1M input tokens
    const outputCost = (completionTokens / 1_000_000) * 3.0 // Estimated $3.00 per 1M output tokens
    return inputCost + outputCost
  }

  // GPT-4 models (per 1M tokens)
  if (model === 'gpt-4o-mini') {
    const inputCost = (promptTokens / 1_000_000) * 0.15 // $0.150 per 1M input tokens
    const outputCost = (completionTokens / 1_000_000) * 0.6 // $0.600 per 1M output tokens
    return inputCost + outputCost
  }

  if (model === 'gpt-4o') {
    const inputCost = (promptTokens / 1_000_000) * 5.0 // $5.00 per 1M input tokens
    const outputCost = (completionTokens / 1_000_000) * 15.0 // $15.00 per 1M output tokens
    return inputCost + outputCost
  }

  // Image models (per image)
  if (model === 'dall-e-3') {
    return imageCount * 0.04 // $0.040 per standard quality image (1024x1024)
  }

  // Unknown model - return 0
  return 0
}
