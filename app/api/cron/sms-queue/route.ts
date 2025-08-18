import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms/sms-service'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Process SMS queue
    const smsService = new SMSService()
    await smsService.initialize()
    await smsService.processQueue()
    
    return NextResponse.json({
      success: true,
      message: 'SMS queue processed',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('SMS queue processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}