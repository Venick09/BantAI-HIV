import { describe, it, expect, beforeEach } from '@jest/globals'
import { 
  EncryptionService, 
  encryptPatientData, 
  decryptPatientData 
} from '@/lib/crypto/encryption'

describe('EncryptionService', () => {
  let encryptionService: EncryptionService

  beforeEach(() => {
    encryptionService = EncryptionService.getInstance()
  })

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'sensitive data'
      const { encrypted, authTag } = encryptionService.encrypt(plaintext)
      
      expect(encrypted).not.toBe(plaintext)
      expect(encrypted).toContain(':')
      
      const decrypted = encryptionService.decrypt(encrypted, authTag)
      expect(decrypted).toBe(plaintext)
    })

    it('should handle special characters', () => {
      const plaintext = 'José García +639171234567'
      const { encrypted, authTag } = encryptionService.encrypt(plaintext)
      
      const decrypted = encryptionService.decrypt(encrypted, authTag)
      expect(decrypted).toBe(plaintext)
    })

    it('should fail with wrong auth tag', () => {
      const plaintext = 'sensitive data'
      const { encrypted } = encryptionService.encrypt(plaintext)
      const wrongAuthTag = 'invalid_auth_tag'
      
      expect(() => {
        encryptionService.decrypt(encrypted, wrongAuthTag)
      }).toThrow()
    })
  })

  describe('hash', () => {
    it('should create consistent hashes', () => {
      const data = 'searchable data'
      const hash1 = encryptionService.hash(data)
      const hash2 = encryptionService.hash(data)
      
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(data)
    })

    it('should create different hashes for different data', () => {
      const hash1 = encryptionService.hash('data1')
      const hash2 = encryptionService.hash('data2')
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('patient data encryption', () => {
    it('should encrypt patient data fields', () => {
      const patient = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+639171234567',
        dateOfBirth: '1990-01-01'
      }

      const encrypted = encryptPatientData(patient)
      
      expect(encrypted.firstName).not.toBe(patient.firstName)
      expect(encrypted.lastName).not.toBe(patient.lastName)
      expect(encrypted.phoneNumber).not.toBe(patient.phoneNumber)
      expect(encrypted.dateOfBirth).toBe(patient.dateOfBirth) // Date should not be encrypted
      expect(encrypted._encryption).toBeDefined()
      expect(encrypted.firstNameHash).toBeDefined()
      expect(encrypted.lastNameHash).toBeDefined()
      expect(encrypted.phoneNumberHash).toBeDefined()
    })

    it('should decrypt patient data correctly', () => {
      const patient = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+639181234567',
        dateOfBirth: '1985-05-15'
      }

      const encrypted = encryptPatientData(patient)
      const decrypted = decryptPatientData(encrypted)
      
      expect(decrypted.firstName).toBe(patient.firstName)
      expect(decrypted.lastName).toBe(patient.lastName)
      expect(decrypted.phoneNumber).toBe(patient.phoneNumber)
      expect(decrypted.dateOfBirth).toBe(patient.dateOfBirth)
      expect(decrypted).not.toHaveProperty('_encryption')
      expect(decrypted).not.toHaveProperty('firstNameHash')
    })
  })

  describe('generateToken', () => {
    it('should generate random tokens', () => {
      const token1 = encryptionService.generateToken()
      const token2 = encryptionService.generateToken()
      
      expect(token1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token2).toHaveLength(64)
      expect(token1).not.toBe(token2)
    })

    it('should generate tokens of specified length', () => {
      const token = encryptionService.generateToken(16)
      expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    })
  })
})

describe('Data Privacy Compliance', () => {
  it('should hash searchable fields for privacy', () => {
    const encryptionService = EncryptionService.getInstance()
    const phoneNumber = '+639171234567'
    
    // Hash should be consistent for searching
    const hash1 = encryptionService.hash(phoneNumber)
    const hash2 = encryptionService.hash(phoneNumber)
    
    expect(hash1).toBe(hash2)
    
    // Original data should not be derivable from hash
    expect(hash1).not.toContain(phoneNumber)
  })

  it('should handle case-insensitive search hashes', () => {
    const encryptionService = EncryptionService.getInstance()
    
    const hash1 = encryptionService.hash('john'.toLowerCase())
    const hash2 = encryptionService.hash('JOHN'.toLowerCase())
    
    expect(hash1).toBe(hash2)
  })
})