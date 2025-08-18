'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Lock, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Info,
  Key,
  Eye,
  UserCheck,
  Database,
  Activity
} from 'lucide-react'

interface ComplianceItem {
  id: string
  category: string
  requirement: string
  description: string
  status: 'compliant' | 'partial' | 'non-compliant'
  priority: 'high' | 'medium' | 'low'
  lastChecked?: string
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  ipAddress: string
  status: 'success' | 'failed'
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const ra11166Requirements: ComplianceItem[] = [
    {
      id: '1',
      category: 'RA 11166',
      requirement: 'Informed Consent',
      description: 'HIV testing must be voluntary with written informed consent',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '2',
      category: 'RA 11166',
      requirement: 'Confidentiality',
      description: 'All HIV-related information must be kept strictly confidential',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '3',
      category: 'RA 11166',
      requirement: 'Non-Discrimination',
      description: 'No discrimination based on HIV status',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '4',
      category: 'RA 11166',
      requirement: 'Age of Consent',
      description: 'Minors 15+ can consent to HIV testing without parental consent',
      status: 'partial',
      priority: 'medium',
      lastChecked: '2025-01-10'
    },
    {
      id: '5',
      category: 'RA 11166',
      requirement: 'Mandatory Reporting',
      description: 'Report positive cases to DOH Epidemiology Bureau within 7 days',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    }
  ]

  const ra10173Requirements: ComplianceItem[] = [
    {
      id: '6',
      category: 'RA 10173',
      requirement: 'Data Privacy Notice',
      description: 'Clear privacy notice before data collection',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '7',
      category: 'RA 10173',
      requirement: 'Purpose Limitation',
      description: 'Data used only for declared purposes',
      status: 'compliant',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '8',
      category: 'RA 10173',
      requirement: 'Data Minimization',
      description: 'Collect only necessary personal information',
      status: 'compliant',
      priority: 'medium',
      lastChecked: '2025-01-10'
    },
    {
      id: '9',
      category: 'RA 10173',
      requirement: 'Security Measures',
      description: 'Technical and organizational security measures',
      status: 'partial',
      priority: 'high',
      lastChecked: '2025-01-10'
    },
    {
      id: '10',
      category: 'RA 10173',
      requirement: 'Rights of Data Subjects',
      description: 'Enable access, correction, and deletion rights',
      status: 'partial',
      priority: 'medium',
      lastChecked: '2025-01-10'
    }
  ]

  const securityMeasures = [
    {
      measure: 'Data Encryption at Rest',
      status: 'implemented',
      description: 'AES-256 encryption for database'
    },
    {
      measure: 'Data Encryption in Transit',
      status: 'implemented',
      description: 'TLS 1.3 for all communications'
    },
    {
      measure: 'Access Control',
      status: 'implemented',
      description: 'Role-based access control (RBAC)'
    },
    {
      measure: 'Audit Logging',
      status: 'partial',
      description: 'Comprehensive activity logging'
    },
    {
      measure: 'Data Backup',
      status: 'implemented',
      description: 'Daily encrypted backups'
    },
    {
      measure: 'Vulnerability Scanning',
      status: 'planned',
      description: 'Regular security assessments'
    }
  ]

