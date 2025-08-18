import { db } from '@/db'
import { 
  riskMessageTemplates, 
  testCenters, 
  users, 
  referrals,
  referralEvents 
} from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { SMSService } from '@/lib/sms/sms-service'
import { QRCodeService } from '@/lib/services/qr-code.service'

export interface RiskMessageContext {
  userId: string
  referralCode?: string
  riskLevel: 'low' | 'moderate' | 'high'
  assessmentId: string
  testCenterId?: string
  includeQRLink?: boolean
}

export interface TestCenterWithDistance {
  id: string
  name: string
  address: string
  city: string
  operatingHours: string
  contactNumber: string
  distance?: number
}

export class RiskMessagingService {
  private smsService: SMSService

  constructor() {
    this.smsService = new SMSService()
  }

  async initialize() {
    await this.smsService.initialize()
  }

  async sendRiskBasedMessage(context: RiskMessageContext, messageType: string = 'result') {
    try {
      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, context.userId))
        .limit(1)

      if (!user) {
        throw new Error('User not found')
      }

      // Get appropriate message template
      const [template] = await db
        .select()
        .from(riskMessageTemplates)
        .where(
          and(
            eq(riskMessageTemplates.riskLevel, context.riskLevel),
            eq(riskMessageTemplates.messageType, messageType),
            eq(riskMessageTemplates.isActive, true)
          )
        )
        .limit(1)

      if (!template) {
        throw new Error(`No template found for ${context.riskLevel} risk - ${messageType}`)
      }

      // Build message based on risk level
      let message = template.templateText
      let additionalMessages: string[] = []

      // Replace common variables
      message = message.replace(/{{name}}/g, user.firstName)
      if (context.referralCode) {
        message = message.replace(/{{referralCode}}/g, context.referralCode)
      }

      // Handle risk-specific messaging
      switch (context.riskLevel) {
        case 'low':
          // For low risk, include prevention tips
          additionalMessages = await this.getLowRiskMessages(context)
          break

        case 'moderate':
          // For moderate risk, include test center details
          const centerDetails = await this.getTestCenterDetails(context.testCenterId)
          message = this.replaceTestCenterVariables(message, centerDetails)
          
          // Get nearby centers list
          const nearbyCenters = await this.getNearbyTestCenters('Manila', 3)
          if (nearbyCenters.length > 0) {
            const centersList = nearbyCenters
              .map((c, i) => `${i + 1}. ${c.name} - ${c.operatingHours}`)
              .join('\n')
            message = message.replace(/{{nearestCenters}}/g, centersList)
          }
          break

        case 'high':
          // For high risk, include priority instructions and emergency support
          const priorityCenter = await this.getTestCenterDetails(context.testCenterId)
          message = this.replaceTestCenterVariables(message, priorityCenter)
          
          // Add emergency center info
          const emergencyCenter = await this.getEmergencyTestCenter()
          if (emergencyCenter) {
            message = message.replace(/{{emergencyCenter}}/g, 
              `${emergencyCenter.name}, ${emergencyCenter.address}`)
          }
          
          additionalMessages = await this.getHighRiskMessages(context)
          break
      }

      // Add QR code link if requested and referral exists
      if (context.includeQRLink && context.referralCode) {
        const qrService = new QRCodeService()
        const qrResult = await qrService.generateSMSFriendlyQRCode(context.referralCode)
        
        if (qrResult.success && qrResult.shortUrl) {
          message += `\n\nQR Code: ${qrResult.shortUrl}`
        }
      }

      // Send main message
      const mainResult = await this.smsService.sendSMS(
        user.phoneNumber,
        message,
        user.id,
        `risk_${context.riskLevel}_${messageType}`
      )

      // Send additional messages if any (for comprehensive info)
      for (const additionalMsg of additionalMessages) {
        await this.smsService.sendSMS(
          user.phoneNumber,
          additionalMsg,
          user.id,
          `risk_${context.riskLevel}_additional`
        )
      }

      // Send QR code as separate message for moderate/high risk
      if (context.riskLevel !== 'low' && context.referralCode && !context.includeQRLink) {
        const qrService = new QRCodeService()
        const qrResult = await qrService.generateSMSFriendlyQRCode(context.referralCode)
        
        if (qrResult.success && qrResult.shortUrl) {
          const qrMessage = `Your digital referral QR code: ${qrResult.shortUrl}\n\nShow this at the test center for faster processing.`
          await this.smsService.sendSMS(
            user.phoneNumber,
            qrMessage,
            user.id,
            'referral_qr_code'
          )
        }
      }

      // Log referral event if applicable
      if (context.referralCode) {
        const [referral] = await db
          .select()
          .from(referrals)
          .where(eq(referrals.referralCode, context.referralCode))
          .limit(1)

        if (referral) {
          await db.insert(referralEvents).values({
            referralId: referral.id,
            eventType: 'message_sent',
            eventData: JSON.stringify({ 
              messageType, 
              riskLevel: context.riskLevel,
              timestamp: new Date()
            })
          })
        }
      }

