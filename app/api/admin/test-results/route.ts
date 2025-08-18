import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/middleware/admin'
import { db } from '@/db'
import { testResults, users, testCenters, referrals } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all test results with patient and test center info
    const results = await db
      .select({
        id: testResults.id,
        testDate: testResults.testDate,
        testType: testResults.testType,
        result: testResults.result,
        isConfirmed: testResults.isConfirmed,
        createdAt: testResults.createdAt,
        patientId: testResults.userId,
        referralId: testResults.referralId,
        testCenterId: testResults.testCenterId,
        recordedBy: testResults.recordedBy
      })
      .from(testResults)
      .orderBy(desc(testResults.createdAt))

    // Get related data
    const userIds = [...new Set(results.map(r => r.patientId).concat(results.map(r => r.recordedBy).filter(Boolean)))]
    const referralIds = [...new Set(results.map(r => r.referralId))]
    const testCenterIds = [...new Set(results.map(r => r.testCenterId))]

    const [usersData, referralsData, testCentersData] = await Promise.all([
      userIds.length > 0 ? db.select().from(users).where(sql`${users.id} IN ${userIds}`) : [],
      referralIds.length > 0 ? db.select().from(referrals).where(sql`${referrals.id} IN ${referralIds}`) : [],
      testCenterIds.length > 0 ? db.select().from(testCenters).where(sql`${testCenters.id} IN ${testCenterIds}`) : []
    ])

    // Create lookup maps
    const usersMap = new Map(usersData.map(u => [u.id, u]))
    const referralsMap = new Map(referralsData.map(r => [r.id, r]))
    const testCentersMap = new Map(testCentersData.map(tc => [tc.id, tc]))

    // Format the results
    const formattedResults = results.map(r => {
      const patient = usersMap.get(r.patientId)
      const referral = referralsMap.get(r.referralId)
      const testCenter = testCentersMap.get(r.testCenterId)
      const recorder = r.recordedBy ? usersMap.get(r.recordedBy) : null

      return {
        id: r.id,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
        patientPhone: patient?.phoneNumber || 'N/A',
        referralCode: referral?.referralCode || 'N/A',
        testDate: r.testDate,
        testType: r.testType,
        result: r.result,
        testCenter: {
          name: testCenter?.name || 'Unknown',
          city: testCenter?.city || 'Unknown'
        },
        isConfirmed: r.isConfirmed,
        recordedBy: recorder ? `${recorder.firstName} ${recorder.lastName}` : 'System',
        createdAt: r.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      results: formattedResults
    })
  } catch (error: any) {
    console.error('Admin test results API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}