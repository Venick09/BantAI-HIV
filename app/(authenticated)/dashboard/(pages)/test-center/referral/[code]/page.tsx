'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getReferralDetails, submitTestResult } from '@/actions/test-center'

interface ReferralDetails {
  id: string
  referralCode: string
  patient: {
    firstName: string
    lastName: string
    phoneNumber: string
    dateOfBirth?: string
  }
  riskLevel: 'low' | 'moderate' | 'high' | null
  createdAt: string | Date
  expiresAt: string | Date
  status: string
  testResult?: {
    result: string
    testDate: string
    testType: string
  } | null
}

export default function ReferralDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const referralCode = params.code as string
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [referral, setReferral] = useState<ReferralDetails | null>(null)
  const [error, setError] = useState('')
  
  // Test result form data
  const [testType, setTestType] = useState('rapid')
  const [testResult, setTestResult] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadReferralDetails()
  }, [referralCode])

  const loadReferralDetails = async () => {
    try {
      const details = await getReferralDetails(referralCode)
      if (details) {
        setReferral(details as ReferralDetails)
      } else {
        setError('Referral not found')
      }
    } catch (err) {
      setError('Failed to load referral details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referral || !testResult) return

    setSubmitting(true)
    try {
      const result = await submitTestResult({
        referralId: referral.id,
        testType,
        result: testResult,
        notes
      })

      if (result.success) {
        router.push('/dashboard/test-center?success=result_submitted')
      } else {
        setError(result.error || 'Failed to submit test result')
      }
    } catch (err) {
      setError('Failed to submit test result')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading referral...</p>
        </div>
      </div>
    )
  }

  if (error && !referral) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Referral Not Found</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link href="/dashboard/test-center">
                <Button>Back to Test Center</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!referral) return null

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive'
      case 'moderate': return 'secondary'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/test-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Referral {referralCode}</h1>
          <p className="text-muted-foreground">Patient testing and result entry</p>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Risk assessment completed on {new Date(referral.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {referral.patient.firstName} {referral.patient.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{referral.patient.phoneNumber}</span>
              </div>
              {referral.patient.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(referral.patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <div className="mt-1">
                  {referral.riskLevel ? (
                    <Badge variant={getRiskBadgeColor(referral.riskLevel)}>
                      {referral.riskLevel.toUpperCase()} RISK
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Assessed</Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Referral Status</span>
                <div className="mt-1">
                  <Badge variant={referral.status === 'tested' ? 'default' : 'secondary'}>
                    {referral.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Result Form or Display */}
      {referral.testResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
            <CardDescription>
              Test completed on {new Date(referral.testResult.testDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Test Type</Label>
                <p className="text-lg font-medium capitalize">{referral.testResult.testType}</p>
              </div>
              <div>
                <Label>Result</Label>
                <div className="mt-1">
                  <Badge 
                    variant={referral.testResult.result === 'positive' ? 'destructive' : 'default'}
                    className="text-lg px-4 py-1"
                  >
                    {referral.testResult.result.toUpperCase()}
                  </Badge>
                </div>
              </div>
              {referral.testResult.result === 'positive' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Next Steps</h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Provide post-test counseling</li>
                    <li>Schedule confirmatory testing</li>
                    <li>Initiate linkage to care</li>
                    <li>Start ART evaluation process</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Enter Test Result</CardTitle>
            <CardDescription>
              Record the HIV test result for this patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitResult} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="test-type">Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger id="test-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rapid">Rapid Test</SelectItem>
                    <SelectItem value="elisa">ELISA</SelectItem>
                    <SelectItem value="pcr">PCR</SelectItem>
                    <SelectItem value="western_blot">Western Blot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Test Result</Label>
                <RadioGroup value={testResult} onValueChange={setTestResult}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="negative" />
                    <Label htmlFor="negative" className="font-normal cursor-pointer">
                      Negative (Non-Reactive)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="font-normal cursor-pointer">
                      Positive (Reactive)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="indeterminate" id="indeterminate" />
                    <Label htmlFor="indeterminate" className="font-normal cursor-pointer">
                      Indeterminate
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting || !testResult}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Test Result'}
                </Button>
                <Link href="/dashboard/test-center">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}