      return {
        success: true,
        messagesSent: 1 + additionalMessages.length,
        mainMessage: message
      }

    } catch (error) {
      console.error('Risk messaging error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send risk-based message'
      }
    }
  }

  private async getLowRiskMessages(context: RiskMessageContext): Promise<string[]> {
    const messages: string[] = []

    // Get prevention tips template
    const [preventionTemplate] = await db
      .select()
      .from(riskMessageTemplates)
      .where(
        and(
          eq(riskMessageTemplates.riskLevel, 'low'),
          eq(riskMessageTemplates.messageType, 'prevention_tips'),
          eq(riskMessageTemplates.isActive, true)
        )
      )
      .limit(1)

    if (preventionTemplate) {
      messages.push(preventionTemplate.templateText)
    }

    return messages
  }

  private async getHighRiskMessages(context: RiskMessageContext): Promise<string[]> {
    const messages: string[] = []

    // Get priority instructions
    const [priorityTemplate] = await db
      .select()
      .from(riskMessageTemplates)
      .where(
        and(
          eq(riskMessageTemplates.riskLevel, 'high'),
          eq(riskMessageTemplates.messageType, 'priority_instructions'),
          eq(riskMessageTemplates.isActive, true)
        )
      )
      .limit(1)

    if (priorityTemplate && context.referralCode) {
      let message = priorityTemplate.templateText
      message = message.replace(/{{referralCode}}/g, context.referralCode)
      messages.push(message)
    }

    // Get emergency support info
    const [emergencyTemplate] = await db
      .select()
      .from(riskMessageTemplates)
      .where(
        and(
          eq(riskMessageTemplates.riskLevel, 'high'),
          eq(riskMessageTemplates.messageType, 'emergency_support'),
          eq(riskMessageTemplates.isActive, true)
        )
      )
      .limit(1)

    if (emergencyTemplate && context.referralCode) {
      let message = emergencyTemplate.templateText
      message = message.replace(/{{referralCode}}/g, context.referralCode)
      messages.push(message)
    }

    return messages
  }

  private async getTestCenterDetails(testCenterId?: string): Promise<TestCenterWithDistance | null> {
    if (!testCenterId) {
      // Get default test center
      const [defaultCenter] = await db
        .select()
        .from(testCenters)
        .where(eq(testCenters.isActive, true))
        .limit(1)
      
      return defaultCenter as TestCenterWithDistance
    }

    const [center] = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.id, testCenterId))
      .limit(1)

    return center as TestCenterWithDistance
  }

  private async getNearbyTestCenters(city: string, limit: number = 3): Promise<TestCenterWithDistance[]> {
    // In a real implementation, this would calculate actual distances
    // For now, we'll return centers prioritizing same city
    const centers = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.isActive, true))
      .orderBy(
        sql`CASE WHEN ${testCenters.city} = ${city} THEN 0 ELSE 1 END`
      )
      .limit(limit)

    return centers.map((c, index) => ({
      ...c,
      distance: index === 0 ? 2.5 : 5 + index * 2 // Mock distances
    }))
  }

  private async getEmergencyTestCenter(): Promise<TestCenterWithDistance | null> {
    // Look for 24/7 or emergency centers (would need to add this field to schema)
    // For now, return PGH or first available center
    const [center] = await db
      .select()
      .from(testCenters)
      .where(
        and(
          eq(testCenters.isActive, true),
          sql`${testCenters.name} ILIKE '%PGH%' OR ${testCenters.name} ILIKE '%emergency%'`
        )
      )
      .limit(1)

    if (center) {
      return center as TestCenterWithDistance
    }

    // Fallback to first active center
    const [fallbackCenter] = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.isActive, true))
      .limit(1)

    return fallbackCenter as TestCenterWithDistance
  }

  private replaceTestCenterVariables(
    message: string, 
    center: TestCenterWithDistance | null
  ): string {
    if (!center) return message

    message = message.replace(/{{testCenter}}/g, center.name)
    message = message.replace(/{{testCenterAddress}}/g, `${center.address}, ${center.city}`)
    message = message.replace(/{{testCenterHours}}/g, center.operatingHours)
    message = message.replace(/{{testCenterPhone}}/g, center.contactNumber)
    
    if (center.distance) {
      message = message.replace(/{{distance}}/g, center.distance.toString())
    }

    return message
  }

  async sendFollowUpMessage(
    userId: string, 
    riskLevel: 'low' | 'moderate' | 'high',
    followUpType: 'reminder' | 'no_show' | 'annual'
  ) {
    // Map follow-up types to message types
    const messageTypeMap = {
      reminder: 'reminder',
      no_show: riskLevel === 'high' ? 'urgent_no_show' : 'no_show_follow_up',
      annual: 'annual_reminder'
    }

    const messageType = messageTypeMap[followUpType]

    // Get user's latest referral if exists
    const [latestReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.userId, userId))
      .orderBy(sql`${referrals.createdAt} DESC`)
      .limit(1)

    const context: RiskMessageContext = {
      userId,
      riskLevel,
      assessmentId: latestReferral?.assessmentId || '',
      referralCode: latestReferral?.referralCode,
      testCenterId: latestReferral?.testCenterId || undefined
    }

    return this.sendRiskBasedMessage(context, messageType)
  }
}