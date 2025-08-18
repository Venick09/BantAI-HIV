import { db } from '@/db'
import { smsLogs, smsQueue, smsProviderConfig, smsTemplates } from '@/db/schema'
import { eq, and, lte, isNull } from 'drizzle-orm'
import { SemaphoreProvider } from './providers/semaphore'
import type { SMSProvider, SMSResult, SendSMSOptions } from './types'

export class SMSService {
  private provider: SMSProvider | null = null
  private providerName: 'semaphore' = 'semaphore'
  
  async initialize() {
    try {
      // Get active provider configuration from database
      const config = await db
        .select()
        .from(smsProviderConfig)
        .where(and(eq(smsProviderConfig.isActive, true), eq(smsProviderConfig.isPrimary, true)))
        .limit(1)
      
      if (config.length === 0) {
        // Use environment variables as fallback
        this.initializeFromEnv()
      } else {
        const providerConfig = config[0]
        this.providerName = providerConfig.provider as 'twilio' | 'semaphore' | 'console'
        
        // Only support Semaphore
        if (providerConfig.provider === 'semaphore') {
          this.provider = new SemaphoreProvider(
            providerConfig.apiKey!,
            providerConfig.senderId!
          )
        } else {
          throw new Error(`Unsupported SMS provider: ${providerConfig.provider}. Only Semaphore is supported.`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Database not available for SMS config, using environment variables')
      this.initializeFromEnv()
    }
  }
  
  private initializeFromEnv() {
    // Semaphore is the only provider
    const hasCredentials = this.checkCredentials('semaphore')
    
    if (!hasCredentials) {
      throw new Error('❌ SMS: Semaphore API key is missing. Please configure SEMAPHORE_API_KEY in your environment variables.')
    }
    
    this.providerName = 'semaphore'
    console.log('✅ SMS: Using Semaphore provider')
    
    this.provider = new SemaphoreProvider(
      process.env.SEMAPHORE_API_KEY!,
      process.env.SEMAPHORE_SENDER_NAME || '' // Sender name is optional
    )
  }
  
  private checkCredentials(provider: string): boolean {
    // Only check Semaphore API key (sender name is optional)
    return !!(
      process.env.SEMAPHORE_API_KEY &&
      !process.env.SEMAPHORE_API_KEY.includes('your_')
    )
  }
  
  async sendSMS(
    to: string,
    message: string,
    userId?: string,
    messageType: string = 'notification',
    options?: SendSMSOptions
  ): Promise<SMSResult> {
    if (!this.provider) {
      await this.initialize()
    }
    
    if (!this.provider) {
      return {
        success: false,
        error: 'No SMS provider configured'
      }
    }
    
    // Validate phone number
    if (!this.provider.validatePhoneNumber(to)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      }
    }
    
    // Try to create log entry (but don't fail if database is not available)
    let logEntryId: string | null = null
    try {
      const [logEntry] = await db
        .insert(smsLogs)
        .values({
          userId,
          phoneNumber: to,
          message,
          messageType,
          status: 'pending',
          provider: this.providerName,
          metadata: options?.metadata
        })
        .returning()
      logEntryId = logEntry.id
    } catch (error) {
      console.warn('⚠️ Could not log SMS to database:', error)
    }
    
    // Send SMS
    const result = await this.provider.sendSMS(to, message, options)
    
    // Try to update log entry (but don't fail if database is not available)
    if (logEntryId) {
      try {
        await db
          .update(smsLogs)
          .set({
            status: result.success ? 'sent' : 'failed',
            providerMessageId: result.messageId,
            providerStatus: result.success ? 'sent' : 'failed',
            providerErrorCode: result.errorCode,
            providerErrorMessage: result.error,
            sentAt: result.sentAt,
            failedAt: result.success ? null : new Date(),
            updatedAt: new Date()
          })
          .where(eq(smsLogs.id, logEntryId))
      } catch (error) {
        console.warn('⚠️ Could not update SMS log in database:', error)
      }
    }
    
    return result
  }
  
  async sendTemplate(
    to: string,
    templateCode: string,
    variables: Record<string, string> = {},
    userId?: string,
    options?: SendSMSOptions
  ): Promise<SMSResult> {
    // Get template
    const [template] = await db
      .select()
      .from(smsTemplates)
      .where(and(eq(smsTemplates.templateCode, templateCode), eq(smsTemplates.isActive, true)))
      .limit(1)
    
    if (!template) {
      return {
        success: false,
        error: 'Template not found'
      }
    }
    
    // Replace variables in template
    let message = template.templateText
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    
    return this.sendSMS(to, message, userId, template.messageType, {
      ...options,
      metadata: {
        ...options?.metadata,
        templateCode,
        variables
      }
    })
  }
  
  async queueSMS(
    to: string,
    templateId: string,
    scheduledFor: Date,
    variables?: Record<string, any>,
    userId?: string,
    priority: number = 0
  ) {
    await db.insert(smsQueue).values({
      userId,
      phoneNumber: to,
      templateId,
      templateVariables: variables,
      messageType: 'scheduled',
      scheduledFor,
      priority
    })
  }
  
  async processQueue() {
    if (!this.provider) {
      await this.initialize()
    }
    
    // Get pending messages that are due
    const messages = await db
      .select()
      .from(smsQueue)
      .where(
        and(
          eq(smsQueue.isProcessed, false),
          lte(smsQueue.scheduledFor, new Date())
        )
      )
      .orderBy(smsQueue.priority)
      .limit(50) // Process in batches
    
    for (const msg of messages) {
      try {
        // Get template if specified
        let message = ''
        let messageType = msg.messageType
        
        if (msg.templateId) {
          const [template] = await db
            .select()
            .from(smsTemplates)
            .where(eq(smsTemplates.id, msg.templateId))
            .limit(1)
          
          if (template) {
            message = template.templateText
            messageType = template.messageType
            
            // Replace variables
            if (msg.templateVariables) {
              for (const [key, value] of Object.entries(msg.templateVariables as Record<string, any>)) {
                message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
              }
            }
          }
        }
        
        // Send SMS
        const result = await this.sendSMS(
          msg.phoneNumber,
          message,
          msg.userId || undefined,
          messageType
        )
        
        // Update queue entry
        await db
          .update(smsQueue)
          .set({
            isProcessed: true,
            processedAt: new Date()
          })
          .where(eq(smsQueue.id, msg.id))
        
      } catch (error) {
        console.error('Error processing SMS queue item:', error)
      }
    }
  }
  
  async updateDeliveryStatus(messageId: string) {
    if (!this.provider) {
      await this.initialize()
    }
    
    if (!this.provider) return
    
    const status = await this.provider.getDeliveryStatus(messageId)
    
    await db
      .update(smsLogs)
      .set({
        status: status.status,
        deliveredAt: status.deliveredAt,
        providerStatus: status.status,
        providerErrorCode: status.errorCode,
        providerErrorMessage: status.error,
        updatedAt: new Date()
      })
      .where(eq(smsLogs.providerMessageId, messageId))
  }
  
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.provider) {
      await this.initialize()
    }
    
    return this.provider?.validatePhoneNumber(phoneNumber) || false
  }
}