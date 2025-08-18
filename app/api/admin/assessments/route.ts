import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { riskAssessments, riskResponses, riskQuestions, users } from '@/db/schema'
import { eq, desc, sql, count, and, gte, lte } from 'drizzle-orm'
import { isAdmin } from '@/middleware/admin'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const riskLevel = searchParams.get('riskLevel')
    const method = searchParams.get('method')
    const dateRange = searchParams.get('dateRange')

    // Build where conditions
    const conditions = []
    
    if (status && status !== 'all') {
      conditions.push(eq(riskAssessments.status, status as any))
    }
    
    if (riskLevel && riskLevel !== 'all') {
      conditions.push(eq(riskAssessments.riskLevel, riskLevel as any))
    }
    
    if (method && method !== 'all') {
      conditions.push(eq(riskAssessments.deliveryMethod, method))
    }
    
    // Date range filtering
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate: Date
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0) // All time
      }
      
      conditions.push(gte(riskAssessments.createdAt, startDate))
    }

    // Get total questions count
    const questionsCount = await db
      .select({ count: count() })
      .from(riskQuestions)
      .where(eq(riskQuestions.isActive, true))

    const totalQuestions = questionsCount[0]?.count || 0

    // Fetch assessments with user data and response counts
    const assessmentsQuery = db
      .select({
        id: riskAssessments.id,
        userId: riskAssessments.userId,
        userName: users.name,
        userPhone: users.phoneNumber,
        assessmentCode: riskAssessments.assessmentCode,
        status: riskAssessments.status,
        deliveryMethod: riskAssessments.deliveryMethod,
        startedAt: riskAssessments.startedAt,
        completedAt: riskAssessments.completedAt,
        expiresAt: riskAssessments.expiresAt,
        totalScore: riskAssessments.totalScore,
        riskLevel: riskAssessments.riskLevel,
        createdAt: riskAssessments.createdAt,
        responsesCount: sql<number>`count(distinct ${riskResponses.id})::int`
      })
      .from(riskAssessments)
      .leftJoin(users, eq(riskAssessments.userId, users.id))
      .leftJoin(riskResponses, eq(riskAssessments.id, riskResponses.assessmentId))
      .groupBy(
        riskAssessments.id,
        users.name,
        users.phoneNumber
      )
      .orderBy(desc(riskAssessments.createdAt))

    // Apply conditions if any
    if (conditions.length > 0) {
      assessmentsQuery.where(and(...conditions))
    }

    const assessmentsList = await assessmentsQuery

    // Format the results with questions count
    const formattedAssessments = assessmentsList.map(assessment => ({
      ...assessment,
      questionsCount: totalQuestions
    }))

    return NextResponse.json({
      success: true,
      assessments: formattedAssessments
    })

  } catch (error) {
    console.error('Admin assessments API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}