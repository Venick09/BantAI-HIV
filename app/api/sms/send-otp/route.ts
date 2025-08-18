import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms/sms-service'
import { OTPService } from '@/lib/sms/otp'
import { z } from 'zod'

const requestSchema = z.object({
  phoneNumber: z.string().regex(/^(09|\+639|639)\d{9}$/, 'Invalid Philippine mobile number'),
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
    
    const { phoneNumber, purpose } = validation.data
    
    // Check if can request OTP
    if (!await OTPService.canRequestOTP(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please wait 1 minute before requesting another OTP' },
        { status: 429 }
      )
    }
    
    // Generate OTP
    const otp = await OTPService.createOTP(phoneNumber, purpose)
    
    // Send OTP via SMS
    const smsService = new SMSService()
    await smsService.initialize()
    
    const message = `Your BantAI verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`
    
    const result = await smsService.sendSMS(
      phoneNumber,
      message,
      undefined,
      'otp'
    )
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP', details: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    })
    
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}