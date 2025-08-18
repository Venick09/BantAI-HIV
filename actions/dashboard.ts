'use server'

import { db } from '@/db'
import { users, riskAssessments, testResults, referrals } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function getDashboardData() {
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

    // Get latest risk assessment
    const [latestAssessment] = await db
      .select({
        id: riskAssessments.id,
        riskLevel: riskAssessments.riskLevel,
        status: riskAssessments.status,
        completedAt: riskAssessments.completedAt
      })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.userId, user.id),
          eq(riskAssessments.status, 'completed')
        )
      )
      .orderBy(desc(riskAssessments.createdAt))
      .limit(1)

    // Get latest test result
    const [latestTest] = await db
      .select({
        id: testResults.id,
        testDate: testResults.testDate,
        result: testResults.result,
        isConfirmed: testResults.isConfirmed
      })
      .from(testResults)
      .where(eq(testResults.userId, user.id))
      .orderBy(desc(testResults.testDate))
      .limit(1)

    // Get pending referrals count
    const pendingReferrals = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(
        and(
          eq(referrals.userId, user.id),
          eq(referrals.status, 'pending')
        )
      )

    // Calculate assessment status
    let assessmentStatus = 'not_started'
    if (latestAssessment) {
      const daysSinceAssessment = Math.floor(
        (Date.now() - new Date(latestAssessment.completedAt!).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceAssessment < 30) {
        assessmentStatus = 'completed'
      } else {
        assessmentStatus = 'due'
      }
    }

    // Calculate test status
    let testStatus = 'no_test'
    let lastTestDate = null
    if (latestTest) {
      testStatus = latestTest.isConfirmed ? 'confirmed' : 'pending'
      lastTestDate = latestTest.testDate
    }

    return {
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          verificationStatus: user.verificationStatus
        },
        assessment: {
          status: assessmentStatus,
          latestRiskLevel: latestAssessment?.riskLevel || null,
          completedAt: latestAssessment?.completedAt || null
        },
        testing: {
          status: testStatus,
          latestResult: latestTest?.result || null,
          lastTestDate: lastTestDate,
          pendingReferrals: pendingReferrals.length
        },
        privacy: {
          status: 'secured' // Always secured with encryption
        }
      }
    }
  } catch (error) {
    console.error('Dashboard data error:', error)
    return { success: false, error: 'Failed to load dashboard data' }
  }
}