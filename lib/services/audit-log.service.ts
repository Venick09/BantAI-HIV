import { db } from '@/db'
import { auditLogs } from '@/db/schema'
import { headers } from 'next/headers'

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'VIEW_PATIENT_RECORD'
  | 'UPDATE_PATIENT_RECORD'
  | 'DELETE_PATIENT_RECORD'
  | 'CREATE_RISK_ASSESSMENT'
  | 'VIEW_RISK_ASSESSMENT'
  | 'CREATE_REFERRAL'
  | 'VIEW_REFERRAL'
  | 'UPDATE_TEST_RESULT'
  | 'VIEW_TEST_RESULT'
  | 'START_ART'
  | 'UPDATE_ART_STATUS'
  | 'VIEW_BILLING'
  | 'EXPORT_BILLING'
  | 'GENERATE_REPORT'
  | 'EXPORT_DATA'
  | 'GRANT_CONSENT'
  | 'WITHDRAW_CONSENT'
  | 'ACCESS_DENIED'
  | 'SYSTEM_ERROR'

export interface AuditLogEntry {
  userId: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failed'
  errorMessage?: string
}

export class AuditLogService {
  private static instance: AuditLogService
  
  private constructor() {}
  
  static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService()
    }
    return AuditLogService.instance
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Get request headers if available
      let ipAddress = entry.ipAddress
      let userAgent = entry.userAgent
      
      try {
        const headersList = await headers()
        ipAddress = ipAddress || headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
        userAgent = userAgent || headersList.get('user-agent') || 'unknown'
      } catch (error) {
        // Headers might not be available in all contexts
      }

      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress,
        userAgent,
        status: entry.status,
        errorMessage: entry.errorMessage,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to write audit log:', error)
      // Don't throw - audit logging should not break the application
    }
  }

  async logSuccess(
    userId: string,
    action: AuditAction,
    resource?: { type: string; id: string },
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resourceType: resource?.type,
      resourceId: resource?.id,
      metadata,
      status: 'success'
    })
  }

  async logFailure(
    userId: string,
    action: AuditAction,
    error: string,
    resource?: { type: string; id: string },
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resourceType: resource?.type,
      resourceId: resource?.id,
      metadata,
      status: 'failed',
      errorMessage: error
    })
  }

  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'view' | 'update' | 'delete',
    metadata?: Record<string, any>
  ): Promise<void> {
    const actionMap = {
      view: 'VIEW_PATIENT_RECORD',
      update: 'UPDATE_PATIENT_RECORD',
      delete: 'DELETE_PATIENT_RECORD'
    }
    
    await this.logSuccess(
      userId,
      actionMap[action] as AuditAction,
      { type: resourceType, id: resourceId },
      metadata
    )
  }

  async logConsentActivity(
    userId: string,
    consentType: string,
    action: 'grant' | 'withdraw',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSuccess(
      userId,
      action === 'grant' ? 'GRANT_CONSENT' : 'WITHDRAW_CONSENT',
      { type: 'consent', id: consentType },
      metadata
    )
  }

  async logBillingActivity(
    userId: string,
    action: 'view' | 'export',
    billingPeriodId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSuccess(
      userId,
      action === 'view' ? 'VIEW_BILLING' : 'EXPORT_BILLING',
      billingPeriodId ? { type: 'billing_period', id: billingPeriodId } : undefined,
      metadata
    )
  }

  async getAuditLogs(filters?: {
    userId?: string
    action?: AuditAction
    resourceType?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
    status?: 'success' | 'failed'
    limit?: number
  }): Promise<any[]> {
    // Implementation would query the audit logs table with filters
    // This is a placeholder for the actual implementation
    return []
  }

  async exportAuditLogs(filters?: any): Promise<string> {
    const logs = await this.getAuditLogs(filters)
    
    // Convert to CSV format
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'Status',
      'IP Address',
      'User Agent',
      'Error Message'
    ]
    
    const rows = logs.map(log => [
      log.createdAt,
      log.userId,
      log.action,
      log.resourceType || '',
      log.resourceId || '',
      log.status,
      log.ipAddress || '',
      log.userAgent || '',
      log.errorMessage || ''
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    return csv
  }
}

// Export singleton instance
export const auditLog = AuditLogService.getInstance()