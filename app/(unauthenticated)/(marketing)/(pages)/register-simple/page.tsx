'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateTestOTP, verifyTestOTP } from '@/actions/otp-test'

export default function RegisterSimplePage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Generate OTP using server action
      const result = await generateTestOTP(phoneNumber)
      
      if (result.success && result.otp) {
        setGeneratedOTP(result.otp)
        setStep('otp')
        console.log(`✅ Generated OTP: ${result.otp} for ${phoneNumber}`)
      } else {
        setError(result.error || 'Failed to generate OTP')
      }
    } catch (err) {
      setError('Failed to generate OTP')
      console.error('OTP generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await verifyTestOTP(phoneNumber, otp)
      
      if (result.success) {
        setStep('success')
      } else {
        setError(result.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Verification failed')
      console.error('OTP verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('phone')
    setOtp('')
    setGeneratedOTP('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Simple OTP Test</CardTitle>
          <CardDescription>
            Direct OTP generation and verification for development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                  placeholder="09XXXXXXXXX"
                />
              </div>
              
              <Button
                onClick={handleGenerateOTP}
                disabled={loading || phoneNumber.length < 11}
                className="w-full h-12 text-lg"
              >
                {loading ? 'Generating...' : 'Generate OTP'}
              </Button>
            </>
          )}
          
          {step === 'otp' && (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
                <p className="text-sm opacity-90 mb-2">Your OTP Code:</p>
                <p className="text-5xl font-mono font-bold tracking-[0.4em]">
                  {generatedOTP}
                </p>
                <p className="text-xs opacity-75 mt-3">Phone: {phoneNumber}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.3em] font-mono h-14"
                  maxLength={6}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setOtp(generatedOTP)}
                  variant="outline"
                  className="h-12"
                >
                  Copy Code
                </Button>
                
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="h-12"
                >
                  {loading ? 'Checking...' : 'Verify'}
                </Button>
              </div>
              
              <button
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-700 w-full"
              >
                ← Back to start
              </button>
            </>
          )}
          
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Success!</h3>
                <p className="text-gray-600 mt-2">
                  OTP verified successfully for {phoneNumber}
                </p>
              </div>
              
              <Button onClick={reset} variant="outline" className="w-full">
                Test Another Number
              </Button>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}