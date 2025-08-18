import crypto from 'crypto'

// Use environment variables for encryption keys
const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const IV_LENGTH = 16 // For AES, this is always 16

export class EncryptionService {
  private static instance: EncryptionService
  private key: Buffer

  private constructor() {
    // Ensure key is 32 bytes for AES-256
    this.key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32)
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService()
    }
    return EncryptionService.instance
  }

  /**
   * Encrypts sensitive data using AES-256-GCM
   */
  encrypt(text: string): { encrypted: string; authTag: string } {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted: iv.toString('hex') + ':' + encrypted,
      authTag: authTag.toString('hex')
    }
  }

  /**
   * Decrypts data encrypted with AES-256-GCM
   */
  decrypt(encryptedData: string, authTag: string): string {
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encrypted = parts.join(':')
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv)
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Creates a hash of sensitive data for indexing/searching
   * Uses HMAC-SHA256 for deterministic hashing
   */
  hash(text: string): string {
    const hmac = crypto.createHmac('sha256', this.key)
    hmac.update(text)
    return hmac.digest('hex')
  }

  /**
   * Generates a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Encrypts an object by encrypting specified fields
   */
  encryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): T & { _encryption?: Record<string, string> } {
    const encrypted = { ...obj } as T & { _encryption: Record<string, string> }
    const authTags: Record<string, string> = {}

    for (const field of fieldsToEncrypt) {
      if (obj[field]) {
        const value = String(obj[field])
        const { encrypted: encryptedValue, authTag } = this.encrypt(value)
        encrypted[field] = encryptedValue as any
        authTags[field as string] = authTag
      }
    }

    encrypted._encryption = authTags
    return encrypted
  }

  /**
   * Decrypts an object by decrypting specified fields
   */
  decryptObject<T extends Record<string, any>>(
    obj: T & { _encryption?: Record<string, string> },
    fieldsToDecrypt: (keyof T)[]
  ): T {
    const decrypted = { ...obj }
    const authTags = obj._encryption || {}

    for (const field of fieldsToDecrypt) {
      if (obj[field] && authTags[field as string]) {
        try {
          const decryptedValue = this.decrypt(
            String(obj[field]),
            authTags[field as string]
          )
          decrypted[field] = decryptedValue as any
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error)
          // Keep encrypted value if decryption fails
        }
      }
    }

    delete decrypted._encryption
    return decrypted
  }
}

// Export singleton instance
export const encryption = EncryptionService.getInstance()

// Utility functions for common use cases
export function encryptSensitiveData(data: string): { encrypted: string; authTag: string } {
  return encryption.encrypt(data)
}

export function decryptSensitiveData(encrypted: string, authTag: string): string {
  return encryption.decrypt(encrypted, authTag)
}

export function hashForSearch(data: string): string {
  return encryption.hash(data)
}

// Example usage for patient data
export interface EncryptedPatientData {
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string
  firstNameHash?: string
  lastNameHash?: string
  phoneNumberHash?: string
  _encryption?: Record<string, string>
}

export function encryptPatientData(patient: {
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string
}): EncryptedPatientData {
  const encrypted = encryption.encryptObject(patient, ['firstName', 'lastName', 'phoneNumber'])
  
  // Add hashes for searching
  return {
    ...encrypted,
    firstNameHash: encryption.hash(patient.firstName.toLowerCase()),
    lastNameHash: encryption.hash(patient.lastName.toLowerCase()),
    phoneNumberHash: encryption.hash(patient.phoneNumber),
    dateOfBirth: patient.dateOfBirth // Don't encrypt dates for querying
  }
}

export function decryptPatientData(encrypted: EncryptedPatientData): {
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string
} {
  const decrypted = encryption.decryptObject(encrypted, ['firstName', 'lastName', 'phoneNumber'])
  
  // Remove hash fields
  const { firstNameHash, lastNameHash, phoneNumberHash, ...patientData } = decrypted
  
  return patientData
}