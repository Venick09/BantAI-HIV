'use server'

import { db } from '@/db'
import { users, otpVerifications } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { SMSService } from '@/lib/sms/sms-service'
import { OTPService } from '@/lib/sms/otp'
import { revalidatePath } from 'next/cache'

export interface CreateUserData {
  phoneNumber: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  email?: string
  role?: 'patient' | 'health_worker' | 'admin' | 'test_center'
  testCenterId?: string
}

export async function sendRegistrationOTP(phoneNumber: string) {
  console.log(`\n📱 sendRegistrationOTP called for: ${phoneNumber}`)
  
  try {
    // Validate phone number format
    const smsService = new SMSService()
    await smsService.initialize()
    console.log('✅ SMS Service initialized')
    
    if (!await smsService.validatePhoneNumber(phoneNumber)) {
      return { success: false, error: 'Invalid phone number format' }
    }
    
    // Check if phone number already exists (skip if database is not available)
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1)
      
      if (existingUser.length > 0) {
        return { success: false, error: 'Phone number already registered' }
      }
    } catch (error) {
      console.warn('⚠️ Could not check existing users in database:', error)
    }
    
    // Check rate limiting
    if (!await OTPService.canRequestOTP(phoneNumber)) {
      return { success: false, error: 'Please wait before requesting another OTP' }
    }
    
    // Generate and send OTP
    const otp = await OTPService.createOTP(phoneNumber, 'registration')
    console.log(`✅ OTP generated: ${otp}`)
    
    const message = `Welcome to BantAI!\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    
    console.log('📤 Sending SMS...')
    const result = await smsService.sendSMS(
      phoneNumber,
      message,
      undefined,
      'otp',
      { metadata: { type: 'otp' } }
    )
    console.log('📤 SMS result:', result)
    
    if (!result.success) {
      return { success: false, error: 'Failed to send OTP' }
    }
    
    // In development, return the OTP for display
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, otp: otp }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Send registration OTP error:', error)
    return { success: false, error: 'Failed to send OTP' }
  }
}

export async function verifyRegistrationOTP(phoneNumber: string, otp: string) {
  try {
    const result = await OTPService.verifyOTP(phoneNumber, otp, 'registration')
    
    if (!result.success) {
      return { success: false, error: result.error || 'Invalid OTP' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Verify registration OTP error:', error)
    return { success: false, error: 'Failed to verify OTP' }
  }
}

export async function createUser(data: CreateUserData, verifiedOTP: boolean = false) {
  try {
    // For self-registration, OTP must be verified
    if (data.role === 'patient' && !verifiedOTP) {
      return { success: false, error: 'OTP verification required' }
    }
    
    // Get current user for tracking who created this account
    const { userId: currentClerkUserId } = await auth()
    let registeredBy = null
    
    if (currentClerkUserId) {
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, currentClerkUserId))
        .limit(1)
      
      if (currentUser) {
        registeredBy = currentUser.id
      }
    }
    
    let newClerkUserId = `dev_${data.phoneNumber}_${Date.now()}`
    let newUser: any = null
    
    try {
      // Try to create Clerk user
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.createUser({
        phoneNumber: [data.phoneNumber],
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.email && { emailAddresses: [data.email] })
      })
      newClerkUserId = clerkUser.id
    } catch (error) {
      console.warn('⚠️ Could not create Clerk user (development mode):', error)
    }
    
    try {
      // Create database user
      const [dbUser] = await db
        .insert(users)
        .values({
          clerkId: newClerkUserId,
          phoneNumber: data.phoneNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          dateOfBirth: data.dateOfBirth,
          role: data.role || 'patient',
          isVerified: verifiedOTP,
          consentGiven: verifiedOTP, // Assume consent if OTP verified
          consentDate: verifiedOTP ? new Date() : null,
          registrationMethod: registeredBy ? 'health_worker' : 'self',
          registeredBy,
          testCenterId: data.testCenterId || null
        })
        .returning()
      
      newUser = dbUser
    } catch (error) {
      console.warn('⚠️ Could not create user in database:', error)
      // Create a mock user for development
      newUser = {
        id: `mock_${Date.now()}`,
        clerkId: newClerkUserId,
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role || 'patient',
        isVerified: verifiedOTP,
        createdAt: new Date()
      }
    }
    
    // Send welcome SMS
    if (verifiedOTP) {
      const smsService = new SMSService()
      await smsService.initialize()
      
      const welcomeMessage = `Welcome to BantAI, ${data.firstName}! You've successfully registered. We'll guide you through HIV risk assessment and care. Reply STOP to unsubscribe.`
      
      await smsService.sendSMS(
        data.phoneNumber,
        welcomeMessage,
        newUser.id,
        'notification'
      )
    }
    
    revalidatePath('/dashboard')
    return { success: true, user: newUser }
  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function getUserByPhone(phoneNumber: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)
    
    return user || null
  } catch (error) {
    console.error('Get user by phone error:', error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return null
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1)
    
    return user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function updateUserConsent(userId: string, consent: boolean) {
  try {
    await db
      .update(users)
      .set({
        consentGiven: consent,
        consentDate: consent ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Update user consent error:', error)
    return { success: false, error: 'Failed to update consent' }
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)
    
    return user[0] || null
  } catch (error) {
    console.error('Get user by Clerk ID error:', error)
    return null
  }
}

export async function syncClerkUserToDatabase(clerkId: string) {
  try {
    // First check if user already exists
    const existingUser = await getUserByClerkId(clerkId)
    if (existingUser) {
      return { success: true, user: existingUser }
    }

    // Get Clerk user data
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(clerkId)
    
    if (!clerkUser) {
      return { success: false, error: 'Clerk user not found' }
    }

    // Create a temporary phone number if none exists
    // This allows users to complete registration later
    const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber || 
                       clerkUser.unsafeMetadata?.phoneNumber as string || 
                       `TEMP_${clerkId.substring(0, 10)}` // Temporary placeholder
    
    // Create user in database with minimal required data
    const [dbUser] = await db
      .insert(users)
      .values({
        clerkId: clerkId,
        phoneNumber,
        firstName: clerkUser.firstName || 'User',
        lastName: clerkUser.lastName || '',
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        role: 'patient',
        isVerified: !phoneNumber.startsWith('TEMP_'), // Only verified if real phone
        consentGiven: false, // Will be set when they complete registration
        consentDate: null,
        registrationMethod: 'clerk_sync'
      })
      .returning()
    
    return { success: true, user: dbUser, needsPhoneNumber: phoneNumber.startsWith('TEMP_') }
  } catch (error) {
    console.error('Sync Clerk user error:', error)
    return { success: false, error: 'Failed to sync user' }
  }
}

// Simple function to create or get user
export async function ensureUserExists(clerkId: string) {
  try {
    // Check if user exists
    let user = await getUserByClerkId(clerkId)
    
    if (!user) {
      // Create user with minimal data
      const result = await syncClerkUserToDatabase(clerkId)
      if (result.success) {
        user = result.user!
      }
    }
    
    return user
  } catch (error) {
    console.error('Ensure user exists error:', error)
    return null
  }
}