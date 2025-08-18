'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db'
import { users } from '@/db/schema'

export default function ManualSyncPage() {
  const { user } = useUser()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleManualSync = async () => {
    if (!user || !phoneNumber) return

    setLoading(true)
    setError('')

    try {
      // Create user in database manually
      const response = await fetch('/api/manual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          phoneNumber,
          firstName: user.firstName || 'User',
          lastName: user.lastName || '',
          email: user.emailAddresses?.[0]?.emailAddress
        })
      })

      const result = await response.json()

      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to sync user')
      }
    } catch (err) {
      setError('Failed to sync user')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            We need your phone number to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Your account ({user.emailAddresses?.[0]?.emailAddress}) needs to be linked to a phone number for SMS services.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09171234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Philippine mobile number
              </p>
            </div>

            <Button
              onClick={handleManualSync}
              disabled={loading || phoneNumber.length < 11}
              className="w-full"
            >
              {loading ? 'Syncing...' : 'Complete Setup'}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}