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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  User, 
  Phone, 
  Calendar,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string
  registrationDate: string
  lastActive: string
  riskLevel?: 'low' | 'moderate' | 'high'
  testStatus?: 'not_tested' | 'negative' | 'positive'
  artStatus?: 'not_applicable' | 'not_started' | 'active' | 'defaulted'
  lastTestDate?: string
  referralCode?: string
}

export default function PatientSearchPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  // Filter states
  const [filterRisk, setFilterRisk] = useState('all')
  const [filterTestStatus, setFilterTestStatus] = useState('all')
  const [filterARTStatus, setFilterARTStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadPatients()
  }, [currentPage, filterRisk, filterTestStatus, filterARTStatus])

  const loadPatients = async () => {
    try {
      // Mock data - would be fetched from server
      const mockPatients: Patient[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '09171234567',
          dateOfBirth: '1990-05-15',
          registrationDate: '2024-11-20',
          lastActive: '2025-01-10',
          riskLevel: 'high',
          testStatus: 'positive',
          artStatus: 'active',
          lastTestDate: '2024-12-15',
          referralCode: 'REF123ABC'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '09181234567',
          registrationDate: '2024-12-01',
          lastActive: '2025-01-08',
          riskLevel: 'moderate',
          testStatus: 'negative',
          artStatus: 'not_applicable',
          lastTestDate: '2024-12-20'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          phoneNumber: '09191234567',
          dateOfBirth: '1985-08-20',
          registrationDate: '2024-10-15',
          lastActive: '2025-01-05',
          riskLevel: 'low',
          testStatus: 'not_tested',
          artStatus: 'not_applicable'
        }
      ]
      
      // Add more mock data
      for (let i = 4; i <= 50; i++) {
        mockPatients.push({
          id: i.toString(),
          firstName: `Patient${i}`,
          lastName: `Test${i}`,
          phoneNumber: `0917${1000000 + i}`,
          registrationDate: '2024-11-01',
          lastActive: '2025-01-01',
          riskLevel: ['low', 'moderate', 'high'][i % 3] as any,
          testStatus: ['not_tested', 'negative', 'positive'][i % 3] as any,
          artStatus: i % 3 === 2 ? 'active' : 'not_applicable'
        })
      }
      
      setPatients(mockPatients)
      setTotalPages(Math.ceil(mockPatients.length / itemsPerPage))
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(searchTerm) ||
      patient.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = filterRisk === 'all' || patient.riskLevel === filterRisk
    const matchesTest = filterTestStatus === 'all' || patient.testStatus === filterTestStatus
    const matchesART = filterARTStatus === 'all' || patient.artStatus === filterARTStatus
    
    return matchesSearch && matchesRisk && matchesTest && matchesART
  })

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'high': return <Badge variant="destructive">High Risk</Badge>
      case 'moderate': return <Badge variant="secondary">Moderate Risk</Badge>
      case 'low': return <Badge variant="secondary">Low Risk</Badge>
      default: return <Badge variant="outline">Not Assessed</Badge>
    }
  }

  const getTestStatusBadge = (status?: string) => {
    switch (status) {
      case 'positive': return <Badge variant="destructive">HIV Positive</Badge>
      case 'negative': return <Badge >HIV Negative</Badge>
      case 'not_tested': return <Badge variant="outline">Not Tested</Badge>
      default: return null
    }
  }

  const getARTStatusBadge = (status?: string) => {
    switch (status) {
      case 'active': return <Badge >On ART</Badge>
      case 'not_started': return <Badge variant="secondary">Not Started</Badge>
      case 'defaulted': return <Badge variant="destructive">Defaulted</Badge>
      default: return null
    }
  }

  const exportPatients = () => {
    console.log('Exporting patient data...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Search</h1>
          <p className="text-muted-foreground">
            Search and filter patient records
          </p>
        </div>
        <Button onClick={exportPatients}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>
            Find patients by name, phone number, or referral code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="moderate">Moderate Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Status</Label>
              <Select value={filterTestStatus} onValueChange={setFilterTestStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_tested">Not Tested</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ART Status</Label>
              <Select value={filterARTStatus} onValueChange={setFilterARTStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-end">
              <Button variant="outline" onClick={() => {
                setFilterRisk('all')
                setFilterTestStatus('all')
                setFilterARTStatus('all')
                setSearchTerm('')
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {filteredPatients.length} patients found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>HIV Status</TableHead>
                    <TableHead>ART Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          {patient.referralCode && (
                            <p className="text-sm text-muted-foreground">{patient.referralCode}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{new Date(patient.registrationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getRiskBadge(patient.riskLevel)}</TableCell>
                      <TableCell>{getTestStatusBadge(patient.testStatus)}</TableCell>
                      <TableCell>
                        {patient.testStatus === 'positive' && getARTStatusBadge(patient.artStatus)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete patient information and history
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <p className="font-medium">{selectedPatient.phoneNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <p className="font-medium">
                      {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Date</Label>
                    <p className="font-medium">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Assessment</Label>
                    <div>{getRiskBadge(selectedPatient.riskLevel)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>HIV Status</Label>
                    <div>{getTestStatusBadge(selectedPatient.testStatus)}</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Registration</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registered on {new Date(selectedPatient.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {selectedPatient.riskLevel && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">Risk Assessment Completed</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assessed as {selectedPatient.riskLevel} risk
                      </p>
                    </div>
                  )}
                  
                  {selectedPatient.lastTestDate && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">HIV Test</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tested on {new Date(selectedPatient.lastTestDate).toLocaleDateString()} - Result: {selectedPatient.testStatus}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2">Billing Summary</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Questionnaire Delivery</span>
                        <span>₱150</span>
                      </div>
                      {selectedPatient.testStatus !== 'not_tested' && (
                        <div className="flex justify-between">
                          <span>Test Result Logged</span>
                          <span>₱200</span>
                        </div>
                      )}
                      {selectedPatient.testStatus === 'positive' && (
                        <div className="flex justify-between">
                          <span>Positive Case (ART)</span>
                          <span>₱500</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total</span>
                        <span>
                          ₱{selectedPatient.testStatus === 'positive' ? '850' : 
                             selectedPatient.testStatus === 'not_tested' ? '150' : '350'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}