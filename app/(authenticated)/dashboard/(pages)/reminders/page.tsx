'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bell, Clock, MessageSquare, Calendar, Plus, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'

interface Reminder {
  id: string
  patientCode: string
  patientName: string
  reminderType: string
  scheduledDate: string
  scheduledTime: string
  isActive: boolean
  deliveryStatus?: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  // New reminder form state
  const [patientCode, setPatientCode] = useState('')
  const [reminderType, setReminderType] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState('08:00')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReminders()
  }, [filterType])

  const loadReminders = async () => {
    try {
      // Mock data - would be fetched from server
      const mockReminders: Reminder[] = [
        {
          id: '1',
          patientCode: 'ART12345678',
          patientName: 'John Doe',
          reminderType: 'daily_medication',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '08:00',
          isActive: true,
          deliveryStatus: 'sent'
        },
        {
          id: '2',
          patientCode: 'ART87654321',
          patientName: 'Jane Smith',
          reminderType: 'appointment',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '09:00',
          isActive: true,
          deliveryStatus: 'pending'
        },
        {
          id: '3',
          patientCode: 'ART11223344',
          patientName: 'Mike Johnson',
          reminderType: 'refill',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '14:00',
          isActive: false,
          deliveryStatus: 'pending'
        }
      ]
      
      setReminders(mockReminders)
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReminder = async () => {
    if (!patientCode || !reminderType || !scheduledDate) return
    
    setSubmitting(true)
    try {
      // Create reminder logic here
      console.log('Creating reminder:', {
        patientCode,
        reminderType,
        scheduledDate,
        scheduledTime
      })
      
      // Reset form
      setPatientCode('')
      setReminderType('')
      setScheduledDate(undefined)
      setScheduledTime('08:00')
      
      // Reload reminders
      await loadReminders()
    } catch (error) {
      console.error('Error creating reminder:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleReminder = async (reminderId: string, isActive: boolean) => {
    // Toggle reminder active status
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, isActive } : r
    ))
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'daily_medication': return <Badge variant="default">Daily Med</Badge>
      case 'appointment': return <Badge variant="secondary">Appointment</Badge>
      case 'refill': return <Badge variant="outline">Refill</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'sent': return <Badge >Sent</Badge>
      case 'delivered': return <Badge >Delivered</Badge>
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'failed': return <Badge variant="destructive">Failed</Badge>
      default: return null
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = searchTerm === '' || 
      reminder.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || reminder.reminderType === filterType
    
    return matchesSearch && matchesType
  })

  // Stats
  const activeCount = reminders.filter(r => r.isActive).length
  const todayCount = reminders.filter(r => r.scheduledDate === new Date().toISOString().split('T')[0]).length
  const pendingCount = reminders.filter(r => r.deliveryStatus === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMS Reminders</h1>
          <p className="text-muted-foreground">
            Manage medication and appointment reminders
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
              <DialogDescription>
                Schedule a new SMS reminder for a patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Patient Code</Label>
                <Input
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                  placeholder="ART12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Reminder Type</Label>
                <Select value={reminderType} onValueChange={setReminderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_medication">Daily Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="refill">Medication Refill</SelectItem>
                    <SelectItem value="viral_load_test">Viral Load Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker 
                  date={scheduledDate} 
                  onSelect={setScheduledDate}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={scheduledTime} onValueChange={setScheduledTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00 AM</SelectItem>
                    <SelectItem value="07:00">07:00 AM</SelectItem>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                    <SelectItem value="20:00">08:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateReminder}
                disabled={submitting || !patientCode || !reminderType || !scheduledDate}
                className="w-full"
              >
                {submitting ? 'Creating...' : 'Create Reminder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">To be sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>
            All scheduled SMS reminders
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="daily_medication">Daily Medication</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="refill">Refills</SelectItem>
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reminder.patientName}</p>
                        <p className="text-sm text-muted-foreground">{reminder.patientCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(reminder.reminderType)}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(reminder.scheduledDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{reminder.scheduledTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reminder.deliveryStatus)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={reminder.isActive}
                        onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>
            Default SMS templates for different reminder types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Daily Medication Reminder</h4>
              <p className="text-sm text-muted-foreground">
                Hi [Name], time for your HIV medication! Take it now to stay healthy. Reply TAKEN when done or HELP if you need support.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Appointment Reminder</h4>
              <p className="text-sm text-muted-foreground">
                Hi [Name], reminder: You have a clinic appointment on [Date] at [Time]. Reply CONFIRM to confirm or RESCHEDULE to change.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Medication Refill</h4>
              <p className="text-sm text-muted-foreground">
                Hi [Name], your medication supply is running low. Visit the clinic by [Date] for refill. Your health matters!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}