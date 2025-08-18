import { pgEnum, pgTable, text, timestamp, uuid, boolean, date, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"
import { testResults } from "./referrals"

// ART status enum
export const artStatus = pgEnum("art_status", [
  "not_started",
  "active",
  "defaulted",
  "stopped",
  "transferred_out",
  "deceased"
])

// Adherence status enum
export const adherenceStatus = pgEnum("adherence_status", ["good", "fair", "poor", "unknown"])

// ART patients table
export const artPatients = pgTable("art_patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).unique().notNull(),
  testResultId: uuid("test_result_id").references(() => testResults.id).notNull(),
  patientCode: text("patient_code").unique().notNull(), // Unique patient identifier
  status: artStatus("status").default("not_started").notNull(),
  enrollmentDate: date("enrollment_date").notNull(),
  artStartDate: date("art_start_date"),
  currentRegimen: text("current_regimen"),
  clinicName: text("clinic_name"),
  clinicId: text("clinic_id"),
  nextAppointmentDate: date("next_appointment_date"),
  viralLoadSuppressed: boolean("viral_load_suppressed"),
  lastViralLoadDate: date("last_viral_load_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// ART adherence reminders
export const artReminders = pgTable("art_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => artPatients.id).notNull(),
  reminderType: text("reminder_type").notNull(), // 'daily_medication', 'appointment', 'refill'
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(), // HH:MM format
  sentAt: timestamp("sent_at"),
  deliveryStatus: text("delivery_status"), // 'pending', 'sent', 'delivered', 'failed'
  responseReceived: boolean("response_received").default(false),
  responseText: text("response_text"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// ART adherence tracking
export const artAdherence = pgTable("art_adherence", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => artPatients.id).notNull(),
  trackingDate: date("tracking_date").notNull(),
  pillsTaken: boolean("pills_taken"),
  missedDoses: integer("missed_doses").default(0),
  adherenceStatus: adherenceStatus("adherence_status").notNull(),
  reportedVia: text("reported_via").notNull(), // 'sms', 'web', 'clinic'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// ART clinic visits
export const artClinicVisits = pgTable("art_clinic_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => artPatients.id).notNull(),
  visitDate: date("visit_date").notNull(),
  visitType: text("visit_type").notNull(), // 'scheduled', 'unscheduled', 'emergency'
  attended: boolean("attended").notNull(),
  viralLoadTested: boolean("viral_load_tested").default(false),
  viralLoadResult: text("viral_load_result"),
  cd4Tested: boolean("cd4_tested").default(false),
  cd4Result: text("cd4_result"),
  regimenChanged: boolean("regimen_changed").default(false),
  newRegimen: text("new_regimen"),
  nextVisitDate: date("next_visit_date"),
  recordedBy: uuid("recorded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// SMS templates for ART management
export const artMessageTemplates = pgTable("art_message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageType: text("message_type").notNull(), // 'enrollment', 'daily_reminder', 'appointment_reminder', 'missed_dose_followup'
  templateText: text("template_text").notNull(),
  templateTextTagalog: text("template_text_tagalog").notNull(),
  sendTime: text("send_time"), // Default time to send (HH:MM)
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Relations
export const artPatientsRelations = relations(artPatients, ({ one, many }) => ({
  user: one(users, {
    fields: [artPatients.userId],
    references: [users.id]
  }),
  testResult: one(testResults, {
    fields: [artPatients.testResultId],
    references: [testResults.id]
  }),
  reminders: many(artReminders),
  adherenceRecords: many(artAdherence),
  clinicVisits: many(artClinicVisits)
}))

export const artRemindersRelations = relations(artReminders, ({ one }) => ({
  patient: one(artPatients, {
    fields: [artReminders.patientId],
    references: [artPatients.id]
  })
}))

export const artAdherenceRelations = relations(artAdherence, ({ one }) => ({
  patient: one(artPatients, {
    fields: [artAdherence.patientId],
    references: [artPatients.id]
  })
}))

export const artClinicVisitsRelations = relations(artClinicVisits, ({ one }) => ({
  patient: one(artPatients, {
    fields: [artClinicVisits.patientId],
    references: [artPatients.id]
  }),
  recordedByUser: one(users, {
    fields: [artClinicVisits.recordedBy],
    references: [users.id]
  })
}))

// Type exports
export type InsertArtPatient = typeof artPatients.$inferInsert
export type SelectArtPatient = typeof artPatients.$inferSelect
export type InsertArtReminder = typeof artReminders.$inferInsert
export type SelectArtReminder = typeof artReminders.$inferSelect
export type InsertArtAdherence = typeof artAdherence.$inferInsert
export type SelectArtAdherence = typeof artAdherence.$inferSelect
export type InsertArtClinicVisit = typeof artClinicVisits.$inferInsert
export type SelectArtClinicVisit = typeof artClinicVisits.$inferSelect
export type InsertArtMessageTemplate = typeof artMessageTemplates.$inferInsert
export type SelectArtMessageTemplate = typeof artMessageTemplates.$inferSelect