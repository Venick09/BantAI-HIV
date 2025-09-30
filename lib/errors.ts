/**
 * Custom error classes for better error handling
 */

export class BaseError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(message: string, statusCode: number, isOperational = true, details?: any) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details)
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true)
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true)
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, true)
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 409, true, details)
  }
}

export class RateLimitError extends BaseError {
  constructor(retryAfter: number) {
    super('Too many requests', 429, true, { retryAfter })
  }
}

export class ExternalServiceError extends BaseError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      503,
      false,
      originalError ? { originalError: originalError.message } : undefined
    )
  }
}

export class DatabaseError extends BaseError {
  constructor(operation: string, originalError?: Error) {
    super(
      `Database error during ${operation}`,
      500,
      false,
      originalError ? { originalError: originalError.message } : undefined
    )
  }
}

/**
 * Error handler utility
 */
export function handleError(error: unknown): {
  message: string
  statusCode: number
  details?: any
} {
  // Handle known errors
  if (error instanceof BaseError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return {
      message: 'Validation failed',
      statusCode: 400,
      details: error
    }
  }

  // Handle Prisma/Drizzle errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any
    
    // Unique constraint violation
    if (dbError.code === 'P2002' || dbError.code === '23505') {
      return {
        message: 'Resource already exists',
        statusCode: 409,
        details: { code: dbError.code }
      }
    }
    
    // Foreign key constraint violation
    if (dbError.code === 'P2003' || dbError.code === '23503') {
      return {
        message: 'Related resource not found',
        statusCode: 400,
        details: { code: dbError.code }
      }
    }
    
    // Not found
    if (dbError.code === 'P2025') {
      return {
        message: 'Resource not found',
        statusCode: 404,
        details: { code: dbError.code }
      }
    }
  }

  // Handle standard errors
  if (error instanceof Error) {
    return {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      statusCode: 500
    }
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  }
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      const { message, statusCode, details } = handleError(error)
      
      // Log error for monitoring
      if (statusCode >= 500) {
        console.error('Server error:', error)
      }
      
      // Return error response
      return new Response(
        JSON.stringify({
          success: false,
          error: message,
          ...(details && process.env.NODE_ENV !== 'production' && { details })
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }) as T
}