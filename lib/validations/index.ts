export * from './auth'
export * from './sms'
export * from './user'

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { createErrorResponse } from '@/lib/api-middleware'

/**
 * Validates request body against a Zod schema
 * @param request NextRequest object
 * @param schema Zod schema to validate against
 * @returns Parsed and validated data or error response
 */
export async function validateRequest<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: Response }> {
  try {
    const body = await request.json()
    const parsed = schema.parse(body)
    
    return { data: parsed, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      
      return {
        data: null,
        error: createErrorResponse('Validation failed', 400, { errors })
      }
    }
    
    if (error instanceof SyntaxError) {
      return {
        data: null,
        error: createErrorResponse('Invalid JSON', 400)
      }
    }
    
    return {
      data: null,
      error: createErrorResponse('Invalid request', 400)
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param request NextRequest object
 * @param schema Zod schema to validate against
 * @returns Parsed and validated data or error response
 */
export function validateQuery<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: Response } {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const parsed = schema.parse(params)
    
    return { data: parsed, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      
      return {
        data: null,
        error: createErrorResponse('Invalid query parameters', 400, { errors })
      }
    }
    
    return {
      data: null,
      error: createErrorResponse('Invalid request', 400)
    }
  }
}