import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

// SMS status enum
export const smsStatus = pgTable("sms_status", {
  pending: text("pending"),
  sent: text("sent"),
  delivered: text("delivered"),
  failed: text("failed"),
  queued: text("queued")
})

// SMS logs table
export const smsLogs = pgTable("sms_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").notNull(), // 'otp', 'risk_assessment', 'reminder', 'referral', 'notification'
  status: text("status").default("pending").notNull(), // 'pending', 'sent', 'delivered', 'failed'
  provider: text("provider").notNull(), // 'twilio', 'semaphore'
  providerMessageId: text("provider_message_id"),
  providerStatus: text("provider_status"),
  providerErrorCode: text("provider_error_code"),
  providerErrorMessage: text("provider_error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failedAt: timestamp("failed_at"),
  retryCount: integer("retry_count").default(0).notNull(),
  nextRetryAt: timestamp("next_retry_at"),
  metadata: jsonb("metadata"), // Additional data like template variables
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// SMS templates table
export const smsTemplates = pgTable("sms_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateCode: text("template_code").unique().notNull(),
  templateName: text("template_name").notNull(),
  messageType: text("message_type").notNull(),
  templateText: text("template_text").notNull(),
  templateTextTagalog: text("template_text_tagalog").notNull(),
  variables: jsonb("variables"), // List of variables that can be replaced
  characterCount: integer("character_count").notNull(),
  smsCount: integer("sms_count").notNull(), // Number of SMS messages this will consume
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// SMS queue table (for scheduled messages)
export const smsQueue = pgTable("sms_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  templateId: uuid("template_id").references(() => smsTemplates.id),
  templateVariables: jsonb("template_variables"),
  messageType: text("message_type").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  priority: integer("priority").default(0).notNull(), // Higher number = higher priority
  maxRetries: integer("max_retries").default(3).notNull(),
  isProcessed: boolean("is_processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  smsLogId: uuid("sms_log_id").references(() => smsLogs.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// SMS responses table (for tracking inbound SMS)
export const smsResponses = pgTable("sms_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  userId: uuid("user_id").references(() => users.id),
  message: text("message").notNull(),
  providerMessageId: text("provider_message_id"),
  inResponseTo: uuid("in_response_to").references(() => smsLogs.id),
  responseType: text("response_type"), // 'risk_assessment_answer', 'adherence_confirmation', 'general'
  isProcessed: boolean("is_processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  processingNotes: text("processing_notes"),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// SMS provider configuration
export const smsProviderConfig = pgTable("sms_provider_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").unique().notNull(), // 'twilio', 'semaphore'
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  senderId: text("sender_id"),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(false).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  retryDelayMinutes: integer("retry_delay_minutes").default(5).notNull(),
  metadata: jsonb("metadata"), // Provider-specific configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Relations
export const smsLogsRelations = relations(smsLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [smsLogs.userId],
    references: [users.id]
  }),
  responses: many(smsResponses)
}))

export const smsQueueRelations = relations(smsQueue, ({ one }) => ({
  user: one(users, {
    fields: [smsQueue.userId],
    references: [users.id]
  }),
  template: one(smsTemplates, {
    fields: [smsQueue.templateId],
    references: [smsTemplates.id]
  }),
  smsLog: one(smsLogs, {
    fields: [smsQueue.smsLogId],
    references: [smsLogs.id]
  })
}))

export const smsResponsesRelations = relations(smsResponses, ({ one }) => ({
  user: one(users, {
    fields: [smsResponses.userId],
    references: [users.id]
  }),
  inResponseToSms: one(smsLogs, {
    fields: [smsResponses.inResponseTo],
    references: [smsLogs.id]
  })
}))

// Type exports
export type InsertSmsLog = typeof smsLogs.$inferInsert
export type SelectSmsLog = typeof smsLogs.$inferSelect
export type InsertSmsTemplate = typeof smsTemplates.$inferInsert
export type SelectSmsTemplate = typeof smsTemplates.$inferSelect
export type InsertSmsQueue = typeof smsQueue.$inferInsert
export type SelectSmsQueue = typeof smsQueue.$inferSelect
export type InsertSmsResponse = typeof smsResponses.$inferInsert
export type SelectSmsResponse = typeof smsResponses.$inferSelect
export type InsertSmsProviderConfig = typeof smsProviderConfig.$inferInsert
export type SelectSmsProviderConfig = typeof smsProviderConfig.$inferSelect