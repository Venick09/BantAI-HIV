'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendRegistrationOTP, verifyRegistrationOTP } from '@/actions/users'

export default function RegisterTestPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('09999986806')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')

  const clearOTPs = async () => {
    try {
      await fetch('/api/dev/clear-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })
      console.log('✅ Cleared OTPs for', phoneNumber)
    } catch (err) {
      console.error('Failed to clear OTPs:', err)
    }
  }

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Clear any existing OTPs first
      await clearOTPs()
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // First, generate OTP through normal flow
      const result = await sendRegistrationOTP(phoneNumber)
      
      if (result.success) {
        // Also fetch the OTP for display (this creates another OTP but we'll use it for display)
        const response = await fetch('/api/test-otp-display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        })
        const data = await response.json()
        
        if (data.success) {
          setGeneratedOTP(data.otp)
          setStep('otp')
        } else {
          setError('Failed to generate OTP for display')
        }
      } else {
        setError(result.error || 'Failed to send OTP')
        // If rate limited, clear and retry
        if (result.error?.includes('wait')) {
          await clearOTPs()
          setError('Rate limit cleared. Please try again.')
        }
      }
    } catch (err) {
      console.error('Send OTP error:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await verifyRegistrationOTP(phoneNumber, otp)
      
      if (result.success) {
        alert('✅ OTP Verified Successfully! In real registration, you would proceed to create account.')
        // In real app: router.push('/register?verified=true')
      } else {
        setError(result.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registration Test (Development)</CardTitle>
          <CardDescription>
            Test the complete OTP flow with visible codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'phone' && (
            <>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length < 11}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          )}
          
          {step === 'otp' && (
            <>
              {generatedOTP && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your OTP Code:</p>
                  <p className="text-3xl font-bold text-green-700 tracking-wider">
                    {generatedOTP}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Copy this code</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 text-center text-2xl tracking-wider"
                  maxLength={6}
                />
              </div>
              
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <div className="text-center space-y-2">
                <button
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setGeneratedOTP('')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to phone number
                </button>
                
                {generatedOTP && (
                  <button
                    onClick={() => setOtp(generatedOTP)}
                    className="block mx-auto text-sm text-green-600 hover:text-green-500 font-medium"
                  >
                    Auto-fill OTP
                  </button>
                )}
              </div>
            </>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• This is a development test page</p>
            <p>• OTP is shown for testing purposes</p>
            <p>• Check console for debug logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}