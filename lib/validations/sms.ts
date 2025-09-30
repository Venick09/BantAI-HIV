import { z } from 'zod'
import { phoneNumberSchema } from './auth'

// SMS message types
export const messageTypeSchema = z.enum([
  'otp',
  'risk_assessment',
  'reminder',
  'referral',
  'notification'
])

// Send SMS schema
export const sendSmsSchema = z.object({
  phoneNumber: phoneNumberSchema,
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  messageType: messageTypeSchema,
  userId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  templateVariables: z.record(z.any()).optional(),
  priority: z.number().min(0).max(10).optional().default(0)
})

// SMS template schema
export const createSmsTemplateSchema = z.object({
  templateCode: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/, 'Template code must be uppercase alphanumeric with underscores'),
  templateName: z.string().min(1).max(100),
  messageType: messageTypeSchema,
  templateText: z.string().min(1).max(1600),
  templateTextTagalog: z.string().min(1).max(1600),
  variables: z.array(z.string()).optional()
})

// SMS response schema
export const smsResponseSchema = z.object({
  phoneNumber: phoneNumberSchema,
  message: z.string().min(1).max(1600),
  providerMessageId: z.string().optional(),
  inResponseTo: z.string().uuid().optional(),
  responseType: z.enum(['risk_assessment_answer', 'adherence_confirmation', 'general']).optional()
})

// Type exports
export type SendSmsInput = z.infer<typeof sendSmsSchema>
export type CreateSmsTemplateInput = z.infer<typeof createSmsTemplateSchema>
export type SmsResponseInput = z.infer<typeof smsResponseSchema>
export type MessageType = z.infer<typeof messageTypeSchema>