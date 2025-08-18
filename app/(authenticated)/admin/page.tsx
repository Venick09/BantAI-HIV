import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  TestTube, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { db } from '@/db'
import { users, riskAssessments, testResults, referrals } from '@/db/schema'
import { sql, eq, gte, and } from 'drizzle-orm'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  // Get total users
  const totalUsers = await db.select({ count: sql<number>`count(*)` })
    .from(users)

  // Get users registered today
  const todayUsers = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, today))

  // Get total assessments
  const totalAssessments = await db.select({ count: sql<number>`count(*)` })
    .from(riskAssessments)
    .where(eq(riskAssessments.status, 'completed'))

  // Get assessments this month
  const monthAssessments = await db.select({ count: sql<number>`count(*)` })
    .from(riskAssessments)
    .where(
      and(
        eq(riskAssessments.status, 'completed'),
        gte(riskAssessments.createdAt, thisMonth)
      )
    )

  // Get test results stats
  const testStats = await db.select({
    total: sql<number>`count(*)`,
    positive: sql<number>`count(*) filter (where result = 'positive')`,
    negative: sql<number>`count(*) filter (where result = 'negative')`,
    pending: sql<number>`count(*) filter (where is_confirmed = false)`
  })
    .from(testResults)

  // Get pending referrals
  const pendingReferrals = await db.select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(eq(referrals.status, 'pending'))

  // Get risk distribution
  const riskDistribution = await db.select({
    riskLevel: riskAssessments.riskLevel,
    count: sql<number>`count(*)`
  })
    .from(riskAssessments)
    .where(eq(riskAssessments.status, 'completed'))
    .groupBy(riskAssessments.riskLevel)

  return {
    totalUsers: totalUsers[0]?.count || 0,
    todayUsers: todayUsers[0]?.count || 0,
    totalAssessments: totalAssessments[0]?.count || 0,
    monthAssessments: monthAssessments[0]?.count || 0,
    testStats: testStats[0] || { total: 0, positive: 0, negative: 0, pending: 0 },
    pendingReferrals: pendingReferrals[0]?.count || 0,
    riskDistribution
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              +{stats.todayUsers} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.monthAssessments} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
            <TestTube className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testStats.total}</div>
            <div className="flex gap-2 mt-1">
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                {stats.testStats.negative} Negative
              </Badge>
              <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                {stats.testStats.positive} Positive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting test results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card className="border-0 shadow-sm mb-8">
        <CardHeader>
          <CardTitle>Risk Assessment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.riskDistribution.map((item) => {
              const percentage = stats.totalAssessments > 0 
                ? Math.round((item.count / stats.totalAssessments) * 100)
                : 0
              
              return (
                <div key={item.riskLevel} className="flex items-center gap-4">
                  <div className="w-24">
                    <Badge className={`${getRiskColor(item.riskLevel)} border-0 w-full justify-center`}>
                      {item.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.riskLevel === 'high' ? 'bg-red-500' :
                          item.riskLevel === 'moderate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/users" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Manage Users</p>
            </a>
            <a href="/admin/test-results" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TestTube className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">View Tests</p>
            </a>
            <a href="/admin/analytics" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Analytics</p>
            </a>
            <a href="/dashboard/admin/sms-test" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm font-medium">Test SMS</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}