import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users, otpVerifications } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { SMSService } from '@/lib/sms/sms-service'
import { OTPService } from '@/lib/sms/otp'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, otp, action } = body

    if (action === 'send-otp') {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1)

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Phone number not registered. Please register first.'
        })
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
        'otp',
        { type: 'otp' }
      )

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully'
      })

    } else if (action === 'verify-otp') {
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
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired OTP'
        })
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
        return NextResponse.json({
          success: false,
          error: 'User not found'
        })
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id))

      // Create a custom session token
      // Note: In production, you should use proper session management
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      )
      
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

      return NextResponse.json({
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

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    })

  } catch (error) {
    console.error('Phone login error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login'
    })
  }
}