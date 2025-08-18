import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Heart, MapPin, Phone, ShieldCheck, Activity, Calendar, FileText, Users, Shield } from "lucide-react"
import { getDashboardData } from "@/actions/dashboard"
import { isAdmin } from "@/middleware/admin"

export default async function DashboardPage() {
  const response = await getDashboardData()
  const userIsAdmin = await isAdmin()
  
  if (!response.success || !response.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    )
  }

  const { user, assessment, testing, privacy } = response.data

  const getAssessmentBadge = () => {
    switch (assessment.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>
      case 'due':
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">Due for Update</Badge>
      default:
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Not Started</Badge>
    }
  }

  const getTestBadge = () => {
    switch (testing.status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-0">Result Available</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending Confirmation</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-200">No Records</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.firstName}! 👋</h1>
          <p className="text-gray-600 mt-1">Your health matters. Take the first step today.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Main Actions - Simplified Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Risk Assessment Card */}
          <Link href="/dashboard/risk-assessment" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-red-400 to-pink-400"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg inline-block">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Take Risk Assessment</h3>
                      <p className="text-gray-600 mt-1">5-minute confidential questionnaire</p>
                    </div>
                  </div>
                  {assessment.status === 'not_started' && (
                  <Badge className="bg-red-100 text-red-700 border-0">Recommended</Badge>
                )}
                {assessment.status === 'due' && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">Due</Badge>
                )}
                {assessment.status === 'completed' && assessment.latestRiskLevel === 'high' && (
                  <Badge className="bg-orange-100 text-orange-700 border-0">High Risk</Badge>
                )}
                </div>
                <Button className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white" size="lg">
                  Start Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Find Testing Card */}
          <Link href="/dashboard/test-centers" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg inline-block">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Find Test Centers</h3>
                    <p className="text-gray-600 mt-1">Free HIV testing locations near you</p>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" size="lg">
                  View Locations
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Status Summary - Clean Design */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-medium">Your Health Journey</CardTitle>
              </div>
              <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:text-blue-700">
                View Profile →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Risk Assessment</p>
                    <p className="text-sm text-gray-500">
                      {assessment.status === 'completed' 
                        ? `${assessment.latestRiskLevel?.charAt(0).toUpperCase()}${assessment.latestRiskLevel?.slice(1)} risk`
                        : assessment.status === 'due'
                        ? 'Time for a new assessment'
                        : 'Complete your first assessment'
                      }
                    </p>
                  </div>
                </div>
                {getAssessmentBadge()}
              </div>

              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Last Test</p>
                    <p className="text-sm text-gray-500">
                      {testing.lastTestDate 
                        ? new Date(testing.lastTestDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'No test records found'
                      }
                    </p>
                  </div>
                </div>
                {testing.pendingReferrals > 0 ? (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    {testing.pendingReferrals} Pending
                  </Badge>
                ) : (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/test-centers">Schedule</Link>
                  </Button>
                )}
              </div>

              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Privacy Status</p>
                    <p className="text-sm text-gray-500">Your data is protected</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  Secured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links - Simplified */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="tel:1800HIVHELP" className="group">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">24/7 Hotline</p>
                  <p className="text-sm text-gray-600">1-800-HIV-HELP</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/resources" className="group">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Resources</p>
                  <p className="text-sm text-gray-600">Learn more</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/community" className="group">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Support Groups</p>
                  <p className="text-sm text-gray-600">Connect safely</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Privacy Notice - Simplified */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex gap-4">
            <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900">Your privacy is our priority</p>
              <p className="text-sm text-blue-800">
                All information is encrypted and protected by law. No one can access your data without your permission.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Access - Only visible to admins */}
        {userIsAdmin && (
          <div className="mt-8 pt-8 border-t">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Shield className="h-4 w-4" />
              <span>Access Admin Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}