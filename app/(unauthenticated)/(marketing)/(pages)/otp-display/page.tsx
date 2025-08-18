'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OTPDisplayPage() {
  const [phoneNumber, setPhoneNumber] = useState('09999986806')
  const [loading, setLoading] = useState(false)
  const [otpData, setOtpData] = useState<any>(null)

  const handleSendOTP = async () => {
    setLoading(true)
    setOtpData(null)
    
    try {
      // First, trigger the actual registration OTP
      const registrationResponse = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          purpose: 'registration'
        })
      })
      
      const registrationData = await registrationResponse.json()
      
      if (registrationData.success) {
        // Now get the OTP for display (development only)
        const response = await fetch('/api/test-otp-display', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            getActualOTP: true // Flag to get the actual OTP
          })
        })
        
        const data = await response.json()
        setOtpData(data)
      } else {
        setOtpData(registrationData)
      }
    } catch (error) {
      setOtpData({
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>OTP Test & Display</CardTitle>
          <CardDescription>
            This page will trigger the actual registration OTP and display it.
            Use this OTP in the registration flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Input
              type="tel"
              placeholder="09999986806"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-center text-lg"
            />
          </div>
          
          <Button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Generating OTP...' : 'Generate & Show OTP'}
          </Button>
          
          {otpData && otpData.success && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Your OTP Code is:</p>
                <p className="text-4xl font-bold text-green-700 tracking-wider">
                  {otpData.otp}
                </p>
                <p className="text-xs text-gray-500 mt-2">Valid for 10 minutes</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> In production, this would be sent via SMS. 
                  For development, we're showing it directly here.
                </p>
              </div>
              
              {otpData.smsContent && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-xs font-mono text-gray-600 mb-1">SMS Preview:</p>
                  <pre className="text-xs whitespace-pre-wrap">{otpData.smsContent}</pre>
                </div>
              )}
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>How to use:</strong> 
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Go to the registration page</li>
                    <li>Enter this phone number: {phoneNumber}</li>
                    <li>Click "Send Verification Code"</li>
                    <li>Use the OTP shown above: <strong>{otpData.otp}</strong></li>
                  </ol>
                </p>
              </div>
            </div>
          )}
          
          {otpData && !otpData.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{otpData.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}