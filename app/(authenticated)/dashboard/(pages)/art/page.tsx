'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Activity, Calendar, Users, TrendingUp, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { getARTPatients, recordARTStartDate, getUpcomingAppointments } from '@/actions/art-management'

interface ARTPatient {
  id: string
  patientCode: string
  status: string
  artStartDate?: string | null
  currentRegimen?: string | null
  nextAppointmentDate?: string | null
  patient: {
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

interface Appointment {
  id: string
  patientCode: string
  nextAppointmentDate: string
  patient: {
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

export default function ARTManagementPage() {
  const [patients, setPatients] = useState<ARTPatient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<ARTPatient | null>(null)
  
  // Form state for ART start
  const [artStartDate, setArtStartDate] = useState<Date>()
  const [currentRegimen, setCurrentRegimen] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const loadData = async () => {
    try {
      const [patientsData, appointmentsData] = await Promise.all([
        getARTPatients(selectedStatus === 'all' ? undefined : selectedStatus),
        getUpcomingAppointments(30)
      ])
      
      setPatients(patientsData as ARTPatient[])
      setAppointments(appointmentsData as Appointment[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartART = async () => {
    if (!selectedPatient || !artStartDate || !currentRegimen) return

    setSubmitting(true)
    try {
      const result = await recordARTStartDate({
        patientId: selectedPatient.id,
        artStartDate: artStartDate.toISOString().split('T')[0],
        currentRegimen,
        clinicName,
        nextAppointmentDate: nextAppointmentDate?.toISOString().split('T')[0]
      })

      if (result.success) {
        // Reset form
        setSelectedPatient(null)
        setArtStartDate(undefined)
        setCurrentRegimen('')
        setClinicName('')
        setNextAppointmentDate(undefined)
        
        // Reload data
        await loadData()
      }
    } catch (error) {
      console.error('Error starting ART:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge >Active</Badge>
      case 'not_started': return <Badge variant="secondary">Not Started</Badge>
      case 'defaulted': return <Badge variant="secondary">Defaulted</Badge>
      case 'stopped': return <Badge variant="destructive">Stopped</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const filteredPatients = patients.filter(patient => 
    searchTerm === '' || 
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Stats
  const activeCount = patients.filter(p => p.status === 'active').length
  const notStartedCount = patients.filter(p => p.status === 'not_started').length
  const defaultedCount = patients.filter(p => p.status === 'defaulted').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ART Management</h1>
        <p className="text-muted-foreground">
          Manage antiretroviral therapy patients and track adherence
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently on ART</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Start</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notStartedCount}</div>
            <p className="text-xs text-muted-foreground">Ready to initiate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defaulted</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaultedCount}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">ART Patients</TabsTrigger>
          <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>
                All patients enrolled in ART program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient code or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ART Start Date</TableHead>
                      <TableHead>Current Regimen</TableHead>
                      <TableHead>Next Appointment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.patientCode}</TableCell>
                        <TableCell>
                          {patient.patient.firstName} {patient.patient.lastName}
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          {patient.artStartDate ? new Date(patient.artStartDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{patient.currentRegimen || '-'}</TableCell>
                        <TableCell>
                          {patient.nextAppointmentDate ? new Date(patient.nextAppointmentDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {patient.status === 'not_started' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedPatient(patient)}
                                >
                                  Start ART
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Start ART for {patient.patient.firstName} {patient.patient.lastName}</DialogTitle>
                                  <DialogDescription>
                                    Record ART initiation details for patient {patient.patientCode}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>ART Start Date</Label>
                                    <DatePicker 
                                      date={artStartDate} 
                                      onSelect={setArtStartDate}
                                      placeholder="Select start date"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Regimen</Label>
                                    <Select value={currentRegimen} onValueChange={setCurrentRegimen}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select regimen" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="TDF+3TC+EFV">TDF + 3TC + EFV</SelectItem>
                                        <SelectItem value="TDF+3TC+DTG">TDF + 3TC + DTG</SelectItem>
                                        <SelectItem value="ABC+3TC+DTG">ABC + 3TC + DTG</SelectItem>
                                        <SelectItem value="TDF+FTC+DTG">TDF + FTC + DTG</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Clinic Name</Label>
                                    <Input
                                      value={clinicName}
                                      onChange={(e) => setClinicName(e.target.value)}
                                      placeholder="Enter clinic name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Next Appointment Date</Label>
                                    <DatePicker 
                                      date={nextAppointmentDate} 
                                      onSelect={setNextAppointmentDate}
                                      placeholder="Select appointment date"
                                    />
                                  </div>
                                  <Button 
                                    onClick={handleStartART}
                                    disabled={submitting || !artStartDate || !currentRegimen}
                                    className="w-full"
                                  >
                                    {submitting ? 'Recording...' : 'Start ART'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {patient.status === 'active' && (
                            <div className="flex gap-2">
                              <Link href={`/dashboard/art/adherence?patientId=${patient.id}&patientCode=${patient.patientCode}`}>
                                <Button size="sm" variant="outline">
                                  Track Adherence
                                </Button>
                              </Link>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Scheduled visits for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No upcoming appointments scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Patient Code: {appointment.patientCode} • {appointment.patient.phoneNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(appointment.nextAppointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.ceil((new Date(appointment.nextAppointmentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}