import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowRight, Lock, Users, BarChart3, FileText } from 'lucide-react'
import Link from 'next/link'

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BantAI Admin Portal
            </h1>
            <p className="text-xl text-gray-600">
              System administration and management dashboard
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Administrator Access</CardTitle>
              <CardDescription>
                Secure access to system management tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold mb-1">User Management</h3>
                  <p className="text-sm text-gray-600">
                    View and manage all platform users, roles, and permissions
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold mb-1">Analytics & Reports</h3>
                  <p className="text-sm text-gray-600">
                    Access comprehensive platform statistics and insights
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FileText className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Test Management</h3>
                  <p className="text-sm text-gray-600">
                    Monitor all test results and assessment data
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Lock className="h-8 w-8 text-red-600 mb-2" />
                  <h3 className="font-semibold mb-1">Secure Access</h3>
                  <p className="text-sm text-gray-600">
                    Role-based access control with audit logging
                  </p>
                </div>
              </div>

              {/* Access Button */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800 mb-4">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Admin authentication required to proceed
                </p>
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                  <Link href="/login?redirect=/admin">
                    Sign In as Administrator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Footer Links */}
              <div className="flex justify-center gap-6 pt-4 text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Back to Home
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  User Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="text-center text-sm text-gray-500">
            <p>For admin access requests, contact your system administrator</p>
            <p className="mt-1">or email support@bantai-hiv.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}