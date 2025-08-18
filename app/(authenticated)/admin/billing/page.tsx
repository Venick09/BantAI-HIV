import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar,
  Package,
  AlertCircle,
  FileText,
  CheckCircle
} from 'lucide-react'
import { db } from '@/db'
import { billingEvents, billingPeriods, users } from '@/db/schema'
import { desc, eq, sql, gte, and } from 'drizzle-orm'

async function getBillingData() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get billing periods with stats
  const periods = await db
    .select({
      id: billingPeriods.id,
      periodName: billingPeriods.periodName,
      startDate: billingPeriods.startDate,
      endDate: billingPeriods.endDate,
      status: billingPeriods.status,
      totalAmount: billingPeriods.totalAmount,
      totalPatients: billingPeriods.totalPatients,
      generatedAt: billingPeriods.generatedAt,
      approvedAt: billingPeriods.approvedAt,
      paidAt: billingPeriods.paidAt,
      paymentReference: billingPeriods.paymentReference,
      notes: billingPeriods.notes
    })
    .from(billingPeriods)
    .orderBy(desc(billingPeriods.startDate))
    .limit(12)

  // Get recent billing events
  const events = await db
    .select({
      id: billingEvents.id,
      userId: billingEvents.userId,
      eventType: billingEvents.eventType,
      eventDate: billingEvents.eventDate,
      amount: billingEvents.amount,
      description: billingEvents.description,
      isProcessed: billingEvents.isProcessed,
      processedAt: billingEvents.processedAt,
      userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      userEmail: users.email,
      userPhone: users.phoneNumber
    })
    .from(billingEvents)
    .leftJoin(users, eq(billingEvents.userId, users.id))
    .orderBy(desc(billingEvents.eventDate))
    .limit(100)

  // Get billing stats
  const stats = await db
    .select({
      totalRevenue: sql<number>`sum(total_amount) filter (where status = 'paid')`,
      pendingRevenue: sql<number>`sum(total_amount) filter (where status = 'pending')`,
      approvedRevenue: sql<number>`sum(total_amount) filter (where status = 'approved')`,
      totalPeriods: sql<number>`count(*)`,
      paidPeriods: sql<number>`count(*) filter (where status = 'paid')`
    })
    .from(billingPeriods)

  // Get event stats
  const eventStats = await db
    .select({
      totalEvents: sql<number>`count(*)`,
      processedEvents: sql<number>`count(*) filter (where is_processed = true)`,
      pendingEvents: sql<number>`count(*) filter (where is_processed = false)`,
      totalEventRevenue: sql<number>`sum(amount)`,
      questionnaires: sql<number>`count(*) filter (where event_type = 'questionnaire_delivered')`,
      testResults: sql<number>`count(*) filter (where event_type = 'test_result_logged')`,
      artStarted: sql<number>`count(*) filter (where event_type = 'art_started')`
    })
    .from(billingEvents)

  return {
    periods,
    events,
    periodStats: stats[0] || {
      totalRevenue: 0,
      pendingRevenue: 0,
      approvedRevenue: 0,
      totalPeriods: 0,
      paidPeriods: 0
    },
    eventStats: eventStats[0] || {
      totalEvents: 0,
      processedEvents: 0,
      pendingEvents: 0,
      totalEventRevenue: 0,
      questionnaires: 0,
      testResults: 0,
      artStarted: 0
    }
  }
}

export default async function AdminBillingPage() {
  const { periods, events, periodStats, eventStats } = await getBillingData()

  const formatCurrency = (amount: number | string | null) => {
    if (!amount) return '₱0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(num)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>
      case 'disputed':
        return <Badge className="bg-red-100 text-red-700 border-0">Disputed</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700 border-0">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'questionnaire_delivered':
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Questionnaire</Badge>
      case 'test_result_logged':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Test Result</Badge>
      case 'art_started':
        return <Badge variant="outline" className="text-green-600 border-green-200">ART Started</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
        <p className="text-gray-600 mt-1">Track healthcare facility billing and revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(periodStats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From paid periods</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(periodStats.approvedRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(periodStats.pendingRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Needs approval</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Billing Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.totalPeriods}</div>
            <p className="text-xs text-gray-500 mt-1">
              {periodStats.paidPeriods} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold mt-1">{eventStats.totalEvents}</p>
                <p className="text-xs text-gray-500">{eventStats.processedEvents} processed</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questionnaires</p>
                <p className="text-2xl font-bold mt-1">{eventStats.questionnaires}</p>
                <p className="text-xs text-gray-500">Delivered</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Results</p>
                <p className="text-2xl font-bold mt-1">{eventStats.testResults}</p>
                <p className="text-xs text-gray-500">Logged</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ART Started</p>
                <p className="text-2xl font-bold mt-1">{eventStats.artStarted}</p>
                <p className="text-xs text-gray-500">Patients</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Periods Table */}
      <Card className="border-0 shadow-sm mb-8">
        <CardHeader>
          <CardTitle>Billing Periods</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {periods.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No billing periods found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {periods.map((period) => (
                    <tr key={period.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {period.periodName}
                        </p>
                        {period.generatedAt && (
                          <p className="text-xs text-gray-500">
                            Generated: {formatDate(period.generatedAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(period.totalAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {period.totalPatients || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(period.status)}
                      </td>
                      <td className="px-6 py-4">
                        {period.paidAt ? (
                          <div>
                            <p className="text-xs text-gray-600">
                              Paid: {formatDate(period.paidAt)}
                            </p>
                            {period.paymentReference && (
                              <p className="text-xs font-mono text-gray-500">
                                Ref: {period.paymentReference}
                              </p>
                            )}
                          </div>
                        ) : period.approvedAt ? (
                          <p className="text-xs text-gray-600">
                            Approved: {formatDate(period.approvedAt)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">-</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Billing Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No billing events found</p>
            </div>
          ) : (
            <div className="divide-y">
              {events.slice(0, 20).map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900">
                          {event.userName || 'Unknown'}
                        </p>
                        {getEventTypeBadge(event.eventType)}
                        {event.isProcessed ? (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Processed</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(event.eventDate)} • {event.userPhone || event.userEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(event.amount)}
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