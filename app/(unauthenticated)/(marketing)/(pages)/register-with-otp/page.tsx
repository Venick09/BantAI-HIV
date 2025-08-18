'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendRegistrationOTP, verifyRegistrationOTP, createUser } from '@/actions/users'

export default function RegisterWithOTPDisplay() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'verify' | 'details' | 'success'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('09999986806')
  const [otp, setOtp] = useState('')
  const [displayedOTP, setDisplayedOTP] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await sendRegistrationOTP(phoneNumber)
      
      if (result.success) {
        // In development, try to get the actual OTP
        if (process.env.NODE_ENV !== 'production') {
          // Fetch the OTP from the display endpoint
          const response = await fetch('/api/test-otp-display', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, getActualOTP: true })
          })
          const data = await response.json()
          if (data.success && data.otp) {
            setDisplayedOTP(data.otp)
          }
        }
        setStep('verify')
      } else {
        setError(result.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    
    const result = await verifyRegistrationOTP(phoneNumber, otp)
    
    if (result.success) {
      setStep('details')
    } else {
      setError(result.error || 'Invalid OTP')
    }
    
    setLoading(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    
    const result = await createUser({
      phoneNumber,
      firstName,
      lastName,
      role: 'patient'
    }, true)
    
    if (result.success) {
      setStep('success')
      setTimeout(() => router.push('/login'), 3000)
    } else {
      setError(result.error || 'Failed to create account')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register with OTP Display</CardTitle>
          <CardDescription>
            Development mode: OTP will be shown on screen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09171234567"
                />
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length < 11}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              {displayedOTP && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your OTP Code is:</p>
                  <p className="text-3xl font-bold text-green-700 tracking-wider">
                    {displayedOTP}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Valid for 10 minutes</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-wider"
                  maxLength={6}
                />
              </div>
              
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                Resend Code
              </Button>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              
              <Button
                onClick={handleComplete}
                disabled={loading || !firstName || !lastName}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Complete Registration'}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Success!</h3>
              <p className="text-sm text-gray-600">Redirecting to login...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}