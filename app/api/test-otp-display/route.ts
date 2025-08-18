import { NextRequest, NextResponse } from 'next/server'
import { OTPService } from '@/lib/sms/otp'
import { SMSService } from '@/lib/sms/sms-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, getActualOTP } = body

    console.log(`\n📱 Test OTP Display API called for: ${phoneNumber}`)
    
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'This endpoint is only available in development'
      }, { status: 403 })
    }
    
    // Validate phone number
    const smsService = new SMSService()
    await smsService.initialize()
    
    if (!await smsService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use format: 09XXXXXXXXX'
      }, { status: 400 })
    }
    
    let otp = ''
    
    if (getActualOTP) {
      // Get the actual OTP that was sent for registration
      const actualOTP = OTPService.getLastOTP(phoneNumber, 'registration')
      
      if (actualOTP) {
        otp = actualOTP
        console.log(`✅ Retrieved actual OTP: ${otp}`)
      } else {
        // Fallback: use a predictable OTP for development
        otp = '123456'
        console.log(`⚠️ No OTP found, using fallback: ${otp}`)
      }
    } else {
      // Generate a simple OTP for display
      otp = Math.random().toString().slice(2, 8).padEnd(6, '0')
    }
    
    // Create the SMS content
    const smsContent = `Welcome to BantAI HIV Platform!

Your verification code is: ${otp}

This code expires in 10 minutes.

If you didn't request this code, please ignore this message.`
    
    // Log to console as well
    console.log('\n' + '='.repeat(60))
    console.log('🔑 OTP FOR DISPLAY')
    console.log('='.repeat(60))
    console.log(`Phone: ${phoneNumber}`)
    console.log(`OTP: ${otp}`)
    console.log(`Time: ${new Date().toLocaleString()}`)
    console.log(`Type: ${getActualOTP ? 'ACTUAL OTP' : 'DISPLAY ONLY'}`)
    console.log('='.repeat(60) + '\n')
    
    // In development, we return the OTP directly
    // In production, this would only send SMS and return success
    return NextResponse.json({
      success: true,
      otp: otp, // ONLY FOR DEVELOPMENT - Remove in production
      phoneNumber: phoneNumber,
      smsContent: smsContent,
      message: 'OTP generated successfully',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })
    
  } catch (error) {
    console.error('Test OTP Display error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}