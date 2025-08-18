'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Activity
} from 'lucide-react'

interface BillingPeriod {
  id: string
  startDate: string
  endDate: string
  status: 'draft' | 'submitted' | 'approved' | 'paid'
  totalPatients: number
  totalAmount: number
  paidAmount: number
  submittedDate?: string
  approvedDate?: string
  paidDate?: string
}

interface BillingBreakdown {
  category: string
  description: string
  unitPrice: number
  quantity: number
  totalAmount: number
}

interface PatientBilling {
  id: string
  patientName: string
  phoneNumber: string
  services: {
    questionnaire: boolean
    testResult: boolean
    artStarted: boolean
  }
  totalAmount: number
  billingDate: string
}

export default function BillingPage() {
  const [currentPeriod, setCurrentPeriod] = useState<BillingPeriod>({
    id: '1',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'draft',
    totalPatients: 342,
    totalAmount: 125650,
    paidAmount: 0
  })

  const [billingBreakdown] = useState<BillingBreakdown[]>([
    {
      category: 'Questionnaire Delivery',
      description: 'Risk assessment questionnaire sent via SMS',
      unitPrice: 150,
      quantity: 342,
      totalAmount: 51300
    },
    {
      category: 'Test Results Logged',
      description: 'HIV test results recorded in system',
      unitPrice: 200,
      quantity: 267,
      totalAmount: 53400
    },
    {
      category: 'Positive Case ART',
      description: 'HIV positive patients started on ART',
      unitPrice: 500,
      quantity: 42,
      totalAmount: 21000
    }
  ])

  const [recentBillings] = useState<PatientBilling[]>([
    {
      id: '1',
      patientName: 'John Doe',
      phoneNumber: '09171234567',
      services: {
        questionnaire: true,
        testResult: true,
        artStarted: true
      },
      totalAmount: 850,
      billingDate: '2025-01-10'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      phoneNumber: '09181234567',
      services: {
        questionnaire: true,
        testResult: true,
        artStarted: false
      },
      totalAmount: 350,
      billingDate: '2025-01-09'
    }
  ])

  const [billingPeriods] = useState<BillingPeriod[]>([
    {
      id: '1',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'draft',
      totalPatients: 342,
      totalAmount: 125650,
      paidAmount: 0
    },
    {
      id: '2',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'paid',
      totalPatients: 298,
      totalAmount: 112450,
      paidAmount: 112450,
      submittedDate: '2025-01-05',
      approvedDate: '2025-01-08',
      paidDate: '2025-01-10'
    },
    {
      id: '3',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      status: 'paid',
      totalPatients: 276,
      totalAmount: 98750,
      paidAmount: 98750,
      submittedDate: '2024-12-05',
      approvedDate: '2024-12-08',
      paidDate: '2024-12-15'
    }
  ])

  const generateCSV = () => {
    // Generate CSV logic
    console.log('Generating CSV report...')
  }

  const submitBilling = () => {
    // Submit billing for approval
    console.log('Submitting billing for approval...')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'approved': return <Badge>Approved</Badge>
      case 'paid': return <Badge>Paid</Badge>
      case 'disputed': return <Badge variant="destructive">Disputed</Badge>
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>
      default: return null
    }
  }

  const totalBilled = billingBreakdown.reduce((sum, item) => sum + item.totalAmount, 0)
  const averagePerPatient = currentPeriod.totalPatients > 0 ? totalBilled / currentPeriod.totalPatients : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing Management</h1>
          <p className="text-muted-foreground">
            Government billing for HIV prevention services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={submitBilling}
            disabled={currentPeriod.status !== 'draft'}
          >
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Current Billing Period */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Billing Period</CardTitle>
              <CardDescription>
                {new Date(currentPeriod.startDate).toLocaleDateString()} - {new Date(currentPeriod.endDate).toLocaleDateString()}
              </CardDescription>
            </div>
            {getStatusBadge(currentPeriod.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{currentPeriod.totalPatients}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Billed</p>
              <p className="text-2xl font-bold">₱{totalBilled.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average/Patient</p>
              <p className="text-2xl font-bold">₱{Math.round(averagePerPatient)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Possible</p>
              <p className="text-2xl font-bold">₱850</p>
              <Progress value={(averagePerPatient / 850) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Billing Breakdown</TabsTrigger>
          <TabsTrigger value="patients">Recent Patients</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of billed services for current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingBreakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell className="text-right">₱{item.unitPrice}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">₱{item.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">₱{totalBilled.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Billing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Rules</CardTitle>
              <CardDescription>
                Government-approved pricing structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Questionnaire Delivery</p>
                      <p className="text-sm text-muted-foreground">SMS risk assessment sent to patient</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">₱150</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-medium">Test Result Logged</p>
                      <p className="text-sm text-muted-foreground">HIV test result recorded in system</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">₱200</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Positive Case Starts ART</p>
                      <p className="text-sm text-muted-foreground">Patient begins antiretroviral therapy</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">₱500</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Maximum Per Patient</p>
                      <p className="text-sm text-muted-foreground">Total billable amount per patient</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">₱850</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Billings</CardTitle>
              <CardDescription>
                Individual patient charges for current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="text-center">Questionnaire</TableHead>
                    <TableHead className="text-center">Test Result</TableHead>
                    <TableHead className="text-center">ART Started</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBillings.map((billing) => (
                    <TableRow key={billing.id}>
                      <TableCell className="font-medium">{billing.patientName}</TableCell>
                      <TableCell>{billing.phoneNumber}</TableCell>
                      <TableCell className="text-center">
                        {billing.services.questionnaire && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {billing.services.testResult && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {billing.services.artStarted && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-right font-medium">₱{billing.totalAmount}</TableCell>
                      <TableCell>{new Date(billing.billingDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Previous billing periods and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Total Billed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">
                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{period.totalPatients}</TableCell>
                      <TableCell>₱{period.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(period.status)}</TableCell>
                      <TableCell>{period.submittedDate ? new Date(period.submittedDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{period.approvedDate ? new Date(period.approvedDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{period.paidDate ? new Date(period.paidDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          CSV
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete record of billing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Billing period created</p>
                    <p className="text-xs text-muted-foreground">January 1-31, 2025 • Created by Admin User</p>
                    <p className="text-xs text-muted-foreground">2025-01-01 08:00:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient billing added</p>
                    <p className="text-xs text-muted-foreground">John Doe - ₱850 • Services: Questionnaire, Test, ART</p>
                    <p className="text-xs text-muted-foreground">2025-01-10 14:30:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">CSV report generated</p>
                    <p className="text-xs text-muted-foreground">December 2024 billing • Downloaded by Finance User</p>
                    <p className="text-xs text-muted-foreground">2025-01-05 09:15:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">December 2024 billing - ₱112,450 • Reference: DOH-2024-12-001</p>
                    <p className="text-xs text-muted-foreground">2025-01-10 16:00:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}