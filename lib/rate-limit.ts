import { NextRequest } from 'next/server'

interface RateLimitStore {
  attempts: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxAttempts: number // Maximum number of attempts in the window
  keyGenerator?: (req: NextRequest) => string // Function to generate the key
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => {
        // Default: Use IP address as key
        const forwardedFor = req.headers.get('x-forwarded-for')
        const realIp = req.headers.get('x-real-ip')
        return forwardedFor?.split(',')[0] || realIp || '127.0.0.1'
      },
      skipSuccessfulRequests: false,
      ...config
    }
  }

  async checkLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator!(req)
    const now = Date.now()
    
    let record = rateLimitStore.get(key)
    
    if (!record || record.resetTime < now) {
      // Create new record
      record = {
        attempts: 1,
        resetTime: now + this.config.windowMs
      }
      rateLimitStore.set(key, record)
      
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: record.resetTime
      }
    }
    
    // Check if limit exceeded
    if (record.attempts >= this.config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }
    
    // Increment attempts
    record.attempts++
    rateLimitStore.set(key, record)
    
    return {
      allowed: true,
      remaining: this.config.maxAttempts - record.attempts,
      resetTime: record.resetTime
    }
  }

  // Mark request as successful (useful when skipSuccessfulRequests is true)
  async markSuccess(req: NextRequest): Promise<void> {
    if (!this.config.skipSuccessfulRequests) return
    
    const key = this.config.keyGenerator!(req)
    const record = rateLimitStore.get(key)
    
    if (record && record.attempts > 0) {
      record.attempts--
      rateLimitStore.set(key, record)
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
})

export const otpRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3 // 3 OTP requests per hour per IP
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 60 // 60 requests per minute
})