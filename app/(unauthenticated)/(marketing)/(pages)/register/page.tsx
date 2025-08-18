'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendRegistrationOTP, verifyRegistrationOTP, createUser } from '@/actions/users'

type Step = 'consent' | 'phone' | 'otp' | 'details' | 'success'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('consent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    const result = await sendRegistrationOTP(phoneNumber)
    
    if (result.success) {
      setStep('otp')
    } else {
      setError(result.error || 'Failed to send OTP')
    }
    
    setLoading(false)
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

  const handleCompleteRegistration = async () => {
    setLoading(true)
    setError('')
    
    const result = await createUser({
      phoneNumber,
      firstName,
      lastName,
      email: email || undefined,
      dateOfBirth: dateOfBirth || undefined,
      role: 'patient'
    }, true)
    
    if (result.success) {
      setStep('success')
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      setError(result.error || 'Failed to create account')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            BantAI HIV Platform Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Confidential HIV risk assessment and care management
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'consent' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Privacy & Consent Notice
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>By registering, you acknowledge that:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your data will be kept strictly confidential</li>
                    <li>We comply with RA 11166 (HIV and AIDS Policy Act)</li>
                    <li>We comply with RA 10173 (Data Privacy Act)</li>
                    <li>Your information will only be used for HIV prevention and care</li>
                    <li>You can opt-out at any time by texting STOP</li>
                  </ul>
                </div>
              </div>
              
              <Button
                onClick={() => setStep('phone')}
                className="w-full"
              >
                I Understand and Agree
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                For assistance, call: 1-800-HIV-HELP
              </p>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09171234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll send a verification code to this number
                </p>
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length < 11}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setStep('consent')}
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 text-center text-2xl tracking-wider"
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
              
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              
              <div className="text-center">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="dob">Date of Birth (Optional)</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <Button
                onClick={handleCompleteRegistration}
                disabled={loading || !firstName || !lastName}
                className="w-full"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
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
              <h3 className="text-lg font-medium text-gray-900">
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Welcome to BantAI, {firstName}! Redirecting to login...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}