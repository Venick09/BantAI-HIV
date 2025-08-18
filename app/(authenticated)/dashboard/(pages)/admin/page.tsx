'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Search,
  Download,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface FunnelStats {
  registered: number
  assessed: number
  tested: number
  positive: number
  onART: number
  suppressed: number
}

interface DashboardStats {
  totalPatients: number
  activePatients: number
  newThisMonth: number
  testingRate: number
  artCoverage: number
  suppressionRate: number
  monthlyRevenue: number
  outstandingBilling: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 1234,
    activePatients: 987,
    newThisMonth: 156,
    testingRate: 78.5,
    artCoverage: 92.3,
    suppressionRate: 89.7,
    monthlyRevenue: 125650,
    outstandingBilling: 45200
  })

  const [funnelStats] = useState<FunnelStats>({
    registered: 1234,
    assessed: 1089,
    tested: 845,
    positive: 76,
    onART: 69,
    suppressed: 62
  })

  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const calculateConversionRate = (current: number, total: number) => {
    return total > 0 ? Math.round((current / total) * 100) : 0
  }

  const handleExportReport = () => {
    console.log('Exporting report...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            BantAI HIV Prevention System Overview
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testing Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testingRate}%</div>
            <Progress value={stats.testingRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ART Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artCoverage}%</div>
            <Progress value={stats.artCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ₱{stats.outstandingBilling.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HIV Care Cascade Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>HIV Care Cascade</CardTitle>
          <CardDescription>
            Patient progression through the prevention and treatment funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Funnel Visualization */}
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Registered Users</p>
                        <p className="text-2xl font-bold text-blue-900">{funnelStats.registered}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="relative ml-8">
                <div className="flex items-center gap-2">
                  <div className="w-11/12 bg-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Risk Assessed</p>
                        <p className="text-2xl font-bold text-purple-900">{funnelStats.assessed}</p>
                        <p className="text-xs text-purple-700">
                          {calculateConversionRate(funnelStats.assessed, funnelStats.registered)}% of registered
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="relative ml-16">
                <div className="flex items-center gap-2">
                  <div className="w-10/12 bg-orange-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">HIV Tested</p>
                        <p className="text-2xl font-bold text-orange-900">{funnelStats.tested}</p>
                        <p className="text-xs text-orange-700">
                          {calculateConversionRate(funnelStats.tested, funnelStats.assessed)}% of assessed
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="relative ml-24">
                <div className="flex items-center gap-2">
                  <div className="w-9/12 bg-red-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-900">HIV Positive</p>
                        <p className="text-2xl font-bold text-red-900">{funnelStats.positive}</p>
                        <p className="text-xs text-red-700">
                          {calculateConversionRate(funnelStats.positive, funnelStats.tested)}% positivity rate
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="relative ml-32">
                <div className="flex items-center gap-2">
                  <div className="w-8/12 bg-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">On ART</p>
                        <p className="text-2xl font-bold text-green-900">{funnelStats.onART}</p>
                        <p className="text-xs text-green-700">
                          {calculateConversionRate(funnelStats.onART, funnelStats.positive)}% linked to care
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="relative ml-40">
                <div className="w-7/12 bg-emerald-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Virally Suppressed</p>
                      <p className="text-2xl font-bold text-emerald-900">{funnelStats.suppressed}</p>
                      <p className="text-xs text-emerald-700">
                        {calculateConversionRate(funnelStats.suppressed, funnelStats.onART)}% suppression rate
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall Testing Rate</p>
                <p className="text-2xl font-bold">
                  {calculateConversionRate(funnelStats.tested, funnelStats.registered)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Treatment Coverage</p>
                <p className="text-2xl font-bold">
                  {calculateConversionRate(funnelStats.onART, funnelStats.positive)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">95-95-95 Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round((stats.testingRate + stats.artCoverage + stats.suppressionRate) / 3)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Patient Search
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Billing Management
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              System Configuration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">5 patients defaulted this week</p>
                <p className="text-xs text-muted-foreground">Requires follow-up action</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly reports generated</p>
                <p className="text-xs text-muted-foreground">Ready for DOH submission</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Low SMS credits</p>
                <p className="text-xs text-muted-foreground">1,250 messages remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}