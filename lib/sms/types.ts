export interface SMSProvider {
  name: string
  sendSMS(to: string, message: string, options?: SendSMSOptions): Promise<SMSResult>
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
  validatePhoneNumber(phoneNumber: string): boolean
}

export interface SendSMSOptions {
  priority?: 'high' | 'normal' | 'low'
  scheduledTime?: Date
  callbackUrl?: string
  metadata?: Record<string, any>
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
  providerResponse?: any
  sentAt?: Date
}

export interface DeliveryStatus {
  messageId: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  deliveredAt?: Date
  error?: string
  errorCode?: string
}

export interface SMSTemplate {
  code: string
  text: string
  textTagalog: string
  variables: string[]
}

export interface SMSConfig {
  provider: 'twilio' | 'semaphore'
  maxRetries: number
  retryDelayMs: number
  defaultSenderId?: string
  webhookUrl?: string
}