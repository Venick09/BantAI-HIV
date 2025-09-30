import { z } from 'zod'

// Phone number validation - Philippine format
const phoneNumberRegex = /^(\+63|0)[0-9]{10}$/

export const phoneNumberSchema = z.string()
  .trim()
  .regex(phoneNumberRegex, 'Invalid Philippine phone number format')
  .transform((phone) => {
    // Normalize to +63 format
    if (phone.startsWith('0')) {
      return '+63' + phone.substring(1)
    }
    return phone
  })

// OTP validation
export const otpSchema = z.string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^[0-9]+$/, 'OTP must contain only numbers')

// Phone login schemas
export const sendOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  action: z.literal('send-otp')
})

export const verifyOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: otpSchema,
  action: z.literal('verify-otp')
})

export const phoneLoginSchema = z.discriminatedUnion('action', [
  sendOtpSchema,
  verifyOtpSchema
])

// User registration schema
export const userRegistrationSchema = z.object({
  phoneNumber: phoneNumberSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().optional().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && parsed < new Date()
  }, 'Invalid date of birth'),
  email: z.string().email().optional().or(z.literal('')),
  testCenterId: z.string().uuid('Invalid test center ID').optional(),
  consentGiven: z.boolean()
})

// Type exports
export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>