import { pgEnum, pgTable, text, timestamp, uuid, numeric, date, boolean, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"
import { riskAssessments } from "./risk-assessments"
import { testResults } from "./referrals"
import { artPatients } from "./art-management"

// Billing event type enum
export const billingEventType = pgEnum("billing_event_type", [
  "questionnaire_delivered",
  "test_result_logged",
  "art_started"
])

// Billing status enum
export const billingStatus = pgEnum("billing_status", ["pending", "approved", "paid", "disputed", "cancelled"])

// Billing events table (tracks billable actions)
export const billingEvents = pgTable("billing_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  eventType: billingEventType("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  referenceId: uuid("reference_id").notNull(), // ID of related entity (assessment, test result, etc.)
  referenceTable: text("reference_table").notNull(), // Table name for reference
  description: text("description").notNull(),
  billingPeriodId: uuid("billing_period_id").references(() => billingPeriods.id),
  isProcessed: boolean("is_processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Billing periods table
export const billingPeriods = pgTable("billing_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  periodName: text("period_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: billingStatus("status").default("pending").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
  totalPatients: integer("total_patients"),
  generatedAt: timestamp("generated_at"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  paidAt: timestamp("paid_at"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Patient billing summary (per patient per period)
export const patientBillingSummary = pgTable("patient_billing_summary", {
  id: uuid("id").defaultRandom().primaryKey(),
  billingPeriodId: uuid("billing_period_id").references(() => billingPeriods.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  questionnaireDelivered: boolean("questionnaire_delivered").default(false).notNull(),
  questionnaireAmount: numeric("questionnaire_amount", { precision: 10, scale: 2 }).default("0"),
  testResultLogged: boolean("test_result_logged").default(false).notNull(),
  testResultAmount: numeric("test_result_amount", { precision: 10, scale: 2 }).default("0"),
  artStarted: boolean("art_started").default(false).notNull(),
  artAmount: numeric("art_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  maxAmountReached: boolean("max_amount_reached").default(false).notNull(), // True if reached ₱850 cap
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Billing configuration table
export const billingConfig = pgTable("billing_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  configKey: text("config_key").unique().notNull(),
  configValue: numeric("config_value", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Billing audit trail
export const billingAudit = pgTable("billing_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  billingPeriodId: uuid("billing_period_id").references(() => billingPeriods.id),
  action: text("action").notNull(), // 'created', 'updated', 'approved', 'exported', 'paid'
  performedBy: uuid("performed_by").references(() => users.id).notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  notes: text("notes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Relations
export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  user: one(users, {
    fields: [billingEvents.userId],
    references: [users.id]
  }),
  billingPeriod: one(billingPeriods, {
    fields: [billingEvents.billingPeriodId],
    references: [billingPeriods.id]
  })
}))

export const billingPeriodsRelations = relations(billingPeriods, ({ one, many }) => ({
  approvedByUser: one(users, {
    fields: [billingPeriods.approvedBy],
    references: [users.id]
  }),
  events: many(billingEvents),
  patientSummaries: many(patientBillingSummary),
  auditLogs: many(billingAudit)
}))

export const patientBillingSummaryRelations = relations(patientBillingSummary, ({ one }) => ({
  billingPeriod: one(billingPeriods, {
    fields: [patientBillingSummary.billingPeriodId],
    references: [billingPeriods.id]
  }),
  user: one(users, {
    fields: [patientBillingSummary.userId],
    references: [users.id]
  })
}))

export const billingAuditRelations = relations(billingAudit, ({ one }) => ({
  billingPeriod: one(billingPeriods, {
    fields: [billingAudit.billingPeriodId],
    references: [billingPeriods.id]
  }),
  performedByUser: one(users, {
    fields: [billingAudit.performedBy],
    references: [users.id]
  })
}))

// Type exports
export type InsertBillingEvent = typeof billingEvents.$inferInsert
export type SelectBillingEvent = typeof billingEvents.$inferSelect
export type InsertBillingPeriod = typeof billingPeriods.$inferInsert
export type SelectBillingPeriod = typeof billingPeriods.$inferSelect
export type InsertPatientBillingSummary = typeof patientBillingSummary.$inferInsert
export type SelectPatientBillingSummary = typeof patientBillingSummary.$inferSelect
export type InsertBillingConfig = typeof billingConfig.$inferInsert
export type SelectBillingConfig = typeof billingConfig.$inferSelect
export type InsertBillingAudit = typeof billingAudit.$inferInsert
export type SelectBillingAudit = typeof billingAudit.$inferSelect