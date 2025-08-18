import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db'
import { users, riskAssessments, testResults, referrals, smsLogs } from '@/db/schema'
import { sql, gte, and, eq } from 'drizzle-orm'
import { BarChart3, TrendingUp, Users, FileText, TestTube, MessageSquare } from 'lucide-react'

async function getAnalyticsData() {
  // User growth over last 30 days
  const userGrowth = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      count: sql<number>`count(*)`
    })
    .from(users)
    .where(sql`${users.createdAt} >= CURRENT_DATE - INTERVAL '30 days'`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`)

  // Assessment trends
  const assessmentTrends = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      count: sql<number>`count(*)`,
      highRisk: sql<number>`count(*) filter (where risk_level = 'high')`,
      moderateRisk: sql<number>`count(*) filter (where risk_level = 'moderate')`,
      lowRisk: sql<number>`count(*) filter (where risk_level = 'low')`
    })
    .from(riskAssessments)
    .where(
      and(
        sql`${riskAssessments.createdAt} >= CURRENT_DATE - INTERVAL '30 days'`,
        eq(riskAssessments.status, 'completed')
      )
    )
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`)

  // Test result trends
  const testTrends = await db
    .select({
      date: sql<string>`DATE(test_date)`,
      total: sql<number>`count(*)`,
      positive: sql<number>`count(*) filter (where result = 'positive')`,
      negative: sql<number>`count(*) filter (where result = 'negative')`
    })
    .from(testResults)
    .where(sql`${testResults.testDate} >= CURRENT_DATE - INTERVAL '30 days'`)
    .groupBy(sql`DATE(test_date)`)
    .orderBy(sql`DATE(test_date)`)

  // Conversion metrics
  const conversions = await db
    .select({
      totalAssessments: sql<number>`count(distinct ${riskAssessments.userId})`,
      totalReferrals: sql<number>`count(distinct ${referrals.userId})`,
      totalTests: sql<number>`count(distinct ${testResults.userId})`
    })
    .from(riskAssessments)
    .leftJoin(referrals, eq(referrals.assessmentId, riskAssessments.id))
    .leftJoin(testResults, eq(testResults.referralId, referrals.id))
    .where(
      and(
        sql`${riskAssessments.createdAt} >= CURRENT_DATE - INTERVAL '30 days'`,
        eq(riskAssessments.status, 'completed')
      )
    )

  // SMS metrics
  const smsMetrics = await db
    .select({
      total: sql<number>`count(*)`,
      delivered: sql<number>`count(*) filter (where status = 'delivered')`,
      failed: sql<number>`count(*) filter (where status = 'failed')`
    })
    .from(smsLogs)
    .where(sql`${smsLogs.createdAt} >= CURRENT_DATE - INTERVAL '7 days'`)

  // Total active users (we don't track login times, so we'll count all active users)
  const activeUsers = await db
    .select({
      count: sql<number>`count(*)`
    })
    .from(users)
    .where(eq(users.status, 'active'))

  return {
    userGrowth,
    assessmentTrends,
    testTrends,
    conversions: conversions[0] || { totalAssessments: 0, totalReferrals: 0, totalTests: 0 },
    smsMetrics: smsMetrics[0] || { total: 0, delivered: 0, failed: 0 },
    activeUsers: activeUsers[0]?.count || 0
  }
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsData()

  // Calculate conversion rates
  const assessmentToReferral = analytics.conversions.totalAssessments > 0
    ? Math.round((analytics.conversions.totalReferrals / analytics.conversions.totalAssessments) * 100)
    : 0

  const referralToTest = analytics.conversions.totalReferrals > 0
    ? Math.round((analytics.conversions.totalTests / analytics.conversions.totalReferrals) * 100)
    : 0

  const smsDeliveryRate = analytics.smsMetrics.total > 0
    ? Math.round((analytics.smsMetrics.delivered / analytics.smsMetrics.total) * 100)
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{assessmentToReferral}%</p>
                <p className="text-xs text-gray-500">Assessment → Referral</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{referralToTest}%</p>
                <p className="text-xs text-gray-500">Referral → Test</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                <p className="text-xs text-gray-500">Total active accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">SMS Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{smsDeliveryRate}%</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.userGrowth.map((day) => (
                <div key={day.date} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${(day.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-700 w-12 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Risk Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Risk Assessment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.assessmentTrends.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {analytics.assessmentTrends.reduce((sum, day) => sum + day.highRisk, 0)}
                      </p>
                      <p className="text-xs text-gray-500">High Risk</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {analytics.assessmentTrends.reduce((sum, day) => sum + day.moderateRisk, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Moderate Risk</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.assessmentTrends.reduce((sum, day) => sum + day.lowRisk, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Low Risk</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Total assessments: {analytics.assessmentTrends.reduce((sum, day) => sum + day.count, 0)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">No assessment data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.testTrends.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.testTrends.reduce((sum, day) => sum + day.negative, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Negative</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {analytics.testTrends.reduce((sum, day) => sum + day.positive, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Positive</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Total tests: {analytics.testTrends.reduce((sum, day) => sum + day.total, 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Positivity rate: {
                        analytics.testTrends.reduce((sum, day) => sum + day.total, 0) > 0
                          ? Math.round(
                              (analytics.testTrends.reduce((sum, day) => sum + day.positive, 0) /
                               analytics.testTrends.reduce((sum, day) => sum + day.total, 0)) * 100
                            )
                          : 0
                      }%
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">No test data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SMS Performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Performance (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sent</span>
                <span className="font-semibold">{analytics.smsMetrics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="font-semibold text-green-600">{analytics.smsMetrics.delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="font-semibold text-red-600">{analytics.smsMetrics.failed}</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Estimated cost: ₱{(analytics.smsMetrics.total * 0.50).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}