  const recentAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2025-01-10 14:30:00',
      user: 'admin@bantai.ph',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient ID: 12345',
      ipAddress: '203.177.xxx.xxx',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-01-10 14:25:00',
      user: 'healthworker@clinic.ph',
      action: 'UPDATE_TEST_RESULT',
      resource: 'Test Result ID: 67890',
      ipAddress: '112.198.xxx.xxx',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2025-01-10 14:20:00',
      user: 'system',
      action: 'AUTOMATED_BACKUP',
      resource: 'Database',
      ipAddress: 'localhost',
      status: 'success'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
        return <Badge>Compliant</Badge>
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>
      case 'non-compliant':
      case 'planned':
        return <Badge variant="destructive">Non-Compliant</Badge>
      default:
        return null
    }
  }

  const calculateComplianceScore = () => {
    const allRequirements = [...ra11166Requirements, ...ra10173Requirements]
    const compliant = allRequirements.filter(r => r.status === 'compliant').length
    return Math.round((compliant / allRequirements.length) * 100)
  }

  const complianceScore = calculateComplianceScore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance & Security</h1>
        <p className="text-muted-foreground">
          Regulatory compliance and security management
        </p>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RA 11166 Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ra11166Requirements.filter(r => r.status === 'compliant').length}/
              {ra11166Requirements.length}
            </div>
            <p className="text-xs text-muted-foreground">Requirements met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RA 10173 Status</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ra10173Requirements.filter(r => r.status === 'compliant').length}/
              {ra10173Requirements.length}
            </div>
            <p className="text-xs text-muted-foreground">Requirements met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMeasures.filter(m => m.status === 'implemented').length}/
              {securityMeasures.length}
            </div>
            <p className="text-xs text-muted-foreground">Measures implemented</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ra11166">RA 11166 (HIV Act)</TabsTrigger>
          <TabsTrigger value="ra10173">RA 10173 (Privacy Act)</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Compliance Status</AlertTitle>
            <AlertDescription>
              Your system is {complianceScore}% compliant with Philippine regulations. 
              Review partial and non-compliant items to achieve full compliance.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Critical Compliance Items</CardTitle>
              <CardDescription>
                High-priority items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...ra11166Requirements, ...ra10173Requirements]
                  .filter(r => r.priority === 'high' && r.status !== 'compliant')
                  .map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.requirement}</p>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.category} • Last checked: {item.lastChecked}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ra11166" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RA 11166 - Philippine HIV and AIDS Policy Act</CardTitle>
              <CardDescription>
                Compliance with HIV-specific regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ra11166Requirements.map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.status === 'compliant' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <p className="font-medium">{item.requirement}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-7">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Provisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Informed Consent Requirements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Written consent required before HIV testing</li>
                  <li>Pre-test and post-test counseling mandatory</li>
                  <li>Consent forms must be in language understood by patient</li>
                  <li>Minors 15+ can consent independently</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confidentiality Obligations
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>HIV status is strictly confidential information</li>
                  <li>Disclosure only with written consent</li>
                  <li>Exceptions: healthcare providers directly involved in care</li>
                  <li>Breach of confidentiality is criminally punishable</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ra10173" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RA 10173 - Data Privacy Act of 2012</CardTitle>
              <CardDescription>
                Compliance with data protection regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ra10173Requirements.map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.status === 'compliant' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <p className="font-medium">{item.requirement}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-7">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Subject Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Right to Access
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patients can request copies of their personal data
                  </p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Right to Correction
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patients can request correction of inaccurate data
                  </p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Right to Object
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patients can object to certain data processing
                  </p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Right to Erasure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patients can request deletion under certain conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Measures</CardTitle>
              <CardDescription>
                Technical and organizational security controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityMeasures.map((measure, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {measure.status === 'implemented' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : measure.status === 'partial' ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <p className="font-medium">{measure.measure}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-7">{measure.description}</p>
                    </div>
                    {getStatusBadge(measure.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Encryption Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Database Encryption</p>
                      <p className="text-sm text-muted-foreground">AES-256-GCM at rest</p>
                    </div>
                  </div>
                  <Badge >Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Transport Security</p>
                      <p className="text-sm text-muted-foreground">TLS 1.3 minimum</p>
                    </div>
                  </div>
                  <Badge >Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Key Management</p>
                      <p className="text-sm text-muted-foreground">HSM-backed key storage</p>
                    </div>
                  </div>
                  <Badge >Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>
                System activity and access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAuditLogs.map(log => (
                  <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{log.action}</p>
                        {log.status === 'success' ? (
                          <Badge  className="text-xs">Success</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Failed</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 ml-6 space-y-1">
                        <p>User: {log.user}</p>
                        <p>Resource: {log.resource}</p>
                        <p>IP: {log.ipAddress} • {log.timestamp}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Details</Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing recent 3 entries
                </p>
                <Button variant="outline" size="sm">
                  View All Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Log Retention Period</p>
                    <p className="text-sm text-muted-foreground">Keep logs for compliance</p>
                  </div>
                  <Badge>2 Years</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Log Level</p>
                    <p className="text-sm text-muted-foreground">Detail level of logging</p>
                  </div>
                  <Badge>Comprehensive</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Format</p>
                    <p className="text-sm text-muted-foreground">For compliance reporting</p>
                  </div>
                  <Badge>CSV, JSON</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}