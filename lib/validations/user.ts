import { z } from 'zod'
import { phoneNumberSchema } from './auth'

// User roles
export const userRoleSchema = z.enum(['patient', 'health_worker', 'admin', 'test_center'])

// User status
export const userStatusSchema = z.enum(['active', 'inactive', 'suspended'])

// Update user profile schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().optional().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && parsed < new Date()
  }, 'Invalid date of birth'),
  email: z.string().email().optional().or(z.literal('')),
  testCenterId: z.string().uuid('Invalid test center ID').optional()
})

// Admin user management schemas
export const createUserSchema = z.object({
  phoneNumber: phoneNumberSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().optional(),
  email: z.string().email().optional(),
  role: userRoleSchema,
  status: userStatusSchema.default('active'),
  testCenterId: z.string().uuid().optional(),
  sendWelcomeSms: z.boolean().default(true)
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  testCenterId: z.string().uuid().optional()
})

// User search/filter schema
export const userSearchSchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  testCenterId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastName', 'phoneNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Type exports
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserSearchInput = z.infer<typeof userSearchSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UserStatus = z.infer<typeof userStatusSchema>