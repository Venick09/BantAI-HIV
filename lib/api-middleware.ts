import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from './rate-limit'
import { handleError, RateLimitError } from './errors'

export interface ApiMiddlewareOptions {
  rateLimiter?: RateLimiter
  requireAuth?: boolean
}

export function createApiResponse(
  data: any,
  status: number = 200,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(data, { status, headers })
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details })
    },
    { status }
  )
}

export async function withMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
): Promise<NextResponse> {
  try {
    // Apply rate limiting if configured
    if (options.rateLimiter) {
      const { allowed, remaining, resetTime } = await options.rateLimiter.checkLimit(request)
      
      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
        throw new RateLimitError(retryAfter)
      }
      
      // Add rate limit headers to response
      const response = await handler(request)
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
      
      // Mark as successful if status is 2xx
      if (response.status >= 200 && response.status < 300) {
        await options.rateLimiter.markSuccess(request)
      }
      
      return response
    }
    
    // Execute handler without rate limiting
    return await handler(request)
    
  } catch (error) {
    const { message, statusCode, details } = handleError(error)
    
    // Log server errors
    if (statusCode >= 500) {
      console.error('API error:', error)
    }
    
    return createErrorResponse(message, statusCode, details)
  }
}