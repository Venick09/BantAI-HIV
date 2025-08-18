'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, QrCode, FileText, Activity } from 'lucide-react'
import Link from 'next/link'
import { getTestCenterStats, getRecentActivities } from '@/actions/test-center'

interface Stats {
  todayTests: number
  pendingResults: number
  positiveCases: number
  todayReferrals: number
}

interface Activity {
  referralCode: string
  eventType: string
  createdAt: Date
  result?: string | null
}

export default function TestCenterPage() {
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const [statsData, activitiesData] = await Promise.all([
      getTestCenterStats(),
      getRecentActivities(5)
    ])
    
    if (statsData) {
      setStats(statsData)
    }
    setActivities(activitiesData)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode) return
    
    setLoading(true)
    // Navigate to the referral details page
    window.location.href = `/dashboard/test-center/referral/${referralCode.toUpperCase()}`
  }

  const getActivityDescription = (activity: Activity) => {
    switch (activity.eventType) {
      case 'tested':
        return activity.result ? `Test Result: ${activity.result.toUpperCase()}` : 'Test Completed'
      case 'referred':
        return 'New Referral'
      case 'expired':
        return 'Referral Expired'
      default:
        return activity.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getActivityIcon = (activity: Activity) => {
    if (activity.eventType === 'tested') {
      if (activity.result === 'positive') return 'text-red-600">!'
      if (activity.result === 'negative') return 'text-green-600">✓'
      return 'text-yellow-600">⏳'
    }
    if (activity.eventType === 'referred') return 'text-blue-600">→'
    if (activity.eventType === 'expired') return 'text-gray-600">×'
    return 'text-gray-600">•'
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayTests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tests conducted today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingResults || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.positiveCases || 0}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals Today</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Walk-ins expected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Lookup</CardTitle>
          <CardDescription>
            Enter a referral code or scan QR code to view patient information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="referral-code" className="sr-only">
                  Referral Code
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="referral-code"
                    placeholder="Enter referral code (e.g., REF123ABC)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="pl-10 uppercase"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading || !referralCode}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button type="button" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/test-center/schedule">
              <Button variant="outline" className="w-full justify-start">
                View Today's Schedule
              </Button>
            </Link>
            <Link href="/dashboard/test-center/pending">
              <Button variant="outline" className="w-full justify-start">
                Pending Test Results
              </Button>
            </Link>
            <Link href="/dashboard/test-center/reports">
              <Button variant="outline" className="w-full justify-start">
                Generate Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">
                        {activity.referralCode} - {getActivityDescription(activity)}
                      </p>
                      <p className="text-muted-foreground">
                        {getTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                    <span className={getActivityIcon(activity)}></span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}