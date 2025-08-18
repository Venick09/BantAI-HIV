import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Phone, User, FileText } from 'lucide-react'
import { db } from '@/db'
import { users, testCenters, referrals, testResults } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

async function getReferralData() {
  // Get all referrals with user and test center info
  const allReferrals = await db
    .select({
      id: referrals.id,
      userId: referrals.userId,
      testCenterId: referrals.testCenterId,
      referralCode: referrals.referralCode,
      status: referrals.status,
      expiresAt: referrals.expiresAt,
      createdAt: referrals.createdAt,
      userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      userPhone: users.phoneNumber,
      userEmail: users.email,
      testCenterName: testCenters.name,
      testCenterAddress: testCenters.address,
      testCenterCity: testCenters.city
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.userId, users.id))
    .leftJoin(testCenters, eq(referrals.testCenterId, testCenters.id))
    .orderBy(desc(referrals.createdAt))
    .limit(100)

  // Get stats
  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where status = 'pending')`,
      sent: sql<number>`count(*) filter (where status = 'sent')`,
      tested: sql<number>`count(*) filter (where status = 'tested')`,
      scheduled: sql<number>`count(*) filter (where status = 'scheduled')`
    })
    .from(referrals)

  // Get test completion stats
  const testStats = await db
    .select({
      completed: sql<number>`count(*) filter (where is_confirmed = true)`
    })
    .from(testResults)

  return {
    referrals: allReferrals,
    stats: stats[0] || { total: 0, pending: 0, sent: 0, tested: 0, scheduled: 0 },
    completedTests: testStats[0]?.completed || 0
  }
}

export default async function AdminAppointmentsPage() {
  const { referrals, stats, completedTests } = await getReferralData()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending Visit</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-700 border-0">SMS Sent</Badge>
      case 'tested':
        return <Badge className="bg-green-100 text-green-700 border-0">Test Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700 border-0">Scheduled</Badge>
      case 'received':
        return <Badge className="bg-indigo-100 text-indigo-700 border-0">Received</Badge>
      case 'no_show':
        return <Badge className="bg-gray-100 text-gray-700 border-0">No Show</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-0">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiryDate: string | Date | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Test Referral Management</h1>
        <p className="text-gray-600 mt-1">Track and manage HIV test referrals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTests}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Test Referrals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No referrals found</p>
            </div>
          ) : (
            <div className="divide-y">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Patient Info */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{referral.userName || 'Unknown'}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {referral.userPhone || 'No phone'}
                            </span>
                            {referral.userEmail && (
                              <span>{referral.userEmail}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Referral Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Referral Code:</span>
                          <p className="font-mono font-medium">{referral.referralCode}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Test Center:</span>
                          <p className="font-medium">{referral.testCenterName || 'Not assigned'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expires:</span>
                          <p className={`font-medium ${isExpired(referral.expiresAt) ? 'text-red-600' : ''}`}>
                            {formatDate(referral.expiresAt)}
                            {isExpired(referral.expiresAt) && ' (Expired)'}
                          </p>
                        </div>
                      </div>

                      {/* Test Center Location */}
                      {referral.testCenterAddress && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{referral.testCenterAddress}, {referral.testCenterCity}</span>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(referral.status)}
                      <p className="text-xs text-gray-500">
                        Created {formatDate(referral.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}