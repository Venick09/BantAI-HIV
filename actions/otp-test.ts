'use server'

import { OTPService } from '@/lib/sms/otp'
import { SMSService } from '@/lib/sms/sms-service'

export async function generateTestOTP(phoneNumber: string) {
  try {
    console.log(`🔐 Generating test OTP for: ${phoneNumber}`)
    
    // Initialize SMS service
    const smsService = new SMSService()
    await smsService.initialize()
    
    // Validate phone number
    if (!await smsService.validatePhoneNumber(phoneNumber)) {
      return { success: false, error: 'Invalid phone number format' }
    }
    
    // Generate OTP
    const otp = await OTPService.createOTP(phoneNumber, 'registration')
    
    return { 
      success: true, 
      otp, // Only return OTP in development
      message: 'OTP generated successfully' 
    }
  } catch (error) {
    console.error('Generate test OTP error:', error)
    return { success: false, error: 'Failed to generate OTP' }
  }
}

export async function verifyTestOTP(phoneNumber: string, otp: string) {
  try {
    console.log(`🔍 Verifying OTP for: ${phoneNumber}`)
    
    const result = await OTPService.verifyOTP(phoneNumber, otp, 'registration')
    
    if (result.success) {
      return { success: true, message: 'OTP verified successfully' }
    } else {
      return { success: false, error: result.error || 'Invalid OTP' }
    }
  } catch (error) {
    console.error('Verify test OTP error:', error)
    return { success: false, error: 'Failed to verify OTP' }
  }
}