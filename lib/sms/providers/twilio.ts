import { Twilio } from 'twilio'
import type { SMSProvider, SMSResult, SendSMSOptions, DeliveryStatus } from '../types'

export class TwilioProvider implements SMSProvider {
  name = 'twilio'
  private client: Twilio
  private senderId: string

  constructor(
    accountSid: string,
    authToken: string,
    senderId: string
  ) {
    this.client = new Twilio(accountSid, authToken)
    this.senderId = senderId
  }

  async sendSMS(to: string, message: string, options?: SendSMSOptions): Promise<SMSResult> {
    try {
      // Format Philippine number if needed
      const formattedNumber = this.formatPhilippineNumber(to)
      
      const messageOptions: any = {
        body: message,
        from: this.senderId,
        to: formattedNumber
      }

      if (options?.callbackUrl) {
        messageOptions.statusCallback = options.callbackUrl
      }

      if (options?.scheduledTime) {
        messageOptions.sendAt = options.scheduledTime
      }

      const result = await this.client.messages.create(messageOptions)

      return {
        success: true,
        messageId: result.sid,
        sentAt: new Date(),
        providerResponse: result
      }
    } catch (error: any) {
      console.error('Twilio SMS Error:', error)
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        providerResponse: error
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      const message = await this.client.messages(messageId).fetch()
      
      let status: DeliveryStatus['status'] = 'pending'
      
      switch (message.status) {
        case 'delivered':
          status = 'delivered'
          break
        case 'sent':
          status = 'sent'
          break
        case 'failed':
        case 'undelivered':
          status = 'failed'
          break
        case 'queued':
        case 'sending':
          status = 'pending'
          break
      }

      return {
        messageId,
        status,
        deliveredAt: message.dateUpdated || undefined,
        error: message.errorMessage || undefined,
        errorCode: message.errorCode?.toString() || undefined
      }
    } catch (error: any) {
      return {
        messageId,
        status: 'failed',
        error: error.message,
        errorCode: error.code
      }
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    // Philippine mobile number validation
    // Should start with 09 or +639 and have 11 or 13 digits total
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
    
    // If starts with 09, convert to +639
    if (cleanNumber.startsWith('09')) {
      return `+63${cleanNumber.substring(1)}`
    }
    
    // If starts with 639, add +
    if (cleanNumber.startsWith('639')) {
      return `+${cleanNumber}`
    }
    
    // If already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber
    }
    
    // Default: assume it needs +63
    return `+63${cleanNumber}`
  }
}