'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  time: string
  referralCode: string
  patientName: string
  type: 'walk-in' | 'scheduled' | 'follow-up'
  status: 'pending' | 'completed' | 'no-show'
  riskLevel: 'low' | 'moderate' | 'high'
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchedule()
  }, [selectedDate])

  const loadSchedule = async () => {
    try {
      // Mock data - would be fetched from server
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          time: '09:00 AM',
          referralCode: 'REF123ABC',
          patientName: 'John Doe',
          type: 'scheduled',
          status: 'pending',
          riskLevel: 'high'
        },
        {
          id: '2',
          time: '10:30 AM',
          referralCode: 'REF456DEF',
          patientName: 'Jane Smith',
          type: 'walk-in',
          status: 'pending',
          riskLevel: 'moderate'
        },
        {
          id: '3',
          time: '11:00 AM',
          referralCode: 'REF789GHI',
          patientName: 'Mike Johnson',
          type: 'follow-up',
          status: 'completed',
          riskLevel: 'low'
        },
        {
          id: '4',
          time: '02:00 PM',
          referralCode: 'REF012JKL',
          patientName: 'Sarah Williams',
          type: 'scheduled',
          status: 'pending',
          riskLevel: 'high'
        }
      ]
      setAppointments(mockAppointments)
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'walk-in': return <Badge variant="secondary">Walk-in</Badge>
      case 'scheduled': return <Badge variant="default">Scheduled</Badge>
      case 'follow-up': return <Badge variant="outline">Follow-up</Badge>
      default: return null
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return <Badge variant="destructive">High Risk</Badge>
      case 'moderate': return <Badge variant="secondary">Moderate Risk</Badge>
      case 'low': return <Badge variant="secondary">Low Risk</Badge>
      default: return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'no-show': return '✗'
      default: return '•'
    }
  }

  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const highRiskCount = appointments.filter(a => a.riskLevel === 'high' && a.status === 'pending').length

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
          <h1 className="text-2xl font-bold">Test Center Schedule</h1>
          <p className="text-muted-foreground">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              Click on an appointment to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 ${
                      appointment.status === 'completed' ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{appointment.time}</span>
                          <span className={`text-sm ${
                            appointment.status === 'completed' ? 'text-green-600' : 
                            appointment.status === 'no-show' ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {getStatusIcon(appointment.status)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.referralCode}</p>
                        </div>
                        <div className="flex gap-2">
                          {getTypeBadge(appointment.type)}
                          {getRiskBadge(appointment.riskLevel)}
                        </div>
                      </div>
                      {appointment.status === 'pending' && (
                        <Link href={`/dashboard/test-center/referral/${appointment.referralCode}`}>
                          <Button size="sm">Start Test</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
          <CardDescription>
            Free slots for walk-in patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
              '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map((time) => {
              const isBooked = appointments.some(a => a.time === time && a.status === 'pending')
              return (
                <Button
                  key={time}
                  variant={isBooked ? 'secondary' : 'outline'}
                  size="sm"
                  disabled={isBooked}
                >
                  {time}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}