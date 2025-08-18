'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTestSMS = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message: message || undefined
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestOTP = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          purpose: 'registration'
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>SMS Testing Dashboard</CardTitle>
          <CardDescription>
            Test SMS functionality and debug delivery issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              Format: 09XXXXXXXXX or +639XXXXXXXXX
            </p>
          </div>
          
          <div>
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Input
              id="message"
              type="text"
              placeholder="Leave empty for default test message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={handleTestSMS}
              disabled={loading || !phoneNumber}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Test Basic SMS'}
            </Button>
            
            <Button
              onClick={handleTestOTP}
              disabled={loading || !phoneNumber}
              variant="secondary"
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Test OTP SMS'}
            </Button>
          </div>
          
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                Result: {result.success ? 'Success' : 'Failed'}
              </h3>
              
              <div className="space-y-2 text-sm">
                {result.error && (
                  <div>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.messageId && (
                  <div>
                    <strong>Message ID:</strong> {result.messageId}
                  </div>
                )}
                
                {result.provider && (
                  <div>
                    <strong>Provider:</strong> {result.provider}
                  </div>
                )}
                
                {result.envCheck && (
                  <div className="mt-4">
                    <strong>Environment Check:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.envCheck, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-red-700">Error Stack</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {result.stack}
                    </pre>
                  </details>
                )}
                
                {result.details && (
                  <div className="mt-4">
                    <strong>Validation Errors:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Debugging Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>Check if SMS_PROVIDER is set in .env (twilio or semaphore)</li>
              <li>Verify Twilio credentials: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</li>
              <li>For Semaphore: SEMAPHORE_API_KEY and SEMAPHORE_SENDER_NAME</li>
              <li>Ensure phone number format is correct (Philippine format)</li>
              <li>Check if OTP_SECRET is set for OTP functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}