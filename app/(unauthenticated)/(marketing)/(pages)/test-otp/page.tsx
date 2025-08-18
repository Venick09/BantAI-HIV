'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const sendOTP = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          purpose: 'registration'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('OTP sent successfully! Check your SMS.')
        setStep('verify')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    setLoading(true)
    setMessage('')
    
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
      
      if (response.ok) {
        setMessage('✅ OTP verified successfully!')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            BantAI HIV - OTP Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Phase 1 SMS Integration Demo
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Philippine Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09171234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 09XXXXXXXXX
                </p>
              </div>
              
              <Button
                onClick={sendOTP}
                disabled={loading || !phoneNumber}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setMessage('')
                }}
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}
          
          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Note: SMS will only work if Twilio/Semaphore is configured</p>
          <p>Check .env.local for SMS provider settings</p>
        </div>
      </div>
    </div>
  )
}