import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { OTPService } from '@/lib/services/otp-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Initialize OTP service
    const otpService = new OTPService()

    // Generate and send OTP
    const result = await otpService.sendOTP(phoneNumber, userId)

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        otp: result.data.code, // Only show in test environment
        result: {
          expiresAt: result.data.expiresAt,
          attempts: result.data.attempts
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send OTP',
        details: result
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Test OTP error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}