import type { SMSProvider, SMSResult, SendSMSOptions, DeliveryStatus } from '../types'

export class SemaphoreProvider implements SMSProvider {
  name = 'semaphore'
  private apiKey: string
  private senderId: string
  private baseUrl: string

  constructor(apiKey: string, senderId: string, endpoint?: string) {
    this.apiKey = apiKey
    this.senderId = senderId
    this.baseUrl = endpoint || process.env.SEMAPHORE_ENDPOINT || 'https://api.semaphore.co/api/v4'
  }

  async sendSMS(to: string, message: string, options?: SendSMSOptions): Promise<SMSResult> {
    try {
      const formattedNumber = this.formatPhilippineNumber(to)
      
      // Check if this is an OTP message
      const isOTP = options?.metadata?.type === 'otp' || 
                    message.toLowerCase().includes('verification code') ||
                    message.toLowerCase().includes('otp')
      
      const endpoint = isOTP ? `${this.baseUrl}/otp` : `${this.baseUrl}/messages`
      console.log(`📱 Semaphore: Sending ${isOTP ? 'OTP' : 'SMS'} to ${formattedNumber}`)
      console.log(`🔑 API Key: ${this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'NOT SET'}`)
      console.log(`🔗 Endpoint: ${endpoint}`)
      
      // For OTP endpoint, extract the code from message and use placeholder
      let requestBody: any = {
        apikey: this.apiKey,
        number: formattedNumber,
        message: message
      }
      
      if (isOTP) {
        // Extract OTP code from message (look for 4-6 digit number)
        const otpMatch = message.match(/\b(\d{4,6})\b/)
        if (otpMatch) {
          const otpCode = otpMatch[1]
          // Replace the OTP code with {otp} placeholder
          requestBody.message = message.replace(otpCode, '{otp}')
          requestBody.code = otpCode
          console.log(`🔐 Using OTP code: ${otpCode}`)
        }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      // Semaphore returns an array with message details on success
      if (response.ok && Array.isArray(data) && data.length > 0) {
        const messageInfo = data[0]
        // Check if we have a message_id and status is not "Failed" or "Refunded"
        if (messageInfo.message_id && !['Failed', 'Refunded'].includes(messageInfo.status)) {
          console.log(`✅ Semaphore: ${isOTP ? 'OTP' : 'SMS'} sent successfully! Message ID: ${messageInfo.message_id}, Status: ${messageInfo.status}`)
          
          // If using OTP endpoint, extract the generated code
          if (isOTP && messageInfo.code) {
            console.log(`🔐 Generated OTP Code: ${messageInfo.code}`)
          }
          
          return {
            success: true,
            messageId: messageInfo.message_id.toString(),
            sentAt: new Date(),
            providerResponse: data,
            metadata: isOTP && messageInfo.code ? { otpCode: messageInfo.code.toString() } : undefined
          }
        } else {
          console.error(`❌ Semaphore: ${isOTP ? 'OTP' : 'SMS'} failed with status: ${messageInfo.status}`)
          return {
            success: false,
            error: `${isOTP ? 'OTP' : 'SMS'} failed with status: ${messageInfo.status}`,
            errorCode: messageInfo.status,
            providerResponse: data
          }
        }
      } else if (!response.ok) {
        // Handle error responses
        console.error(`❌ Semaphore: API Error:`, data)
        return {
          success: false,
          error: data.message || data.error || JSON.stringify(data),
          errorCode: response.status.toString(),
          providerResponse: data
        }
      } else {
        // Unexpected response format
        console.error(`❌ Semaphore: Unexpected response:`, data)
        return {
          success: false,
          error: 'Unexpected response format from Semaphore',
          errorCode: 'UNKNOWN',
          providerResponse: data
        }
      }
    } catch (error: any) {
      console.error('Semaphore SMS Error:', error)
      return {
        success: false,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
        providerResponse: error
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        headers: {
          'apikey': this.apiKey
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          messageId,
          status: 'failed',
          error: data.message || 'Failed to get status',
          errorCode: data.code
        }
      }

      let status: DeliveryStatus['status'] = 'pending'
      
      switch (data.status) {
        case 'sent':
          status = 'sent'
          break
        case 'delivered':
          status = 'delivered'
          break
        case 'failed':
          status = 'failed'
          break
        case 'pending':
        case 'queued':
          status = 'pending'
          break
      }

      return {
        messageId,
        status,
        deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
        error: data.error_message,
        errorCode: data.error_code
      }
    } catch (error: any) {
      return {
        messageId,
        status: 'failed',
        error: error.message,
        errorCode: 'NETWORK_ERROR'
      }
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    // Philippine mobile number validation
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // Check for 09XXXXXXXXX format (11 digits)
    if (/^09\d{9}$/.test(cleanNumber)) {
      return true
    }
    
    // Check for 639XXXXXXXXX format (12 digits)
    if (/^639\d{9}$/.test(cleanNumber)) {
      return true
    }
    
    return false
  }

  private formatPhilippineNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // Semaphore expects numbers without country code prefix
    // If starts with 639, remove the 63
    if (cleanNumber.startsWith('639')) {
      return `0${cleanNumber.substring(2)}`
    }
    
    // If starts with 09, return as is
    if (cleanNumber.startsWith('09')) {
      return cleanNumber
    }
    
    // Default: assume it needs 0 prefix
    return `0${cleanNumber}`
  }
}