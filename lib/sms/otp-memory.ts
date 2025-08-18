import crypto from 'crypto'

interface OTPRecord {
  phoneNumber: string
  otpCode: string
  purpose: string
  expiresAt: Date
  attempts: number
  isUsed: boolean
  createdAt: Date
}

/**
 * In-memory OTP Service for development
 * Stores OTPs in memory instead of database
 */
export class OTPMemoryService {
  private static otpStore: Map<string, OTPRecord> = new Map()
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
    const otp = this.generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES)
    
    // Create key for storage
    const key = `${phoneNumber}_${purpose}`
    
    // Invalidate any existing OTPs for this number and purpose
    const existingOTP = this.otpStore.get(key)
    if (existingOTP && !existingOTP.isUsed) {
      existingOTP.isUsed = true
    }
    
    // Store new OTP
    this.otpStore.set(key, {
      phoneNumber,
      otpCode: this.hashOTP(otp),
      purpose,
      expiresAt,
      attempts: 0,
      isUsed: false,
      createdAt: new Date()
    })
    
    // Store plain OTP for development display
    if (process.env.NODE_ENV !== 'production') {
      this.plainOTPStore.set(key, otp)
    }
    
    // Log for development
    console.log('\n' + '='.repeat(60))
    console.log('🔐 OTP GENERATED (In-Memory Storage)')
    console.log('='.repeat(60))
    console.log(`Phone Number: ${phoneNumber}`)
    console.log(`Purpose: ${purpose}`)
    console.log(`OTP Code: ${otp}`)
    console.log(`Expires: ${expiresAt.toLocaleString()}`)
    console.log('='.repeat(60) + '\n')
    
    // Store for development display
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { storeLastOTP } = require('@/lib/sms/otp-store')
        storeLastOTP(phoneNumber, otp)
      } catch (e) {
        // Ignore if module not found
      }
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
    console.log('\n' + '='.repeat(60))
    console.log('🔍 OTP VERIFICATION ATTEMPT')
    console.log('='.repeat(60))
    console.log(`Phone: ${phoneNumber}`)
    console.log(`OTP Entered: ${otp}`)
    console.log(`Purpose: ${purpose}`)
    console.log(`Store Keys: ${Array.from(this.otpStore.keys()).join(', ')}`)
    
    const hashedOTP = this.hashOTP(otp)
    const key = `${phoneNumber}_${purpose}`
    const verification = this.otpStore.get(key)
    
    console.log(`Looking for key: ${key}`)
    console.log(`Found record: ${verification ? 'Yes' : 'No'}`)
    
    if (!verification) {
      return { success: false, error: 'No OTP found for this number' }
    }
    
    // Check if OTP is expired
    if (verification.expiresAt < new Date()) {
      return { success: false, error: 'OTP has expired' }
    }
    
    // Check if OTP is already used
    if (verification.isUsed) {
      return { success: false, error: 'OTP has already been used' }
    }
    
    // Check attempts
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      return { success: false, error: 'Maximum attempts exceeded' }
    }
    
    // Verify OTP
    if (verification.otpCode !== hashedOTP) {
      verification.attempts++
      console.log(`OTP mismatch!`)
      console.log(`Expected hash: ${verification.otpCode}`)
      console.log(`Received hash: ${hashedOTP}`)
      console.log(`Attempts now: ${verification.attempts}`)
      console.log('='.repeat(60) + '\n')
      return { success: false, error: 'Invalid OTP' }
    }
    
    // Mark as used
    verification.isUsed = true
    
    return { success: true }
  }
  
  /**
   * Check if phone number has too many recent OTP requests
   */
  static async canRequestOTP(phoneNumber: string): Promise<boolean> {
    // In development, allow bypassing rate limits
    if (process.env.NODE_ENV !== 'production') {
      console.log('📱 Development mode: Bypassing OTP rate limits');
      return true;
    }
    
    const recentCutoff = new Date()
    recentCutoff.setMinutes(recentCutoff.getMinutes() - 1) // 1 minute cooldown
    
    // Check all OTPs for this phone number
    for (const [_, record] of this.otpStore) {
      if (record.phoneNumber === phoneNumber && record.createdAt > recentCutoff) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Clear all OTPs for a phone number (development only)
   */
  static clearPhoneOTPs(phoneNumber: string) {
    const keysToDelete: string[] = []
    for (const [key, record] of this.otpStore) {
      if (record.phoneNumber === phoneNumber) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.otpStore.delete(key))
    console.log(`🗑️ Cleared ${keysToDelete.length} OTP(s) for ${phoneNumber}`)
  }
  
  /**
   * Get the last OTP for a phone number (development only)
   * Returns the actual OTP code, not the hash
   */
  static getLastOTP(phoneNumber: string, purpose: string): string | null {
    // This is only possible if we store the plain OTP temporarily
    // Let's add a temporary store for development
    return this.plainOTPStore.get(`${phoneNumber}_${purpose}`) || null
  }
  
  private static plainOTPStore: Map<string, string> = new Map()
  
  /**
   * Hash OTP for secure storage
   */
  private static hashOTP(otp: string): string {
    const secret = process.env.OTP_SECRET || 'dev-secret'
    const toHash = otp + secret
    const hash = crypto
      .createHash('sha256')
      .update(toHash)
      .digest('hex')
    
    console.log(`Hashing OTP: ${otp} with secret: ${secret.substring(0, 3)}...`)
    console.log(`Hash result: ${hash.substring(0, 10)}...`)
    
    return hash
  }
  
  /**
   * Clean up expired OTPs (call periodically)
   */
  static cleanup() {
    const now = new Date()
    for (const [key, record] of this.otpStore) {
      if (record.expiresAt < now || record.isUsed) {
        this.otpStore.delete(key)
      }
    }
  }
}