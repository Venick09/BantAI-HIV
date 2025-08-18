'use server'

import { db } from '@/db'
import { 
  billingEvents, 
  billingPeriods,
  billingAudit,
  users,
  riskAssessments,
  testResults,
  artPatients
} from '@/db/schema'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function getCurrentBillingPeriod() {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || currentUser.role !== 'admin') {
      return null
    }

    // Get current or create new billing period
    const currentDate = new Date()
    const currentDateStr = currentDate.toISOString().split('T')[0]
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0]

    const [existingPeriod] = await db
      .select()
      .from(billingPeriods)
      .where(
        and(
          lte(billingPeriods.startDate, currentDateStr),
          gte(billingPeriods.endDate, currentDateStr)
        )
      )
      .limit(1)

    if (existingPeriod) {
      return existingPeriod
    }

    // Create new billing period
    const [newPeriod] = await db
      .insert(billingPeriods)
      .values({
        periodName: `${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        startDate: startOfMonthStr,
        endDate: endOfMonthStr,
        status: 'pending'
      })
      .returning()

    return newPeriod
  } catch (error) {
    console.error('Get current billing period error:', error)
    return null
  }
}

export async function getBillingBreakdown(periodId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const [period] = await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.id, periodId))
      .limit(1)

    if (!period) return null

    // Get billing events for the period
    const events = await db
      .select({
        eventType: billingEvents.eventType,
        amount: billingEvents.amount,
        count: sql<number>`count(*)`.as('count'),
        total: sql<number>`sum(cast(${billingEvents.amount} as decimal))`.as('total')
      })
      .from(billingEvents)
      .where(
        and(
          gte(billingEvents.eventDate, new Date(period.startDate)),
          lte(billingEvents.eventDate, new Date(period.endDate + 'T23:59:59'))
        )
      )
      .groupBy(billingEvents.eventType, billingEvents.amount)

    const breakdown = [
      {
        category: 'Questionnaire Delivery',
        description: 'Risk assessment questionnaire sent via SMS',
        unitPrice: 150,
        quantity: 0,
        totalAmount: 0
      },
      {
        category: 'Test Results Logged',
        description: 'HIV test results recorded in system',
        unitPrice: 200,
        quantity: 0,
        totalAmount: 0
      },
      {
        category: 'Positive Case ART',
        description: 'HIV positive patients started on ART',
        unitPrice: 500,
        quantity: 0,
        totalAmount: 0
      }
    ]

    // Map events to breakdown
    events.forEach(event => {
      switch (event.eventType) {
        case 'questionnaire_delivered':
          breakdown[0].quantity = event.count
          breakdown[0].totalAmount = event.total
          break
        case 'test_result_logged':
          breakdown[1].quantity = event.count
          breakdown[1].totalAmount = event.total
          break
        case 'art_started':
          breakdown[2].quantity = event.count
          breakdown[2].totalAmount = event.total
          break
      }
    })

    return {
      breakdown,
      totalAmount: breakdown.reduce((sum, item) => sum + item.totalAmount, 0),
      totalPatients: await db
        .select({ count: sql<number>`count(distinct ${billingEvents.userId})` })
        .from(billingEvents)
        .where(
          and(
            gte(billingEvents.eventDate, new Date(period.startDate)),
            lte(billingEvents.eventDate, new Date(period.endDate + 'T23:59:59'))
          )
        )
        .then(result => result[0]?.count || 0)
    }
  } catch (error) {
    console.error('Get billing breakdown error:', error)
    return null
  }
}

export async function generateBillingCSV(periodId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || currentUser.role !== 'admin') {
      return null
    }

    const [period] = await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.id, periodId))
      .limit(1)

    if (!period) return null

    // Get all billing events with patient details
    const billingData = await db
      .select({
        patientId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        eventType: billingEvents.eventType,
        eventDate: billingEvents.eventDate,
        amount: billingEvents.amount,
        description: billingEvents.description
      })
      .from(billingEvents)
      .innerJoin(users, eq(billingEvents.userId, users.id))
      .where(
        and(
          gte(billingEvents.eventDate, new Date(period.startDate)),
          lte(billingEvents.eventDate, new Date(period.endDate + 'T23:59:59'))
        )
      )
      .orderBy(billingEvents.eventDate)

    // Generate CSV content
    const headers = ['Patient ID', 'Name', 'Phone', 'Service', 'Date', 'Amount', 'Description']
    const rows = billingData.map(row => [
      row.patientId,
      `${row.firstName} ${row.lastName}`,
      row.phoneNumber,
      row.eventType,
      new Date(row.eventDate).toLocaleDateString(),
      row.amount,
      row.description
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Log audit event
    await db.insert(billingAudit).values({
      billingPeriodId: periodId,
      action: 'exported',
      performedBy: currentUser.id,
      notes: `CSV generated for period ${period.startDate} to ${period.endDate}`
    })

    return {
      success: true,
      csvContent,
      filename: `billing_${period.startDate}_to_${period.endDate}.csv`
    }
  } catch (error) {
    console.error('Generate billing CSV error:', error)
    return null
  }
}

export async function submitBillingForApproval(periodId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Unauthorized' }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Calculate total amount
    const breakdown = await getBillingBreakdown(periodId)
    if (!breakdown) {
      return { success: false, error: 'Failed to calculate billing' }
    }

    // Update billing period status
    await db
      .update(billingPeriods)
      .set({
        status: 'approved',
        totalAmount: breakdown.totalAmount.toString(),
        totalPatients: breakdown.totalPatients,
        approvedAt: new Date(),
        approvedBy: currentUser.id,
        updatedAt: new Date()
      })
      .where(eq(billingPeriods.id, periodId))

    // Log audit event
    await db.insert(billingAudit).values({
      billingPeriodId: periodId,
      action: 'approved',
      performedBy: currentUser.id,
      notes: `Billing approved - Total: ₱${breakdown.totalAmount.toLocaleString()}`
    })

    revalidatePath('/dashboard/admin/billing')
    return { success: true, message: 'Billing submitted for approval' }
  } catch (error) {
    console.error('Submit billing error:', error)
    return { success: false, error: 'Failed to submit billing' }
  }
}

export async function getPatientBillingHistory(patientId: string, limit: number = 10) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const events = await db
      .select()
      .from(billingEvents)
      .where(eq(billingEvents.userId, patientId))
      .orderBy(desc(billingEvents.eventDate))
      .limit(limit)

    return events
  } catch (error) {
    console.error('Get patient billing history error:', error)
    return []
  }
}

export async function getBillingPeriods(limit: number = 12) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['admin', 'finance'].includes(currentUser.role)) {
      return []
    }

    const periods = await db
      .select()
      .from(billingPeriods)
      .orderBy(desc(billingPeriods.startDate))
      .limit(limit)

    return periods
  } catch (error) {
    console.error('Get billing periods error:', error)
    return []
  }
}

export async function getBillingAuditTrail(periodId?: string, limit: number = 50) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const query = db
      .select({
        id: billingAudit.id,
        action: billingAudit.action,
        performedAt: billingAudit.createdAt,
        notes: billingAudit.notes,
        userName: users.firstName,
        userRole: users.role
      })
      .from(billingAudit)
      .innerJoin(users, eq(billingAudit.performedBy, users.id))
      .where(
        periodId ? eq(billingAudit.billingPeriodId, periodId) : undefined
      )
      .orderBy(desc(billingAudit.createdAt))
      .limit(limit)

    return await query
  } catch (error) {
    console.error('Get billing audit trail error:', error)
    return []
  }
}