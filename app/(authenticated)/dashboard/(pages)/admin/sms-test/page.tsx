'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Phone,
  FileText
} from 'lucide-react'

export default function SMSTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('Test message from BantAI HIV Platform')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as 09XX XXX XXXX
    if (digits.startsWith('09') && digits.length <= 11) {
      if (digits.length > 4 && digits.length <= 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`
      } else if (digits.length > 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
      }
    }
    
    return digits
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSendSMS = async () => {
    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ''),
          message
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: 'SMS sent successfully!',
          details: data.result
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send SMS',
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        details: error
      })
    } finally {
      setSending(false)
    }
  }

  const handleSendOTP = async () => {
    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/test-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, '')
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `OTP sent successfully! Code: ${data.otp}`,
          details: data.result
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send OTP',
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        details: error
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">SMS Testing</h1>
              <p className="text-gray-600">Test Semaphore SMS integration</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page is for testing SMS functionality. Each SMS sent will use your Semaphore credits.
            </AlertDescription>
          </Alert>
        </div>

        {/* SMS Configuration Info */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Provider:</span>
                <Badge className="bg-green-100 text-green-700 border-0">Semaphore</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Sender Name:</span>
                <span className="font-mono">BANTAI</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Environment:</span>
                <Badge variant="outline">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test SMS Form */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Send Test SMS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  maxLength={13} // 09XX XXX XXXX with spaces
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter Philippine mobile number (e.g., 0917 123 4567)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/160 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSendSMS}
                disabled={!phoneNumber || !message || sending}
                className="flex-1"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test SMS
              </Button>

              <Button
                variant="outline"
                onClick={handleSendOTP}
                disabled={!phoneNumber || sending}
                className="flex-1"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Send Test OTP
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600">
                        Technical Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Testing Tips:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Use your own phone number for testing</li>
            <li>• OTP codes are valid for 10 minutes</li>
            <li>• Check Semaphore dashboard for delivery status</li>
            <li>• Each SMS costs approximately ₱0.50</li>
          </ul>
        </div>
      </div>
    </div>
  )
}