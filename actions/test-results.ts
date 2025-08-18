'use server'

import { db } from '@/db'
import { testResults, users, testCenters, referrals, riskAssessments } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function getUserTestResults() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized', results: [] }
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found', results: [] }
    }

    // Get test results with test center info
    const results = await db
      .select({
        id: testResults.id,
        testDate: testResults.testDate,
        testType: testResults.testType,
        result: testResults.result,
        isConfirmed: testResults.isConfirmed,
        resultDate: testResults.resultDate,
        notes: testResults.notes,
        createdAt: testResults.createdAt,
        testCenter: {
          id: testCenters.id,
          name: testCenters.name,
          address: testCenters.address,
          city: testCenters.city,
          province: testCenters.province
        },
        referralCode: referrals.referralCode
      })
      .from(testResults)
      .innerJoin(testCenters, eq(testResults.testCenterId, testCenters.id))
      .innerJoin(referrals, eq(testResults.referralId, referrals.id))
      .where(eq(testResults.userId, user.id))
      .orderBy(desc(testResults.createdAt))

    return { success: true, results }
  } catch (error) {
    console.error('Get test results error:', error)
    return { success: false, error: 'Failed to fetch test results', results: [] }
  }
}

export async function getPendingReferrals() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized', referrals: [] }
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found', referrals: [] }
    }

    // Get pending referrals (not yet tested)
    const pendingReferrals = await db
      .select({
        id: referrals.id,
        referralCode: referrals.referralCode,
        status: referrals.status,
        createdAt: referrals.createdAt,
        expiresAt: referrals.expiresAt,
        riskLevel: riskAssessments.riskLevel,
        assessmentDate: riskAssessments.completedAt
      })
      .from(referrals)
      .innerJoin(riskAssessments, eq(referrals.assessmentId, riskAssessments.id))
      .where(
        and(
          eq(referrals.userId, user.id),
          eq(referrals.status, 'pending')
        )
      )
      .orderBy(desc(referrals.createdAt))

    return { success: true, referrals: pendingReferrals }
  } catch (error) {
    console.error('Get pending referrals error:', error)
    return { success: false, error: 'Failed to fetch pending referrals', referrals: [] }
  }
}

export async function downloadTestResult(resultId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Get test result with full details
    const [result] = await db
      .select({
        testResult: testResults,
        testCenter: testCenters,
        referral: referrals,
        patient: users
      })
      .from(testResults)
      .innerJoin(testCenters, eq(testResults.testCenterId, testCenters.id))
      .innerJoin(referrals, eq(testResults.referralId, referrals.id))
      .innerJoin(users, eq(testResults.userId, users.id))
      .where(eq(testResults.id, resultId))
      .limit(1)

    if (!result || result.testResult.userId !== user.id) {
      return { success: false, error: 'Result not found or unauthorized' }
    }

    // Format the result data for download
    const downloadData = {
      patientName: `${result.patient.firstName} ${result.patient.lastName}`,
      referralCode: result.referral.referralCode,
      testDate: result.testResult.testDate,
      testType: result.testResult.testType,
      result: result.testResult.result,
      testCenter: `${result.testCenter.name}, ${result.testCenter.address}, ${result.testCenter.city}`,
      resultDate: result.testResult.resultDate,
      isConfirmed: result.testResult.isConfirmed
    }

    return { success: true, data: downloadData }
  } catch (error) {
    console.error('Download test result error:', error)
    return { success: false, error: 'Failed to download test result' }
  }
}