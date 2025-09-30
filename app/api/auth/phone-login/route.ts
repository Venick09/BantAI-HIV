import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users, otpVerifications } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { SMSService } from '@/lib/sms/sms-service'
import { OTPService } from '@/lib/sms/otp'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { withMiddleware, createApiResponse, createErrorResponse } from '@/lib/api-middleware'
import { authRateLimiter, otpRateLimiter } from '@/lib/rate-limit'
import { validateRequest, phoneLoginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  return withMiddleware(request, async (req) => {
    // Validate request body
    const validation = await validateRequest(req, phoneLoginSchema)
    if (validation.error) {
      return validation.error
    }
    
    const { phoneNumber, action } = validation.data
    const otp = 'otp' in validation.data ? validation.data.otp : undefined

    if (action === 'send-otp') {
      // Apply OTP rate limiting
      const otpCheck = await otpRateLimiter.checkLimit(req)
      if (!otpCheck.allowed) {
        const retryAfter = Math.ceil((otpCheck.resetTime - Date.now()) / 1000)
        return createErrorResponse('Too many OTP requests. Please try again later.', 429, {
          retryAfter,
          resetTime: new Date(otpCheck.resetTime).toISOString()
        })
      }
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1)

      if (!user) {
        return createErrorResponse('Phone number not registered. Please register first.')
      }

      // Generate and store OTP
      const otpCode = OTPService.generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await db
        .insert(otpVerifications)
        .values({
          phoneNumber,
          otpCode,
          purpose: 'login',
          expiresAt
        })

      // Send OTP via SMS
      const smsService = new SMSService()
      await smsService.initialize()
      
      const message = `Your BantAI login code is: ${otpCode}\n\nThis code expires in 10 minutes.`
      
      await smsService.sendSMS(
        phoneNumber,
        message,
        user.id,
        'otp'
      )

      return createApiResponse({
        success: true,
        message: 'OTP sent successfully'
      })

    } else if (action === 'verify-otp' && otp) {
      // Verify OTP
      const [validOTP] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.phoneNumber, phoneNumber),
            eq(otpVerifications.otpCode, otp),
            eq(otpVerifications.purpose, 'login'),
            eq(otpVerifications.verified, false),
            gte(otpVerifications.expiresAt, new Date())
          )
        )
        .limit(1)

      if (!validOTP) {
        return createErrorResponse('Invalid or expired OTP', 401)
      }

      // Mark OTP as verified
      await db
        .update(otpVerifications)
        .set({ verified: true, verifiedAt: new Date() })
        .where(eq(otpVerifications.id, validOTP.id))

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1)

      if (!user) {
        return createErrorResponse('User not found', 404)
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id))

      // Create a custom session token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not configured')
      }
      
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      
      const token = await new SignJWT({ 
        userId: user.id,
        clerkId: user.clerkId,
        phoneNumber: user.phoneNumber,
        role: user.role 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set('bantai-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return createApiResponse({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      })
    }

    return createErrorResponse('Invalid action')
  }, {
    rateLimiter: authRateLimiter
  })
}