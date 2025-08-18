import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SMSService } from '@/lib/sms/sms-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll allow any authenticated user to test SMS
    // In production, you might want to restrict this to admin users only

    const body = await request.json()
    const { phoneNumber, message } = body

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Initialize SMS service
    const smsService = new SMSService()
    await smsService.initialize()

    // Send SMS
    const result = await smsService.sendSMS(
      phoneNumber,
      message,
      userId, // Use clerk user ID as the user ID
      'test_sms'
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        result: {
          messageId: result.messageId,
          sentAt: result.sentAt,
          provider: smsService.getCurrentProvider()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send SMS',
        details: result
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Test SMS error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}