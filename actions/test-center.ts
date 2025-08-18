'use server'

import { db } from '@/db'
import { 
  referrals, 
  testResults, 
  users, 
  referralEvents,
  billingEvents,
  artPatients,
  testCenters,
  riskAssessments
} from '@/db/schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SMSService } from '@/lib/sms/sms-service'
import { nanoid } from 'nanoid'

export async function getReferralDetails(referralCode: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return null
    }

    // Get user to check if they're a health worker
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return null
    }

    // Get referral with patient info
    const [referralData] = await db
      .select({
        id: referrals.id,
        referralCode: referrals.referralCode,
        status: referrals.status,
        createdAt: referrals.createdAt,
        expiresAt: referrals.expiresAt,
        patient: {
          firstName: users.firstName,
          lastName: users.lastName,
          phoneNumber: users.phoneNumber,
          dateOfBirth: users.dateOfBirth
        },
        riskLevel: riskAssessments.riskLevel
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.userId, users.id))
      .innerJoin(riskAssessments, eq(referrals.assessmentId, riskAssessments.id))
      .where(eq(referrals.referralCode, referralCode.toUpperCase()))
      .limit(1)

    if (!referralData) {
      return null
    }

    // Check if there's already a test result
    const [existingResult] = await db
      .select()
      .from(testResults)
      .where(eq(testResults.referralId, referralData.id))
      .limit(1)

    return {
      ...referralData,
      testResult: existingResult ? {
        result: existingResult.result,
        testDate: existingResult.testDate,
        testType: existingResult.testType
      } : null
    }
  } catch (error) {
    console.error('Get referral details error:', error)
    return null
  }
}

export async function submitTestResult(data: {
  referralId: string
  testType: string
  result: string
  notes?: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user to check permissions
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get referral details
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, data.referralId))
      .limit(1)

    if (!referral) {
      return { success: false, error: 'Referral not found' }
    }

    // Check if result already exists
    const [existingResult] = await db
      .select()
      .from(testResults)
      .where(eq(testResults.referralId, data.referralId))
      .limit(1)

    if (existingResult) {
      return { success: false, error: 'Test result already submitted' }
    }

    // Create test result
    const [testResult] = await db
      .insert(testResults)
      .values({
        referralId: data.referralId,
        userId: referral.userId,
        testCenterId: currentUser.testCenterId || referral.testCenterId!,
        testDate: new Date().toISOString().split('T')[0],
        testType: data.testType,
        result: data.result as any,
        resultDate: new Date().toISOString().split('T')[0],
        recordedBy: currentUser.id,
        notes: data.notes,
        isConfirmed: data.result !== 'positive' // Non-positive results are auto-confirmed
      })
      .returning()

    // Update referral status
    await db
      .update(referrals)
      .set({ 
        status: 'tested',
        updatedAt: new Date()
      })
      .where(eq(referrals.id, data.referralId))

    // Log referral event
    await db.insert(referralEvents).values({
      referralId: data.referralId,
      eventType: 'tested',
      eventData: JSON.stringify({
        testType: data.testType,
        result: data.result,
        recordedBy: currentUser.id
      }),
      createdBy: currentUser.id
    })

    // Create billing event for test result
    await db.insert(billingEvents).values({
      userId: referral.userId,
      eventType: 'test_result_logged',
      eventDate: new Date(),
      amount: '200', // ₱200 for test result
      referenceId: testResult.id,
      referenceTable: 'test_results',
      description: `HIV test result recorded - ${data.result}`
    })

    // Send SMS to patient
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.id, referral.userId))
      .limit(1)

    if (patient) {
      const smsService = new SMSService()
      await smsService.initialize()

      let message = ''
      if (data.result === 'negative') {
        message = `Hi ${patient.firstName}, your HIV test result is NEGATIVE. Continue practicing safe behaviors. For questions, reply HELP.`
      } else if (data.result === 'positive') {
        message = `Hi ${patient.firstName}, please return to the clinic for your test results and important next steps. Your health matters. Reply HELP for support.`
        
        // Create ART management record for positive cases
        const patientCode = `ART${nanoid(8).toUpperCase()}`
        await db.insert(artPatients).values({
          userId: referral.userId,
          testResultId: testResult.id,
          patientCode,
          status: 'not_started',
          enrollmentDate: new Date().toISOString().split('T')[0]
        })

        // Create billing event for positive case
        await db.insert(billingEvents).values({
          userId: referral.userId,
          eventType: 'art_started',
          eventDate: new Date(),
          amount: '500', // ₱500 for positive case starting ART
          referenceId: testResult.id,
          referenceTable: 'test_results',
          description: 'Positive HIV case - ART initiation'
        })
      } else {
        message = `Hi ${patient.firstName}, your HIV test requires follow-up. Please return to the clinic. Reply HELP for assistance.`
      }

      await smsService.sendSMS(
        patient.phoneNumber,
        message,
        patient.id,
        'test_result_notification'
      )
    }

    revalidatePath('/dashboard/test-center')
    return { success: true, message: 'Test result submitted successfully' }
  } catch (error) {
    console.error('Submit test result error:', error)
    return { success: false, error: 'Failed to submit test result' }
  }
}

