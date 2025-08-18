import { pgEnum, pgTable, text, timestamp, uuid, integer, jsonb, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

// Risk level enum
export const riskLevel = pgEnum("risk_level", ["low", "moderate", "high"])

// Assessment status enum
export const assessmentStatus = pgEnum("assessment_status", ["pending", "in_progress", "completed", "expired"])

// Risk assessment questions table
export const riskQuestions = pgTable("risk_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionCode: text("question_code").unique().notNull(),
  questionText: text("question_text").notNull(),
  questionTextTagalog: text("question_text_tagalog").notNull(),
  questionType: text("question_type").notNull(), // 'yes_no', 'multiple_choice', 'numeric'
  options: jsonb("options"), // For multiple choice questions
  weight: integer("weight").notNull(), // Scoring weight
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Risk assessments table
export const riskAssessments = pgTable("risk_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentCode: text("assessment_code").unique().notNull(), // Unique code for tracking
  status: assessmentStatus("status").default("pending").notNull(),
  deliveryMethod: text("delivery_method").notNull(), // 'sms', 'web'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  totalScore: integer("total_score"),
  riskLevel: riskLevel("risk_level"),
  smsDeliveredAt: timestamp("sms_delivered_at"),
  smsDeliveryStatus: text("sms_delivery_status"), // 'sent', 'delivered', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Risk assessment responses table
export const riskResponses = pgTable("risk_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id").references(() => riskAssessments.id).notNull(),
  questionId: uuid("question_id").references(() => riskQuestions.id).notNull(),
  response: text("response").notNull(),
  score: integer("score").notNull(),
  responseMethod: text("response_method").notNull(), // 'sms', 'web'
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Risk scoring rules table
export const riskScoringRules = pgTable("risk_scoring_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  minScore: integer("min_score").notNull(),
  maxScore: integer("max_score").notNull(),
  riskLevel: riskLevel("risk_level").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// SMS templates for risk messages
export const riskMessageTemplates = pgTable("risk_message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  riskLevel: riskLevel("risk_level").notNull(),
  messageType: text("message_type").notNull(), // 'initial', 'reminder', 'result'
  templateText: text("template_text").notNull(),
  templateTextTagalog: text("template_text_tagalog").notNull(),
  variables: jsonb("variables"), // Variables that can be replaced in template
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Relations
export const riskAssessmentsRelations = relations(riskAssessments, ({ one, many }) => ({
  user: one(users, {
    fields: [riskAssessments.userId],
    references: [users.id]
  }),
  responses: many(riskResponses)
}))

export const riskResponsesRelations = relations(riskResponses, ({ one }) => ({
  assessment: one(riskAssessments, {
    fields: [riskResponses.assessmentId],
    references: [riskAssessments.id]
  }),
  question: one(riskQuestions, {
    fields: [riskResponses.questionId],
    references: [riskQuestions.id]
  })
}))

// Type exports
export type InsertRiskQuestion = typeof riskQuestions.$inferInsert
export type SelectRiskQuestion = typeof riskQuestions.$inferSelect
export type InsertRiskAssessment = typeof riskAssessments.$inferInsert
export type SelectRiskAssessment = typeof riskAssessments.$inferSelect
export type InsertRiskResponse = typeof riskResponses.$inferInsert
export type SelectRiskResponse = typeof riskResponses.$inferSelect
export type InsertRiskScoringRule = typeof riskScoringRules.$inferInsert
export type SelectRiskScoringRule = typeof riskScoringRules.$inferSelect
export type InsertRiskMessageTemplate = typeof riskMessageTemplates.$inferInsert
export type SelectRiskMessageTemplate = typeof riskMessageTemplates.$inferSelect