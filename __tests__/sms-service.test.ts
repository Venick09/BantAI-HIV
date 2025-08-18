import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { SMSService } from '@/lib/sms/sms-service'
import { ConsoleProvider } from '@/lib/sms/providers/console'
import { TwilioProvider } from '@/lib/sms/providers/twilio'

jest.mock('@/lib/sms/providers/console')
jest.mock('@/lib/sms/providers/twilio')

describe('SMS Service', () => {
  let smsService: SMSService
  let consoleProvider: jest.Mocked<ConsoleProvider>
  let twilioProvider: jest.Mocked<TwilioProvider>

  beforeEach(() => {
    jest.clearAllMocks()
    consoleProvider = new ConsoleProvider() as jest.Mocked<ConsoleProvider>
    twilioProvider = new TwilioProvider({
      accountSid: 'test',
      authToken: 'test',
      fromNumber: '+1234567890'
    }) as jest.Mocked<TwilioProvider>
  })

  describe('Provider Selection', () => {
    it('should use console provider in development', () => {
      process.env.NODE_ENV = 'development'
      smsService = new SMSService()
      
      expect(smsService.getProvider()).toBe('console')
    })

    it('should use configured provider in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.SMS_PROVIDER = 'twilio'
      smsService = new SMSService()
      
      expect(smsService.getProvider()).toBe('twilio')
    })
  })

  describe('SMS Sending', () => {
    it('should send SMS with valid phone number', async () => {
      smsService = new SMSService()
      consoleProvider.send = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'test-123'
      })

      const result = await smsService.send({
        to: '09171234567',
        message: 'Test message'
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-123')
    })

    it('should validate phone number format', async () => {
      smsService = new SMSService()

      const result = await smsService.send({
        to: '123', // Invalid
        message: 'Test message'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should handle provider errors gracefully', async () => {
      smsService = new SMSService()
      consoleProvider.send = jest.fn().mockRejectedValue(new Error('Provider error'))

      const result = await smsService.send({
        to: '09171234567',
        message: 'Test message'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Provider error')
    })
  })

  describe('OTP Generation and Verification', () => {
    it('should generate 6-digit OTP', () => {
      smsService = new SMSService()
      const otp = smsService.generateOTP()

      expect(otp).toMatch(/^\d{6}$/)
    })

    it('should send OTP successfully', async () => {
      smsService = new SMSService()
      consoleProvider.send = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'otp-123'
      })

      const result = await smsService.sendOTP('09171234567')

      expect(result.success).toBe(true)
      expect(result.otp).toMatch(/^\d{6}$/)
    })

    it('should verify OTP correctly', async () => {
      smsService = new SMSService()
      
      // Send OTP first
      const sendResult = await smsService.sendOTP('09171234567')
      expect(sendResult.success).toBe(true)

      // Verify correct OTP
      const verifyResult = await smsService.verifyOTP('09171234567', sendResult.otp!)
      expect(verifyResult.success).toBe(true)
    })

    it('should reject incorrect OTP', async () => {
      smsService = new SMSService()
      
      // Send OTP first
      await smsService.sendOTP('09171234567')

      // Verify incorrect OTP
      const verifyResult = await smsService.verifyOTP('09171234567', '000000')
      expect(verifyResult.success).toBe(false)
      expect(verifyResult.error).toContain('Invalid OTP')
    })

    it('should expire OTP after timeout', async () => {
      jest.useFakeTimers()
      smsService = new SMSService()
      
      // Send OTP
      const sendResult = await smsService.sendOTP('09171234567')
      
      // Fast forward 11 minutes
      jest.advanceTimersByTime(11 * 60 * 1000)

      // Try to verify
      const verifyResult = await smsService.verifyOTP('09171234567', sendResult.otp!)
      expect(verifyResult.success).toBe(false)
      expect(verifyResult.error).toContain('expired')

      jest.useRealTimers()
    })
  })

  describe('Template Management', () => {
    it('should format OTP template correctly', () => {
      smsService = new SMSService()
      const message = smsService.formatTemplate('otp', { otp: '123456' })

      expect(message).toContain('123456')
      expect(message).toContain('BantAI')
    })

    it('should format risk assessment template', () => {
      smsService = new SMSService()
      const message = smsService.formatTemplate('riskAssessment', {
        question: 'Question 1',
        options: ['A) Option 1', 'B) Option 2', 'C) Option 3']
      })

      expect(message).toContain('Question 1')
      expect(message).toContain('A) Option 1')
      expect(message).toContain('Reply with A, B, or C')
    })

    it('should support bilingual templates', () => {
      smsService = new SMSService()
      
      const englishMsg = smsService.formatTemplate('welcome', {}, 'en')
      const tagalogMsg = smsService.formatTemplate('welcome', {}, 'tl')

      expect(englishMsg).not.toBe(tagalogMsg)
      expect(englishMsg).toContain('Welcome')
      expect(tagalogMsg).toContain('Maligayang')
    })
  })

  describe('Character Limit Compliance', () => {
    it('should warn about long messages', () => {
      smsService = new SMSService()
      const longMessage = 'a'.repeat(200)

      const result = smsService.validateMessage(longMessage)
      
      expect(result.valid).toBe(true)
      expect(result.segments).toBe(2)
      expect(result.warning).toContain('2 SMS segments')
    })

    it('should handle unicode characters correctly', () => {
      smsService = new SMSService()
      const unicodeMessage = 'Hello 😊 Test'

      const result = smsService.validateMessage(unicodeMessage)
      
      expect(result.valid).toBe(true)
      expect(result.encoding).toBe('UCS-2')
      expect(result.maxLength).toBe(70) // Unicode SMS limit
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      smsService = new SMSService()
      const phoneNumber = '09171234567'

      // Send 5 OTPs (the limit)
      for (let i = 0; i < 5; i++) {
        const result = await smsService.sendOTP(phoneNumber)
        expect(result.success).toBe(true)
      }

      // 6th attempt should fail
      const result = await smsService.sendOTP(phoneNumber)
      expect(result.success).toBe(false)
      expect(result.error).toContain('rate limit')
    })

    it('should reset rate limit after timeout', async () => {
      jest.useFakeTimers()
      smsService = new SMSService()
      const phoneNumber = '09171234567'

      // Hit rate limit
      for (let i = 0; i < 5; i++) {
        await smsService.sendOTP(phoneNumber)
      }

      // Fast forward 1 hour
      jest.advanceTimersByTime(60 * 60 * 1000)

      // Should be able to send again
      const result = await smsService.sendOTP(phoneNumber)
      expect(result.success).toBe(true)

      jest.useRealTimers()
    })
  })
})