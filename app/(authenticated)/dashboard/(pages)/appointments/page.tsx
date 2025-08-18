'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Plus, 
  X,
  Phone,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { getUserAppointments, getAvailableSlots, bookAppointment, cancelAppointment } from '@/actions/appointments'
import { getTestCenters } from '@/actions/test-center'
import { getPendingReferrals } from '@/actions/test-results'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  testCenter: {
    name: string
    address: string
    city: string
  }
  date: string
  time: string
  status: 'confirmed' | 'cancelled' | 'completed'
  referralCode?: string
}

interface TestCenter {
  id: string
  name: string
  address: string
  city: string
  province: string
  contactNumber: string
}

interface PendingReferral {
  id: string
  referralCode: string
  riskLevel: string
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [testCenters, setTestCenters] = useState<TestCenter[]>([])
  const [pendingReferrals, setPendingReferrals] = useState<PendingReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  
  // Booking form state
  const [selectedCenter, setSelectedCenter] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedReferral, setSelectedReferral] = useState<string>('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCenter && selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedCenter, selectedDate])

  const loadData = async () => {
    try {
      const [appointmentsRes, centersRes, referralsRes] = await Promise.all([
        getUserAppointments(),
        getTestCenters(),
        getPendingReferrals()
      ])

      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.appointments as Appointment[])
      }

      setTestCenters(centersRes)

      if (referralsRes.success && referralsRes.referrals) {
        setPendingReferrals(referralsRes.referrals as PendingReferral[])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedCenter || !selectedDate) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await getAvailableSlots(selectedCenter, dateStr)
      
      if (response.success && response.slots) {
        setAvailableSlots(response.slots)
      }
    } catch (error) {
      console.error('Failed to load slots:', error)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedCenter || !selectedDate || !selectedSlot) return

    setBookingLoading(true)
    try {
      const response = await bookAppointment({
        testCenterId: selectedCenter,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot,
        referralCode: selectedReferral
      })

      if (response.success) {
        // Add to appointments list
        const center = testCenters.find(c => c.id === selectedCenter)
        if (center) {
          setAppointments([
            {
              id: response.appointmentId!,
              testCenter: {
                name: center.name,
                address: center.address,
                city: center.city
              },
              date: selectedDate.toISOString().split('T')[0],
              time: selectedSlot,
              status: 'confirmed',
              referralCode: selectedReferral
            },
            ...appointments
          ])
        }
        
        // Reset form
        setShowBooking(false)
        setSelectedCenter('')
        setSelectedSlot('')
        setSelectedReferral('')
      }
    } catch (error) {
      console.error('Failed to book appointment:', error)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await cancelAppointment(appointmentId)
      if (response.success) {
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
        ))
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-0">Confirmed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-0">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Completed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-full">
                <CalendarDays className="h-8 w-8 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                <p className="text-gray-600">Schedule and manage your HIV test appointments</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowBooking(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ) : appointments.length === 0 && !showBooking ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Book an appointment at a testing center to get your free HIV test.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => setShowBooking(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/test-centers')}
                >
                  View Test Centers
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Booking Form */}
            {showBooking && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Book New Appointment</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBooking(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Referral Code Selection */}
                  {pendingReferrals.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Referral Code (Optional)
                      </label>
                      <div className="space-y-2">
                        {pendingReferrals.map((referral) => (
                          <div
                            key={referral.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedReferral === referral.referralCode
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedReferral(referral.referralCode)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="font-mono font-medium">{referral.referralCode}</span>
                              </div>
                              <Badge className={`${
                                referral.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                                referral.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-green-100 text-green-700'
                              } border-0`}>
                                {referral.riskLevel} Risk
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReferral('')}
                          className="text-gray-500"
                        >
                          Clear selection
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Test Center Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Test Center
                    </label>
                    <select
                      value={selectedCenter}
                      onChange={(e) => setSelectedCenter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Choose a test center...</option>
                      {testCenters.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name} - {center.city}, {center.province}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Date
                    </label>
                    <div className="border rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border-0"
                      />
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedCenter && selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                            className={selectedSlot === slot ? 'bg-indigo-500 hover:bg-indigo-600' : ''}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleBookAppointment}
                      disabled={!selectedCenter || !selectedDate || !selectedSlot || bookingLoading}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBooking(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointments List */}
            {appointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Appointments</h2>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="border-0 shadow-sm overflow-hidden">
                      <div className={`h-2 ${
                        appointment.status === 'confirmed' ? 'bg-green-500' :
                        appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-indigo-50 rounded-lg">
                                <CalendarDays className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {appointment.testCenter.name}
                                  </h3>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{appointment.time}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{appointment.testCenter.address}, {appointment.testCenter.city}</span>
                                  </div>
                                  
                                  {appointment.referralCode && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FileText className="h-4 w-4" />
                                      <span>Referral: <span className="font-mono font-medium">{appointment.referralCode}</span></span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {appointment.status === 'confirmed' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Reminder */}
                        {appointment.status === 'confirmed' && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex gap-3">
                              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <p className="text-sm text-blue-800">
                                Remember to bring a valid ID and your referral code (if applicable) to your appointment.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Information Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Free Testing</h3>
                      <p className="text-sm text-gray-600">
                        All HIV tests are completely free. No insurance or payment required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                      <p className="text-sm text-gray-600">
                        Call 1-800-HIV-HELP for assistance with booking or questions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}