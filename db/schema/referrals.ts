import { pgEnum, pgTable, text, timestamp, uuid, boolean, date } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users, testCenters } from "./users"
import { riskAssessments } from "./risk-assessments"

// Referral status enum
export const referralStatus = pgEnum("referral_status", [
  "pending",
  "sent",
  "received",
  "scheduled",
  "tested",
  "no_show",
  "cancelled"
])

// Test result enum
export const testResult = pgEnum("test_result", ["positive", "negative", "indeterminate", "pending"])

// Referrals table
export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  referralCode: text("referral_code").unique().notNull(), // Unique 8-character code
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentId: uuid("assessment_id").references(() => riskAssessments.id).notNull(),
  testCenterId: uuid("test_center_id").references(() => testCenters.id),
  status: referralStatus("status").default("pending").notNull(),
  qrCodeUrl: text("qr_code_url"),
  sentAt: timestamp("sent_at"),
  sentVia: text("sent_via"), // 'sms', 'email', 'both'
  scheduledDate: date("scheduled_date"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Test results table
export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  referralId: uuid("referral_id").references(() => referrals.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  testCenterId: uuid("test_center_id").references(() => testCenters.id).notNull(),
  testDate: date("test_date").notNull(),
  testType: text("test_type").notNull(), // 'rapid', 'elisa', 'pcr'
  result: testResult("result").notNull(),
  resultDate: date("result_date"),
  recordedBy: uuid("recorded_by").references(() => users.id).notNull(),
  notes: text("notes"),
  isConfirmed: boolean("is_confirmed").default(false).notNull(), // For positive cases needing confirmation
  confirmedDate: date("confirmed_date"),
  confirmedBy: uuid("confirmed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Referral tracking events
export const referralEvents = pgTable("referral_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  referralId: uuid("referral_id").references(() => referrals.id).notNull(),
  eventType: text("event_type").notNull(), // 'created', 'sent', 'viewed', 'scheduled', 'completed'
  eventData: text("event_data"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Relations
export const referralsRelations = relations(referrals, ({ one, many }) => ({
  user: one(users, {
    fields: [referrals.userId],
    references: [users.id]
  }),
  assessment: one(riskAssessments, {
    fields: [referrals.assessmentId],
    references: [riskAssessments.id]
  }),
  testCenter: one(testCenters, {
    fields: [referrals.testCenterId],
    references: [testCenters.id]
  }),
  testResult: one(testResults),
  events: many(referralEvents)
}))

export const testResultsRelations = relations(testResults, ({ one }) => ({
  referral: one(referrals, {
    fields: [testResults.referralId],
    references: [referrals.id]
  }),
  user: one(users, {
    fields: [testResults.userId],
    references: [users.id]
  }),
  testCenter: one(testCenters, {
    fields: [testResults.testCenterId],
    references: [testCenters.id]
  }),
  recordedByUser: one(users, {
    fields: [testResults.recordedBy],
    references: [users.id]
  }),
  confirmedByUser: one(users, {
    fields: [testResults.confirmedBy],
    references: [users.id]
  })
}))

export const referralEventsRelations = relations(referralEvents, ({ one }) => ({
  referral: one(referrals, {
    fields: [referralEvents.referralId],
    references: [referrals.id]
  }),
  createdByUser: one(users, {
    fields: [referralEvents.createdBy],
    references: [users.id]
  })
}))

// Type exports
export type InsertReferral = typeof referrals.$inferInsert
export type SelectReferral = typeof referrals.$inferSelect
export type InsertTestResult = typeof testResults.$inferInsert
export type SelectTestResult = typeof testResults.$inferSelect
export type InsertReferralEvent = typeof referralEvents.$inferInsert
export type SelectReferralEvent = typeof referralEvents.$inferSelect