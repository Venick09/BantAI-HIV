'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateTestOTP, verifyTestOTP } from '@/actions/otp-test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function OTPTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [history, setHistory] = useState<Array<{phone: string, otp: string, time: string}>>([])

  const handleGenerateOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setOtp('')
    
    try {
      const result = await generateTestOTP(phoneNumber)
      
      if (result.success && result.otp) {
        setGeneratedOTP(result.otp)
        setSuccess(`OTP generated successfully for ${phoneNumber}`)
        
        // Add to history
        setHistory(prev => [{
          phone: phoneNumber,
          otp: result.otp!,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)])
        
        console.log(`✅ Generated OTP: ${result.otp} for ${phoneNumber}`)
      } else {
        setError(result.error || 'Failed to generate OTP')
        setGeneratedOTP('')
      }
    } catch (err) {
      setError('Failed to generate OTP')
      console.error('OTP generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!phoneNumber || !otp) {
      setError('Please enter phone number and OTP')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await verifyTestOTP(phoneNumber, otp)
      
      if (result.success) {
        setSuccess('✅ OTP verified successfully!')
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

  const clearAll = () => {
    setPhoneNumber('')
    setOtp('')
    setGeneratedOTP('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">OTP Testing System</CardTitle>
            <CardDescription className="text-lg">
              Generate and verify OTP for any Philippine phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">Generate OTP</TabsTrigger>
                <TabsTrigger value="verify">Verify OTP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-gen">Phone Number</Label>
                  <Input
                    id="phone-gen"
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500">
                    Enter any Philippine mobile number (09XXXXXXXXX format)
                  </p>
                </div>
                
                <Button
                  onClick={handleGenerateOTP}
                  disabled={loading}
                  className="w-full h-12"
                  size="lg"
                >
                  {loading ? 'Generating...' : 'Generate OTP'}
                </Button>
                
                {generatedOTP && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 text-center space-y-2">
                    <p className="text-sm opacity-90">Generated OTP for {phoneNumber}:</p>
                    <p className="text-5xl font-mono font-bold tracking-[0.3em]">
                      {generatedOTP}
                    </p>
                    <p className="text-xs opacity-75">Valid for 10 minutes</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="verify" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-verify">Phone Number</Label>
                  <Input
                    id="phone-verify"
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otp-verify">OTP Code</Label>
                  <Input
                    id="otp-verify"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-[0.3em] font-mono"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex gap-3">
                  {generatedOTP && (
                    <Button
                      onClick={() => setOtp(generatedOTP)}
                      variant="outline"
                      className="flex-1"
                    >
                      Use Generated OTP
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button onClick={clearAll} variant="ghost" size="sm">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent OTPs</CardTitle>
              <CardDescription>Your recently generated OTPs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.phone}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold">{item.otp}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPhoneNumber(item.phone)
                          setOtp(item.otp)
                        }}
                        className="text-xs"
                      >
                        Use this
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Enter ANY Philippine phone number (09XXXXXXXXX format)</li>
              <li>Click "Generate OTP" to create a 6-digit code</li>
              <li>The OTP will be displayed on screen (development mode)</li>
              <li>Switch to "Verify OTP" tab to test verification</li>
              <li>You can generate multiple OTPs for different numbers</li>
              <li>Each OTP is valid for 10 minutes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}