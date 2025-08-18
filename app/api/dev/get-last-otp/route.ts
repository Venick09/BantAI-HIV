import { NextRequest, NextResponse } from 'next/server'
import { lastOTPStore } from '@/lib/sms/otp-store'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }
  
  const searchParams = request.nextUrl.searchParams
  const phoneNumber = searchParams.get('phoneNumber')
  
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
  }
  
  const stored = lastOTPStore[phoneNumber]
  
  if (!stored) {
    return NextResponse.json({ error: 'No OTP found for this number' }, { status: 404 })
  }
  
  // Check if OTP is still valid (10 minutes)
  const isExpired = Date.now() - stored.timestamp > 10 * 60 * 1000
  
  if (isExpired) {
    delete lastOTPStore[phoneNumber]
    return NextResponse.json({ error: 'OTP expired' }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    otp: stored.otp,
    phoneNumber,
    expiresIn: Math.floor((10 * 60 * 1000 - (Date.now() - stored.timestamp)) / 1000)
  })
}