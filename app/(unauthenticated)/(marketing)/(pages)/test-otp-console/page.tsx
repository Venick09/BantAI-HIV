'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendRegistrationOTP } from '@/actions/users'

export default function TestOTPConsolePage() {
  const [phoneNumber, setPhoneNumber] = useState('09171234567')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log
    console.log = (...args) => {
      originalLog(...args)
      setLogs(prev => [...prev, args.join(' ')])
    }
    
    return () => {
      console.log = originalLog
    }
  }, [])

  const handleSendOTP = async () => {
    setLoading(true)
    setResult(null)
    setLogs([])
    
    try {
      console.log('🚀 Starting OTP test...')
      const res = await sendRegistrationOTP(phoneNumber)
      console.log('📋 Result:', JSON.stringify(res, null, 2))
      setResult(res)
    } catch (error) {
      console.error('❌ Error:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>OTP Console Test</CardTitle>
            <CardDescription>
              This page tests OTP generation and shows all console output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="09171234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
            
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <pre className="text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Console Output</CardTitle>
            <CardDescription>
              Check your terminal/console for the OTP code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-1">
                    {log}
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> The OTP code will appear in your terminal/console where the Next.js dev server is running, not in this browser window.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}