'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Pill, 
  Users, 
  Calendar, 
  AlertCircle,
  Search,
  Plus,
  Filter,
  Download
} from 'lucide-react'

export default function ARTManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with actual API calls
  const stats = {
    totalPatients: 342,
    activeOnART: 298,
    adherenceRate: 87,
    pendingRefills: 23
  }

  const patients = [
    {
      id: '1',
      name: 'Juan Dela Cruz',
      phoneNumber: '+639123456789',
      regimen: 'TDF/3TC/EFV',
      lastRefill: '2024-12-15',
      nextRefill: '2025-01-15',
      adherence: 95,
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      phoneNumber: '+639987654321',
      regimen: 'TDF/FTC/DTG',
      lastRefill: '2024-12-01',
      nextRefill: '2025-01-01',
      adherence: 82,
      status: 'active'
    },
    {
      id: '3',
      name: 'Pedro Garcia',
      phoneNumber: '+639456789012',
      regimen: 'ABC/3TC/DTG',
      lastRefill: '2024-11-20',
      nextRefill: '2024-12-20',
      adherence: 68,
      status: 'at-risk'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ART Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage antiretroviral therapy for patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ART Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active on ART</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOnART}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeOnART / stats.totalPatients) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average adherence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refills</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRefills}</div>
            <p className="text-xs text-muted-foreground">
              Due this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient ART Records</CardTitle>
            <div className="flex gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{patient.name}</h3>
                    <Badge variant={patient.status === 'active' ? 'default' : 'destructive'}>
                      {patient.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{patient.phoneNumber}</p>
                  <p className="text-sm">
                    <span className="font-medium">Regimen:</span> {patient.regimen}
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Adherence:</span>{' '}
                    <span className={`font-medium ${
                      patient.adherence >= 80 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {patient.adherence}%
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Next refill: {new Date(patient.nextRefill).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm">Send Reminder</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}