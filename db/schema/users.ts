import { pgEnum, pgTable, text, timestamp, uuid, boolean, date, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// User roles enum
export const userRole = pgEnum("user_role", ["patient", "health_worker", "admin", "test_center"])

// User status enum
export const userStatus = pgEnum("user_status", ["active", "inactive", "suspended"])

// Test centers table
export const testCenters = pgTable("test_centers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  contactNumber: text("contact_number").notNull(),
  operatingHours: text("operating_hours").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// Main users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(), // Clerk auth ID
  phoneNumber: text("phone_number").unique().notNull(), // Primary identifier for SMS
  email: text("email"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  role: userRole("role").default("patient").notNull(),
  status: userStatus("status").default("active").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  consentGiven: boolean("consent_given").default(false).notNull(),
  consentDate: timestamp("consent_date"),
  registrationMethod: text("registration_method").notNull(), // 'self', 'health_worker', 'admin_bulk'
  registeredBy: uuid("registered_by"),
  testCenterId: uuid("test_center_id").references(() => testCenters.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

// OTP verifications table
export const otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  otpCode: text("otp_code").notNull(),
  purpose: text("purpose").notNull(), // 'registration', 'login', 'password_reset'
  isUsed: boolean("is_used").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  testCenter: one(testCenters, {
    fields: [users.testCenterId],
    references: [testCenters.id]
  }),
  registeredByUser: one(users, {
    fields: [users.registeredBy],
    references: [users.id]
  })
}))

// Type exports
export type InsertUser = typeof users.$inferInsert
export type SelectUser = typeof users.$inferSelect
export type InsertTestCenter = typeof testCenters.$inferInsert
export type SelectTestCenter = typeof testCenters.$inferSelect
export type InsertOtpVerification = typeof otpVerifications.$inferInsert
export type SelectOtpVerification = typeof otpVerifications.$inferSelect