'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterDevPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('09999986806')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Clear any existing OTPs first
      await fetch('/api/dev/clear-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })
      
      // Send OTP using the normal registration flow
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          purpose: 'registration'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // For development, also get the OTP to display
        const otpResponse = await fetch('/api/test-otp-display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        })
        const otpData = await otpResponse.json()
        
        if (otpData.success) {
          setGeneratedOTP(otpData.otp)
          setStep('otp')
        }
      } else {
        setError(data.error || 'Failed to send OTP')
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
    
    try {
      const response = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otp,
          purpose: 'registration'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStep('success')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep('phone')
    setOtp('')
    setGeneratedOTP('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Development Registration Test</CardTitle>
          <CardDescription>
            Complete OTP flow with visible codes for testing
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
                  className="mt-1 text-lg"
                  placeholder="09XXXXXXXXX"
                />
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length < 11}
                className="w-full"
                size="lg"
              >
                {loading ? 'Sending OTP...' : 'Send OTP Code'}
              </Button>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">Test Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This clears any existing OTPs before sending</li>
                  <li>OTP will be displayed after sending</li>
                  <li>No real SMS is sent in development</li>
                </ul>
              </div>
            </>
          )}
          
          {step === 'otp' && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Your OTP Code is:</p>
                <p className="text-4xl font-mono font-bold text-green-700 tracking-[0.5em]">
                  {generatedOTP}
                </p>
                <p className="text-xs text-gray-500 mt-3">Valid for 10 minutes</p>
              </div>
              
              <div>
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 text-center text-2xl tracking-[0.3em] font-mono"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setOtp(generatedOTP)}
                  variant="outline"
                  className="flex-1"
                >
                  Auto-fill
                </Button>
                
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
              
              <button
                onClick={resetFlow}
                className="text-sm text-gray-500 hover:text-gray-700 w-full text-center"
              >
                Start over with different number
              </button>
            </>
          )}
          
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                OTP Verified Successfully!
              </h3>
              <p className="text-gray-600">
                The OTP was correctly verified. In a real registration flow, you would now proceed to create your account.
              </p>
              <Button onClick={resetFlow} className="w-full">
                Test Again
              </Button>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}