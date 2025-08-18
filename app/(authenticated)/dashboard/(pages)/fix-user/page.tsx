'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { getUserByClerkId, syncClerkUserToDatabase } from '@/actions/users'
import { createCustomer } from '@/actions/customers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function FixUserPage() {
  const { user } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'missing' | 'fixed' | 'error'>('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    checkAndFixUser()
  }, [user])

  const checkAndFixUser = async () => {
    if (!user) return

    try {
      // Check if user exists in database
      const dbUser = await getUserByClerkId(user.id)
      
      if (dbUser) {
        setStatus('fixed')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setStatus('missing')
      }
    } catch (err) {
      setError('Failed to check user')
      setStatus('error')
    }
  }

  const handleCreateUser = async () => {
    if (!user) return

    try {
      // Sync Clerk user to database
      const result = await syncClerkUserToDatabase(user.id)

      if (result.success) {
        // Also create customer record
        await createCustomer(user.id)
        
        setStatus('fixed')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setError(result.error || 'Failed to sync user')
        setStatus('error')
      }
    } catch (err) {
      setError('Failed to sync user')
      setStatus('error')
    }
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Setup</CardTitle>
          <CardDescription>
            Setting up your account for the risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'checking' && (
            <p className="text-center">Checking your account...</p>
          )}
          
          {status === 'missing' && (
            <div className="space-y-4">
              <p>Your account needs to be set up for the risk assessment.</p>
              <Button onClick={handleCreateUser} className="w-full">
                Complete Setup
              </Button>
            </div>
          )}
          
          {status === 'fixed' && (
            <div className="text-center space-y-2">
              <p className="text-green-600">✓ Account ready!</p>
              <p className="text-sm text-gray-600">Redirecting...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-600">Error: {error}</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}