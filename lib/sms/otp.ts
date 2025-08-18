import { db } from '@/db'
import { otpVerifications } from '@/db/schema'
import { eq, and, gt, lte } from 'drizzle-orm'
import crypto from 'crypto'
import { OTPMemoryService } from './otp-memory'

export class OTPService {
  private static useMemoryStore = true // Default to memory store
  private static initialized = false
  private static plainOTPStore: Map<string, string> = new Map() // Development only
  
  private static async initialize() {
    if (this.initialized) return
    
    try {
      // Try a simple query to check if database is available
      await db.select().from(otpVerifications).limit(1)
      this.useMemoryStore = false
      console.log('✅ OTP: Using database storage')
    } catch (error) {
      console.log('⚠️ OTP: Database not available, using in-memory storage')
      console.log('⚠️ OTP: Error details:', error instanceof Error ? error.message : error)
      this.useMemoryStore = true
    }
    
    this.initialized = true
  }
  private static readonly OTP_LENGTH = 6
  private static readonly OTP_EXPIRY_MINUTES = 10
  private static readonly MAX_ATTEMPTS = 3
  
  /**
   * Generate a random OTP code
   */
  static generateOTP(): string {
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)]
    }
    return otp
  }
  
  /**
   * Create and store an OTP for a phone number
   */
  static async createOTP(phoneNumber: string, purpose: string): Promise<string> {
    // Initialize if not already done
    await this.initialize()
    
    // Use memory store if database is not available
    if (this.useMemoryStore) {
      return OTPMemoryService.createOTP(phoneNumber, purpose)
    }
    const otp = this.generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES)
    
    // Invalidate any existing OTPs for this number and purpose
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.purpose, purpose),
          eq(otpVerifications.isUsed, false)
        )
      )
    
    // Create new OTP
    await db.insert(otpVerifications).values({
      phoneNumber,
      otpCode: this.hashOTP(otp),
      purpose,
      expiresAt
    })
    
    // Store plain OTP for development display
    if (process.env.NODE_ENV !== 'production') {
      this.plainOTPStore.set(`${phoneNumber}_${purpose}`, otp)
      
      console.log('\n' + '='.repeat(60))
      console.log('🔑 OTP GENERATED (Database Storage)')
      console.log('='.repeat(60))
      console.log(`Phone Number: ${phoneNumber}`)
      console.log(`Purpose: ${purpose}`)
      console.log(`OTP Code: ${otp}`)
      console.log(`Expires: ${expiresAt.toLocaleString()}`)
      console.log('='.repeat(60) + '\n')
    }
    
    return otp
  }
  
  /**
   * Verify an OTP
   */
  static async verifyOTP(
    phoneNumber: string,
    otp: string,
    purpose: string
  ): Promise<{ success: boolean; error?: string }> {
    // Initialize if not already done
    await this.initialize()
    
    // Use memory store if database is not available
    if (this.useMemoryStore) {
      return OTPMemoryService.verifyOTP(phoneNumber, otp, purpose)
    }
    const hashedOTP = this.hashOTP(otp)
    
    // Find valid OTP
    const [verification] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.otpCode, hashedOTP),
          eq(otpVerifications.purpose, purpose),
          eq(otpVerifications.isUsed, false),
          gt(otpVerifications.expiresAt, new Date()),
          lte(otpVerifications.attempts, this.MAX_ATTEMPTS)
        )
      )
      .limit(1)
    
    if (!verification) {
      // Increment attempts for the most recent OTP
      const [recentOTP] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.phoneNumber, phoneNumber),
            eq(otpVerifications.purpose, purpose),
            eq(otpVerifications.isUsed, false)
          )
        )
        .orderBy(otpVerifications.createdAt)
        .limit(1)
      
      if (recentOTP) {
        await db
          .update(otpVerifications)
          .set({ attempts: recentOTP.attempts + 1 })
          .where(eq(otpVerifications.id, recentOTP.id))
        
        if (recentOTP.attempts >= this.MAX_ATTEMPTS - 1) {
          return { success: false, error: 'Maximum attempts exceeded' }
        }
      }
      
      return { success: false, error: 'Invalid or expired OTP' }
    }
    
    // Mark OTP as used
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, verification.id))
    
    return { success: true }
  }
  
  /**
   * Check if phone number has too many recent OTP requests
   */
  static async canRequestOTP(phoneNumber: string): Promise<boolean> {
    // Initialize if not already done
    await this.initialize()
    
    // Use memory store if database is not available
    if (this.useMemoryStore) {
      return OTPMemoryService.canRequestOTP(phoneNumber)
    }
    const recentCutoff = new Date()
    recentCutoff.setMinutes(recentCutoff.getMinutes() - 1) // 1 minute cooldown
    
    const recentRequests = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          gt(otpVerifications.createdAt, recentCutoff)
        )
      )
    
    return recentRequests.length === 0
  }
  
  /**
   * Hash OTP for secure storage
   */
  private static hashOTP(otp: string): string {
    return crypto
      .createHash('sha256')
      .update(otp + process.env.OTP_SECRET || 'default-secret')
      .digest('hex')
  }
  
  /**
   * Get the last OTP for a phone number (development only)
   * Returns the actual OTP code, not the hash
   */
  static getLastOTP(phoneNumber: string, purpose: string): string | null {
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    
    // Check memory store first
    if (this.useMemoryStore) {
      return OTPMemoryService.getLastOTP(phoneNumber, purpose)
    }
    
    // Check our plain OTP store
    return this.plainOTPStore.get(`${phoneNumber}_${purpose}`) || null
  }
}