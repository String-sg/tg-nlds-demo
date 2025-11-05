import OpenAI from 'openai'

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable')
}

/**
 * OpenAI client instance
 * Configured for Singapore primary school education context
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: process.env.OPENAI_ORG_ID,
})

/**
 * Default configuration for OpenAI API calls
 */
export const OPENAI_CONFIG = {
  /**
   * Chat completion settings
   * Using GPT-5-mini for latest model capabilities
   * Note: GPT-5 models don't support temperature, top_p, logprobs, or max_output_tokens
   * Instead, use reasoning_effort and verbosity parameters to control output
   */
  chat: {
    model: 'gpt-5-mini' as const,
    reasoning_effort: 'medium' as const, // Options: minimal, low, medium, high
    verbosity: 'medium' as const, // Options: low, medium, high
    stream: true, // Enable streaming by default
  },

  /**
   * Image generation settings
   * Using gpt-image-1 for high-quality student portraits with reference image support
   */
  image: {
    model: 'gpt-image-1' as const,
    size: '1024x1024' as const,
    quality: 'high' as const,
    style: 'natural' as const,
  },
} as const

/**
 * System prompt for the teaching assistant
 * Provides context about the application and expected behavior
 */
export const SYSTEM_PROMPT = `You are an AI teaching assistant for Singapore primary school teachers.

Your Role:
- Help teachers prepare for parent-teacher meetings
- Provide insights on student performance and behavior
- Suggest teaching strategies and interventions
- Answer questions about student data and trends

Guidelines:
- Be professional, supportive, and concise
- Use Singapore education terminology (e.g., "form class", "form teacher", "P5", "P6")
- Focus on actionable insights and practical advice
- Respect student privacy - never suggest sharing sensitive information externally
- When discussing students, balance concerns with positive highlights

Current Context:
- Academic Year: 2025
- Education System: Singapore Primary School (P1-P6)
- School Type: Government Primary School
`
