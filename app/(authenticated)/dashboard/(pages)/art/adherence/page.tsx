'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, AlertCircle, Activity, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { recordAdherenceStatus, getPatientAdherenceHistory } from '@/actions/art-management'

interface AdherenceRecord {
  id: string
  trackingDate: string
  pillsTaken: boolean | null
  missedDoses: number | null
  adherenceStatus: 'good' | 'fair' | 'poor' | 'unknown'
  notes?: string | null
  createdAt: string | Date
}

export default function AdherenceTrackingPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const patientCode = searchParams.get('patientCode')
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [pillsTaken, setPillsTaken] = useState<string>('')
  const [missedDoses, setMissedDoses] = useState('0')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [adherenceHistory, setAdherenceHistory] = useState<AdherenceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      loadAdherenceHistory()
    }
  }, [patientId])

  const loadAdherenceHistory = async () => {
    if (!patientId) return
    
    try {
      const history = await getPatientAdherenceHistory(patientId, 30)
      setAdherenceHistory(history)
    } catch (error) {
      console.error('Error loading adherence history:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAdherenceRate = () => {
    if (adherenceHistory.length === 0) return 0
    const goodAdherence = adherenceHistory.filter(r => r.adherenceStatus === 'good').length
    return Math.round((goodAdherence / adherenceHistory.length) * 100)
  }

  const getAdherenceStatus = (): 'good' | 'fair' | 'poor' | 'unknown' => {
    if (pillsTaken === 'yes' && missedDoses === '0') return 'good'
    if (pillsTaken === 'yes' && parseInt(missedDoses) <= 2) return 'fair'
    if (pillsTaken === 'no' || parseInt(missedDoses) > 2) return 'poor'
    return 'unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !pillsTaken) return

    setSubmitting(true)
    try {
      const result = await recordAdherenceStatus({
        patientId,
        trackingDate: selectedDate.toISOString().split('T')[0],
        pillsTaken: pillsTaken === 'yes',
        missedDoses: parseInt(missedDoses),
        adherenceStatus: getAdherenceStatus(),
        notes
      })

      if (result.success) {
        // Reset form
        setPillsTaken('')
        setMissedDoses('0')
        setNotes('')
        setSelectedDate(new Date())
        
        // Reload history
        await loadAdherenceHistory()
      }
    } catch (error) {
      console.error('Error recording adherence:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const adherenceRate = calculateAdherenceRate()
  const recentTrend = adherenceHistory.slice(0, 7).filter(r => r.adherenceStatus === 'good').length

  if (!patientId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patient Selected</h3>
              <p className="text-muted-foreground mb-4">Please select a patient from the ART management page</p>
              <Link href="/dashboard/art">
                <Button>Go to ART Management</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/art">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Adherence Tracking</h1>
          <p className="text-muted-foreground">
            Patient: {patientCode || patientId}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Adherence</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adherenceRate}%</div>
            <Progress value={adherenceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Trend</CardTitle>
            {recentTrend >= 5 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTrend}/7</div>
            <p className="text-xs text-muted-foreground">Days with good adherence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adherenceHistory.length}</div>
            <p className="text-xs text-muted-foreground">Days recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Record Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Record Today's Adherence</CardTitle>
            <CardDescription>
              Track medication compliance for {selectedDate.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-3">
                <Label>Did you take your medication today?</Label>
                <RadioGroup value={pillsTaken} onValueChange={setPillsTaken}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="font-normal cursor-pointer">
                      Yes, I took my medication
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="font-normal cursor-pointer">
                      No, I missed my medication
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {pillsTaken === 'yes' && (
                <div className="space-y-3">
                  <Label>How many doses did you miss in the last 7 days?</Label>
                  <RadioGroup value={missedDoses} onValueChange={setMissedDoses}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="0" />
                      <Label htmlFor="0" className="font-normal cursor-pointer">None</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="1" />
                      <Label htmlFor="1" className="font-normal cursor-pointer">1 dose</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="2" />
                      <Label htmlFor="2" className="font-normal cursor-pointer">2 doses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="3" />
                      <Label htmlFor="3" className="font-normal cursor-pointer">3 or more doses</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any challenges or concerns..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !pillsTaken}
                className="w-full"
              >
                {submitting ? 'Recording...' : 'Record Adherence'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Adherence History</CardTitle>
            <CardDescription>
              Last 30 days of medication tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : adherenceHistory.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No adherence records yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {adherenceHistory.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(record.trackingDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.pillsTaken ? 'Medication taken' : 'Medication missed'}
                          {record.missedDoses && record.missedDoses > 0 && ` • ${record.missedDoses} doses missed`}
                        </p>
                        {record.notes && (
                          <p className="text-sm mt-1">{record.notes}</p>
                        )}
                      </div>
                      <Badge variant={
                        record.adherenceStatus === 'good' ? 'default' :
                        record.adherenceStatus === 'fair' ? 'secondary' :
                        record.adherenceStatus === 'poor' ? 'destructive' :
                        'secondary'
                      }>
                        {record.adherenceStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adherence Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Adherence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Set Daily Reminders
              </h4>
              <p className="text-sm text-muted-foreground">
                Use phone alarms or our SMS reminders to never forget your medication
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Keep Extra Supply
              </h4>
              <p className="text-sm text-muted-foreground">
                Always have backup medication in case of emergencies
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Link to Daily Routine
              </h4>
              <p className="text-sm text-muted-foreground">
                Take medication with meals or other daily activities
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Talk to Your Provider
              </h4>
              <p className="text-sm text-muted-foreground">
                Discuss any side effects or challenges with your healthcare team
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}