export async function getTestCenterStats(testCenterId?: string) {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return null
    }

    const centerFilter = testCenterId || currentUser.testCenterId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's tests
    const todayTests = await db
      .select()
      .from(testResults)
      .where(
        and(
          centerFilter ? eq(testResults.testCenterId, centerFilter) : undefined,
          gte(testResults.createdAt, today)
        )
      )

    // Get pending results
    const pendingResults = await db
      .select()
      .from(testResults)
      .where(
        and(
          centerFilter ? eq(testResults.testCenterId, centerFilter) : undefined,
          eq(testResults.isConfirmed, false)
        )
      )

    // Get this week's positive cases
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const positiveCases = await db
      .select()
      .from(testResults)
      .where(
        and(
          centerFilter ? eq(testResults.testCenterId, centerFilter) : undefined,
          eq(testResults.result, 'positive'),
          gte(testResults.createdAt, weekStart)
        )
      )

    // Get today's referrals
    const todayReferrals = await db
      .select()
      .from(referrals)
      .where(
        and(
          centerFilter ? eq(referrals.testCenterId, centerFilter) : undefined,
          gte(referrals.createdAt, today)
        )
      )

    return {
      todayTests: todayTests.length,
      pendingResults: pendingResults.length,
      positiveCases: positiveCases.length,
      todayReferrals: todayReferrals.length
    }
  } catch (error) {
    console.error('Get test center stats error:', error)
    return null
  }
}

export async function getRecentActivities(limit: number = 5) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return []
    }

    const activities = await db
      .select({
        referralCode: referrals.referralCode,
        eventType: referralEvents.eventType,
        createdAt: referralEvents.createdAt,
        result: testResults.result
      })
      .from(referralEvents)
      .innerJoin(referrals, eq(referralEvents.referralId, referrals.id))
      .leftJoin(testResults, eq(testResults.referralId, referrals.id))
      .where(
        currentUser.testCenterId 
          ? eq(referrals.testCenterId, currentUser.testCenterId)
          : undefined
      )
      .orderBy(desc(referralEvents.createdAt))
      .limit(limit)

    return activities
  } catch (error) {
    console.error('Get recent activities error:', error)
    return []
  }
}

// Public functions for listing test centers
export async function getTestCenters() {
  try {
    const centers = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.isActive, true))
      .orderBy(testCenters.city)
    
    return centers
  } catch (error) {
    console.error('Get test centers error:', error)
    return []
  }
}

export async function getTestCenterById(id: string) {
  try {
    const [center] = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.id, id))
      .limit(1)
    
    return center || null
  } catch (error) {
    console.error('Get test center by ID error:', error)
    return null
  }
}

export async function getTestCentersByCity(city: string) {
  try {
    const centers = await db
      .select()
      .from(testCenters)
      .where(eq(testCenters.city, city))
      .orderBy(testCenters.name)
    
    return centers
  } catch (error) {
    console.error('Get test centers by city error:', error)
    return []
  }
}