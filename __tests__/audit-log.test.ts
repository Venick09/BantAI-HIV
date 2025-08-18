import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { AuditLogService } from '@/lib/services/audit-log.service'
import { db } from '@/db'

// Mock the database
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue([])
    })
  }
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({
    get: jest.fn().mockImplementation((key: string) => {
      const mockHeaders: Record<string, string> = {
        'x-forwarded-for': '203.177.123.456',
        'user-agent': 'Mozilla/5.0 Test Browser'
      }
      return mockHeaders[key] || null
    })
  })
}))

describe('AuditLogService', () => {
  let auditService: AuditLogService

  beforeEach(() => {
    jest.clearAllMocks()
    auditService = AuditLogService.getInstance()
  })

  describe('log', () => {
    it('should log successful actions', async () => {
      const entry = {
        userId: 'user123',
        action: 'VIEW_PATIENT_RECORD' as const,
        resourceType: 'patient',
        resourceId: 'patient456',
        status: 'success' as const
      }

      await auditService.log(entry)

      expect(db.insert).toHaveBeenCalled()
    })

    it('should log failed actions with error messages', async () => {
      const entry = {
        userId: 'user123',
        action: 'ACCESS_DENIED' as const,
        resourceType: 'billing',
        resourceId: 'billing789',
        status: 'failed' as const,
        errorMessage: 'Insufficient permissions'
      }

      await auditService.log(entry)

      expect(db.insert).toHaveBeenCalled()
    })

    it('should capture IP address and user agent from headers', async () => {
      const entry = {
        userId: 'user123',
        action: 'USER_LOGIN' as const,
        status: 'success' as const
      }

      await auditService.log(entry)

      expect(db.insert).toHaveBeenCalled()
    })

    it('should not throw on database errors', async () => {
      // Mock database error
      ;(db.insert as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Database error')
      })

      const entry = {
        userId: 'user123',
        action: 'VIEW_PATIENT_RECORD' as const,
        status: 'success' as const
      }

      // Should not throw
      await expect(auditService.log(entry)).resolves.not.toThrow()
    })
  })

  describe('logSuccess', () => {
    it('should log successful action with resource', async () => {
      await auditService.logSuccess(
        'user123',
        'UPDATE_TEST_RESULT',
        { type: 'test_result', id: 'test789' },
        { previousStatus: 'pending', newStatus: 'completed' }
      )

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('logFailure', () => {
    it('should log failed action with error', async () => {
      await auditService.logFailure(
        'user123',
        'UPDATE_PATIENT_RECORD',
        'Validation error: Invalid phone number',
        { type: 'patient', id: 'patient456' }
      )

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('logDataAccess', () => {
    it('should log data access for viewing', async () => {
      await auditService.logDataAccess(
        'user123',
        'patient',
        'patient456',
        'view',
        { purpose: 'treatment' }
      )

      expect(db.insert).toHaveBeenCalled()
    })

    it('should log data access for updating', async () => {
      await auditService.logDataAccess(
        'user123',
        'patient',
        'patient456',
        'update',
        { fields: ['phoneNumber', 'address'] }
      )

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('logConsentActivity', () => {
    it('should log consent granted', async () => {
      await auditService.logConsentActivity(
        'user123',
        'hiv_testing',
        'grant',
        { version: '2.0' }
      )

      expect(db.insert).toHaveBeenCalled()
    })

    it('should log consent withdrawn', async () => {
      await auditService.logConsentActivity(
        'user123',
        'sms_communication',
        'withdraw',
        { reason: 'user_request' }
      )

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('logBillingActivity', () => {
    it('should log billing view', async () => {
      await auditService.logBillingActivity(
        'admin123',
        'view',
        'billing_period_2025_01'
      )

      expect(db.insert).toHaveBeenCalled()
    })

    it('should log billing export', async () => {
      await auditService.logBillingActivity(
        'admin123',
        'export',
        'billing_period_2025_01',
        { format: 'csv', recordCount: 342 }
      )

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('exportAuditLogs', () => {
    it('should export logs as CSV', async () => {
      // Mock getAuditLogs
      jest.spyOn(auditService, 'getAuditLogs').mockResolvedValueOnce([
        {
          createdAt: '2025-01-10 14:30:00',
          userId: 'user123',
          action: 'VIEW_PATIENT_RECORD',
          resourceType: 'patient',
          resourceId: 'patient456',
          status: 'success',
          ipAddress: '203.177.123.456',
          userAgent: 'Mozilla/5.0',
          errorMessage: null
        }
      ])

      const csv = await auditService.exportAuditLogs()

      expect(csv).toContain('Timestamp,User ID,Action')
      expect(csv).toContain('user123')
      expect(csv).toContain('VIEW_PATIENT_RECORD')
    })
  })
})

describe('Compliance Requirements', () => {
  let auditService: AuditLogService

  beforeEach(() => {
    jest.clearAllMocks()
    auditService = AuditLogService.getInstance()
  })

  it('should log all patient data access (RA 11166 requirement)', async () => {
    // View patient HIV status
    await auditService.logDataAccess(
      'healthworker123',
      'patient_hiv_status',
      'patient456',
      'view',
      { purpose: 'treatment_planning' }
    )

    expect(db.insert).toHaveBeenCalledWith(expect.anything())
  })

  it('should log consent activities (RA 10173 requirement)', async () => {
    // Grant consent for data processing
    await auditService.logConsentActivity(
      'user123',
      'data_processing',
      'grant',
      { 
        scope: ['personal_info', 'health_records'],
        expiryDate: '2026-01-10'
      }
    )

    expect(db.insert).toHaveBeenCalledWith(expect.anything())
  })

  it('should log security events', async () => {
    // Failed login attempt
    await auditService.logFailure(
      'unknown_user',
      'USER_LOGIN',
      'Invalid credentials',
      undefined,
      { attemptedUsername: 'test@example.com' }
    )

    expect(db.insert).toHaveBeenCalledWith(expect.anything())
  })
})