'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key
} from 'lucide-react'

interface UserData {
  id: string
  clerkId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  membership: string
  verificationStatus: string
  createdAt: string
  lastLoginAt: string | null
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData()
    }
  }, [isLoaded, user])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      } else {
        setError('Failed to load profile data')
      }
    } catch (err) {
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-0">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case 'health_worker':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0">
            <Shield className="h-3 w-3 mr-1" />
            Health Worker
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0">
            <User className="h-3 w-3 mr-1" />
            User
          </Badge>
        )
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        )
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {/* Clerk User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Clerk User ID</p>
              <p className="font-mono text-sm">{user?.id || 'Not authenticated'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Email</p>
              <p className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'No email'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Phone</p>
              <p className="font-medium">{user?.primaryPhoneNumber?.phoneNumber || 'No phone'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database User Info */}
      {userData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  {getRoleBadge(userData.role)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verification</p>
                  {getVerificationBadge(userData.verificationStatus)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Membership</p>
                  <Badge variant="outline">{userData.membership}</Badge>
                </div>
              </div>

              {/* User Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {userData.firstName} {userData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {userData.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {userData.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Database IDs */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">System Information</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Database ID:</span>
                    <span className="font-mono ml-2">{userData.id.slice(0, 8)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clerk ID:</span>
                    <span className="font-mono ml-2">{userData.clerkId}</span>
                  </div>
                </div>
              </div>

              {/* Admin Access Notice */}
              {userData.role === 'admin' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Shield className="h-5 w-5" />
                    <p className="font-medium">You have admin access</p>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    You can access the admin panel to manage users, view reports, and configure system settings.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.href = '/admin'}
                  >
                    Go to Admin Panel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!userData && !loading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">No profile data found in database</p>
              <p className="text-sm text-gray-500 mt-2">
                Your Clerk authentication is working, but your user profile may not be synced with the database.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}