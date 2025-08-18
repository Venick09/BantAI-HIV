import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/middleware/admin'
import { db } from '@/db'
import { users, riskAssessments, testResults } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users first
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.createdAt)

    // Add stats manually to avoid SQL issues
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        // Get assessment count
        const assessments = await db
          .select({ count: sql<number>`count(*)` })
          .from(riskAssessments)
          .where(eq(riskAssessments.userId, user.id))
        
        // Get test count
        const tests = await db
          .select({ count: sql<number>`count(*)` })
          .from(testResults)
          .where(eq(testResults.userId, user.id))

        return {
          id: user.id,
          clerkId: user.clerkId,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: user.role || 'user',
          membership: user.membership || 'free',
          verificationStatus: user.verificationStatus || 'unverified',
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          assessmentCount: Number(assessments[0]?.count || 0),
          testCount: Number(tests[0]?.count || 0)
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithStats
    })
  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}