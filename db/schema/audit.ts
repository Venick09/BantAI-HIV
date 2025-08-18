import { pgTable, text, timestamp, uuid, pgEnum, boolean, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

// Audit log status enum
export const auditStatus = pgEnum("audit_status", ["success", "failed"])

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  metadata: text("metadata"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: auditStatus("status").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Consent records table
export const consentRecords = pgTable("consent_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  consentType: text("consent_type").notNull(), // 'hiv_testing', 'data_processing', 'sms_communication', 'treatment'
  consentVersion: text("consent_version").notNull(),
  status: text("status").notNull(), // 'active', 'withdrawn', 'expired'
  grantedAt: timestamp("granted_at").notNull(),
  withdrawnAt: timestamp("withdrawn_at"),
  expiresAt: timestamp("expires_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string with consent details
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Consent templates table
export const consentTemplates = pgTable("consent_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  consentType: text("consent_type").notNull().unique(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Full consent text
  contentTagalog: text("content_tagalog").notNull(), // Tagalog version
  mandatoryFields: text("mandatory_fields").notNull(), // JSON array of required acknowledgments
  isActive: boolean("is_active").default(true).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Data access logs for RA 10173 compliance
export const dataAccessLogs = pgTable("data_access_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  dataSubjectId: uuid("data_subject_id").references(() => users.id).notNull(),
  accessType: text("access_type").notNull(), // 'view', 'update', 'export', 'delete'
  dataCategory: text("data_category").notNull(), // 'personal', 'health', 'sensitive'
  purpose: text("purpose").notNull(),
  legalBasis: text("legal_basis").notNull(), // 'consent', 'legitimate_interest', 'legal_obligation'
  duration: integer("duration"), // Access duration in seconds
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Security events table
export const securityEvents = pgTable("security_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(), // 'login', 'logout', 'failed_login', 'password_change', 'permission_denied'
  userId: uuid("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string with event details
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id]
  })
}))

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, {
    fields: [consentRecords.userId],
    references: [users.id]
  })
}))

export const consentTemplatesRelations = relations(consentTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [consentTemplates.createdBy],
    references: [users.id]
  })
}))

export const dataAccessLogsRelations = relations(dataAccessLogs, ({ one }) => ({
  user: one(users, {
    fields: [dataAccessLogs.userId],
    references: [users.id]
  }),
  dataSubject: one(users, {
    fields: [dataAccessLogs.dataSubjectId],
    references: [users.id]
  })
}))

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id]
  }),
  resolvedByUser: one(users, {
    fields: [securityEvents.resolvedBy],
    references: [users.id]
  })
}))

// Type exports
export type InsertAuditLog = typeof auditLogs.$inferInsert
export type SelectAuditLog = typeof auditLogs.$inferSelect
export type InsertConsentRecord = typeof consentRecords.$inferInsert
export type SelectConsentRecord = typeof consentRecords.$inferSelect
export type InsertConsentTemplate = typeof consentTemplates.$inferInsert
export type SelectConsentTemplate = typeof consentTemplates.$inferSelect
export type InsertDataAccessLog = typeof dataAccessLogs.$inferInsert
export type SelectDataAccessLog = typeof dataAccessLogs.$inferSelect
export type InsertSecurityEvent = typeof securityEvents.$inferInsert
export type SelectSecurityEvent = typeof securityEvents.$inferSelect