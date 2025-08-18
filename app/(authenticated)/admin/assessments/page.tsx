'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  User,
  Activity,
  FileText,
  Shield
} from 'lucide-react'

interface RiskAssessment {
  id: string
  userId: string
  userName: string
  userPhone: string
  assessmentCode: string
  status: 'pending' | 'in_progress' | 'completed' | 'expired'
  deliveryMethod: 'sms' | 'web'
  startedAt: string | null
  completedAt: string | null
  expiresAt: string
  totalScore: number | null
  riskLevel: 'low' | 'moderate' | 'high' | null
  createdAt: string
  responsesCount: number
  questionsCount: number
}

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      const response = await fetch('/api/admin/assessments')
      const data = await response.json()
      if (data.success) {
        setAssessments(data.assessments)
      }
    } catch (error) {
      console.error('Failed to load assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting assessments...')
  }

  const getDateFilteredAssessments = () => {
    const now = new Date()
    let filtered = [...assessments]

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(a => {
          const created = new Date(a.createdAt)
          return created.toDateString() === now.toDateString()
        })
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(a => new Date(a.createdAt) >= weekAgo)
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(a => new Date(a.createdAt) >= monthAgo)
        break
    }

    return filtered
  }

  const filteredAssessments = getDateFilteredAssessments().filter(assessment => {
    const matchesSearch = 
      assessment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.userPhone.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter
    const matchesRisk = riskFilter === 'all' || assessment.riskLevel === riskFilter
    const matchesMethod = methodFilter === 'all' || assessment.deliveryMethod === methodFilter

    return matchesSearch && matchesStatus && matchesRisk && matchesMethod
  })

  const stats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    pending: assessments.filter(a => a.status === 'pending').length,
    inProgress: assessments.filter(a => a.status === 'in_progress').length,
    expired: assessments.filter(a => a.status === 'expired').length,
    highRisk: assessments.filter(a => a.riskLevel === 'high').length,
    moderateRisk: assessments.filter(a => a.riskLevel === 'moderate').length,
    lowRisk: assessments.filter(a => a.riskLevel === 'low').length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const getRiskBadge = (riskLevel: string | null) => {
    if (!riskLevel) return <span className="text-gray-400">-</span>
    
    switch (riskLevel) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <Shield className="h-3 w-3 mr-1" />
            High Risk
          </Badge>
        )
      case 'moderate':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-0">
            <Activity className="h-3 w-3 mr-1" />
            Moderate Risk
          </Badge>
        )
      case 'low':
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <Shield className="h-3 w-3 mr-1" />
            Low Risk
          </Badge>
        )
      default:
        return null
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'sms':
        return (
          <Badge variant="outline" className="text-xs">
            <Phone className="h-3 w-3 mr-1" />
            SMS
          </Badge>
        )
      case 'web':
        return (
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assessments</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all risk assessment data</p>
        </div>
        
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <p className="text-xs text-gray-500 mt-1">Needs immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Currently being taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Summary */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-700 font-medium">Low Risk</div>
              <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
            </div>
            <div className="flex-1 bg-orange-50 rounded-lg p-3">
              <div className="text-sm text-orange-700 font-medium">Moderate Risk</div>
              <div className="text-2xl font-bold text-orange-600">{stats.moderateRisk}</div>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-3">
              <div className="text-sm text-red-700 font-medium">High Risk</div>
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, assessment code, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="moderate">Moderate Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading assessments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Assessment Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{assessment.userName}</p>
                            <p className="text-sm text-gray-500">{assessment.userPhone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{assessment.assessmentCode}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            {assessment.responsesCount}/{assessment.questionsCount}
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${(assessment.responsesCount / assessment.questionsCount) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(assessment.riskLevel)}</TableCell>
                      <TableCell>{getMethodBadge(assessment.deliveryMethod)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(assessment.expiresAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}