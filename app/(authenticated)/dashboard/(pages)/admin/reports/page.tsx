'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart,
  Clock
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'operational' | 'financial' | 'clinical' | 'compliance'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  lastGenerated?: string
}

interface PerformanceMetric {
  metric: string
  target: number
  actual: number
  trend: 'up' | 'down' | 'stable'
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [generating, setGenerating] = useState(false)

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'DOH Monthly Submission',
      description: 'Standard monthly report for Department of Health',
      category: 'compliance',
      frequency: 'monthly',
      lastGenerated: '2025-01-05'
    },
    {
      id: '2',
      name: 'HIV Program Indicators',
      description: 'Key performance indicators for HIV prevention program',
      category: 'clinical',
      frequency: 'quarterly',
      lastGenerated: '2024-12-31'
    },
    {
      id: '3',
      name: 'Testing Coverage Report',
      description: 'Geographic and demographic testing coverage analysis',
      category: 'operational',
      frequency: 'monthly',
      lastGenerated: '2025-01-01'
    },
    {
      id: '4',
      name: 'Financial Summary',
      description: 'Billing and revenue summary report',
      category: 'financial',
      frequency: 'monthly',
      lastGenerated: '2025-01-05'
    },
    {
      id: '5',
      name: 'Patient Outcomes Report',
      description: 'Treatment adherence and viral suppression rates',
      category: 'clinical',
      frequency: 'quarterly'
    },
    {
      id: '6',
      name: 'SMS Performance Report',
      description: 'SMS delivery rates and response analytics',
      category: 'operational',
      frequency: 'weekly',
      lastGenerated: '2025-01-08'
    }
  ]

  const performanceMetrics: PerformanceMetric[] = [
    {
      metric: 'Testing Rate',
      target: 95,
      actual: 78.5,
      trend: 'up'
    },
    {
      metric: 'Linkage to Care',
      target: 95,
      actual: 92.3,
      trend: 'stable'
    },
    {
      metric: 'Viral Suppression',
      target: 95,
      actual: 89.7,
      trend: 'up'
    },
    {
      metric: 'SMS Delivery Rate',
      target: 98,
      actual: 99.2,
      trend: 'stable'
    },
    {
      metric: 'Adherence Rate',
      target: 90,
      actual: 86.5,
      trend: 'down'
    }
  ]

  const handleGenerateReport = async () => {
    if (!reportType) return
    
    setGenerating(true)
    try {
      // Generate report logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Generating report:', { reportType, dateRange, startDate, endDate })
    } finally {
      setGenerating(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'operational': return <Badge variant="default">Operational</Badge>
      case 'financial': return <Badge variant="secondary">Financial</Badge>
      case 'clinical': return <Badge >Clinical</Badge>
      case 'compliance': return <Badge variant="secondary">Compliance</Badge>
      default: return null
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Badge variant="outline">Daily</Badge>
      case 'weekly': return <Badge variant="outline">Weekly</Badge>
      case 'monthly': return <Badge variant="outline">Monthly</Badge>
      case 'quarterly': return <Badge variant="outline">Quarterly</Badge>
      case 'annual': return <Badge variant="outline">Annual</Badge>
      default: return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate comprehensive reports for program monitoring and compliance
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <CardDescription>
                Select report type and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dateRange === 'custom' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker date={startDate} onSelect={setStartDate} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker date={endDate} onSelect={setEndDate} />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!reportType || generating}
                  className="w-full md:w-auto"
                >
                  {generating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                {reportType && (
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 95-95-95 Progress */}
          <Card>
            <CardHeader>
              <CardTitle>95-95-95 Target Progress</CardTitle>
              <CardDescription>
                UNAIDS targets for ending the HIV epidemic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">95% of people with HIV know their status</span>
                    <span className="text-sm font-bold">78.5%</span>
                  </div>
                  <Progress value={78.5} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">95% of diagnosed receive sustained ART</span>
                    <span className="text-sm font-bold">92.3%</span>
                  </div>
                  <Progress value={92.3} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">95% on ART achieve viral suppression</span>
                    <span className="text-sm font-bold">89.7%</span>
                  </div>
                  <Progress value={89.7} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
              <CardDescription>
                Pre-configured reports for common requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {reportTemplates.map(template => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryBadge(template.category)}
                        {getFrequencyBadge(template.frequency)}
                      </div>
                      {template.lastGenerated && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Generate
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Program performance against targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{metric.metric}</p>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={(metric.actual / metric.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold">{metric.actual}%</p>
                      <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Targets Met</p>
                  <p className="text-2xl font-bold">2 of 5</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Improving</p>
                  <p className="text-2xl font-bold">3 metrics</p>
                </div>
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                  <p className="text-2xl font-bold">2 metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated report generation schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">DOH Monthly Submission</p>
                    <p className="text-sm text-muted-foreground">
                      Every 5th of the month at 09:00 AM
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Weekly SMS Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Every Monday at 08:00 AM
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Quarterly Clinical Outcomes</p>
                    <p className="text-sm text-muted-foreground">
                      1st day of quarter at 10:00 AM
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Add Scheduled Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}