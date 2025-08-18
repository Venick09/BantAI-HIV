import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms/sms-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, message } = body

    console.log('Test SMS Request:', { phoneNumber, message })
    
    // Initialize SMS service
    const smsService = new SMSService()
    await smsService.initialize()
    
    // Check environment variables
    const envCheck = {
      SMS_PROVIDER: process.env.SMS_PROVIDER,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set',
      SEMAPHORE_API_KEY: process.env.SEMAPHORE_API_KEY ? 'Set' : 'Not set',
      SEMAPHORE_SENDER_NAME: process.env.SEMAPHORE_SENDER_NAME || 'Not set'
    }
    
    console.log('Environment check:', envCheck)
    
    // Validate phone number
    const isValid = await smsService.validatePhoneNumber(phoneNumber)
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format',
        envCheck
      }, { status: 400 })
    }
    
    // Send test SMS
    const testMessage = message || `BantAI Test SMS: Your connection is working! Time: ${new Date().toLocaleString()}`
    
    console.log('Sending SMS with:', {
      to: phoneNumber,
      message: testMessage,
      provider: process.env.SMS_PROVIDER
    })
    
    const result = await smsService.sendSMS(
      phoneNumber,
      testMessage,
      undefined,
      'test'
    )
    
    console.log('SMS Result:', result)
    
    return NextResponse.json({
      ...result,
      envCheck,
      provider: process.env.SMS_PROVIDER
    })
    
  } catch (error) {
    console.error('Test SMS error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}