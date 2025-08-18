import { NextRequest, NextResponse } from 'next/server'
import { OTPService } from '@/lib/sms/otp'
import { z } from 'zod'

const requestSchema = z.object({
  phoneNumber: z.string().regex(/^(09|\+639|639)\d{9}$/, 'Invalid Philippine mobile number'),
  otp: z.string().length(6),
  purpose: z.enum(['registration', 'login', 'password_reset'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = requestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const { phoneNumber, otp, purpose } = validation.data
    
    // Verify OTP
    const result = await OTPService.verifyOTP(phoneNumber, otp, purpose)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid OTP' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}