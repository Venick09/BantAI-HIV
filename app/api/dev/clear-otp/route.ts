import { NextRequest, NextResponse } from 'next/server'
import { OTPMemoryService } from '@/lib/sms/otp-memory'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const { phoneNumber } = body
    
    if (phoneNumber) {
      OTPMemoryService.clearPhoneOTPs(phoneNumber)
      return NextResponse.json({ 
        success: true, 
        message: `Cleared OTPs for ${phoneNumber}` 
      })
    } else {
      // Clear all OTPs
      OTPMemoryService.cleanup()
      return NextResponse.json({ 
        success: true, 
        message: 'Cleared all OTPs' 
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear OTPs' 
    }, { status: 500 })
  }
}