import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { isAdmin } from '@/middleware/admin'
import { redirect } from 'next/navigation'

export default async function AdminAccessPage() {
  const admin = await isAdmin()
  
  if (admin) {
    redirect('/admin')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access Required</CardTitle>
          <CardDescription>
            This area is restricted to system administrators only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900">
                  Access Denied
                </p>
                <p className="text-sm text-yellow-700">
                  You do not have administrator privileges to access this area.
                  Only authorized personnel can view system administration features.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span className="font-medium">What administrators can access:</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• User management and statistics</li>
                <li>• System-wide test results and analytics</li>
                <li>• SMS logs and billing information</li>
                <li>• Platform configuration and settings</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                If you believe you should have admin access, please contact your system administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}