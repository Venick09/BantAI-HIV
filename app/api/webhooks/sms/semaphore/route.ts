import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms/sms-service'
import { db } from '@/db'
import { smsResponses } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Handle delivery status update
    if (data.type === 'delivery_report') {
      const messageId = data.message_id
      
      if (messageId) {
        const smsService = new SMSService()
        await smsService.initialize()
        await smsService.updateDeliveryStatus(messageId)
      }
    }
    
    // Handle incoming SMS
    if (data.type === 'incoming_message') {
      const phoneNumber = data.from
      const message = data.message
      const messageId = data.message_id
      
      // Store incoming message
      await db.insert(smsResponses).values({
        phoneNumber,
        message,
        providerMessageId: messageId,
        receivedAt: new Date(data.timestamp || Date.now())
      })
      
      // TODO: Process incoming message based on content
      // e.g., risk assessment responses, adherence confirmations
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Semaphore webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}