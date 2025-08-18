import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms/sms-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio webhook signature
    const twilioSignature = request.headers.get('X-Twilio-Signature')
    if (!twilioSignature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    
    // Get form data
    const formData = await request.formData()
    const data: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })
    
    // Verify signature (implement Twilio signature verification)
    // For now, we'll skip verification in development
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement Twilio signature verification
    }
    
    const messageId = data.MessageSid
    const status = data.MessageStatus
    
    if (messageId) {
      const smsService = new SMSService()
      await smsService.initialize()
      await smsService.updateDeliveryStatus(messageId)
    }
    
    // Twilio expects a 200 OK response
    return new NextResponse('', { status: 200 })
    
  } catch (error) {
    console.error('Twilio webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}