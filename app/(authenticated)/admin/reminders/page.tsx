'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Plus
} from 'lucide-react'

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState('scheduled')

  // Mock data
  const stats = {
    scheduledToday: 45,
    sentToday: 128,
    deliveryRate: 94,
    pendingResponses: 12
  }

  const reminders = {
    scheduled: [
      {
        id: '1',
        patientName: 'Juan Dela Cruz',
        phoneNumber: '+639123456789',
        type: 'medication',
        message: 'Time to take your ARV medication. Reply YES when taken.',
        scheduledTime: '2:00 PM',
        status: 'pending'
      },
      {
        id: '2',
        patientName: 'Maria Santos',
        phoneNumber: '+639987654321',
        type: 'appointment',
        message: 'You have an appointment tomorrow at 10 AM. Reply CONFIRM to confirm.',
        scheduledTime: '3:30 PM',
        status: 'pending'
      },
      {
        id: '3',
        patientName: 'Pedro Garcia',
        phoneNumber: '+639456789012',
        type: 'refill',
        message: 'Your medication refill is due in 3 days. Visit the clinic.',
        scheduledTime: '5:00 PM',
        status: 'pending'
      }
    ],
    sent: [
      {
        id: '4',
        patientName: 'Ana Reyes',
        phoneNumber: '+639321654987',
        type: 'medication',
        message: 'Time to take your ARV medication. Reply YES when taken.',
        sentTime: '12:30 PM',
        status: 'delivered',
        response: 'YES'
      },
      {
        id: '5',
        patientName: 'Carlos Mendez',
        phoneNumber: '+639654321987',
        type: 'appointment',
        message: 'You have an appointment tomorrow at 2 PM. Reply CONFIRM to confirm.',
        sentTime: '11:00 AM',
        status: 'delivered',
        response: null
      }
    ]
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Bell className="h-4 w-4" />
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'refill':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-blue-100 text-blue-800'
      case 'appointment':
        return 'bg-purple-100 text-purple-800'
      case 'refill':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SMS Reminders</h1>
        <p className="text-muted-foreground mt-2">
          Manage automated patient reminders and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledToday}</div>
            <p className="text-xs text-muted-foreground">
              Pending reminders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentToday}</div>
            <p className="text-xs text-muted-foreground">
              Messages delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingResponses}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting reply
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reminder Management</CardTitle>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Reminder
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'sent'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sent
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === 'scheduled' ? (
              reminders.scheduled.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${getReminderColor(reminder.type)}`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.patientName}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.phoneNumber}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {reminder.scheduledTime}
                      </Badge>
                    </div>
                    <p className="text-sm bg-muted px-3 py-2 rounded">
                      {reminder.message}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm">Send Now</Button>
                  </div>
                </div>
              ))
            ) : (
              reminders.sent.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${getReminderColor(reminder.type)}`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.patientName}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.phoneNumber}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant={reminder.status === 'delivered' ? 'default' : 'secondary'}>
                          {reminder.status}
                        </Badge>
                        {reminder.response && (
                          <Badge variant="outline" className="bg-green-50">
                            Response: {reminder.response}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sent at {reminder.sentTime}
                    </p>
                    <p className="text-sm bg-muted px-3 py-2 rounded">
                      {reminder.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}