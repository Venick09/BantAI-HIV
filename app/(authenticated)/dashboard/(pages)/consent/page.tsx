'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  XCircle,
  Info,
  Download,
  Eye,
  History,
  UserCheck
} from 'lucide-react'

interface ConsentRecord {
  id: string
  type: 'hiv_testing' | 'data_processing' | 'sms_communication' | 'treatment'
  status: 'active' | 'withdrawn' | 'expired'
  grantedDate: string
  expiryDate?: string
  withdrawnDate?: string
  version: string
}

interface ConsentTemplate {
  id: string
  type: string
  title: string
  description: string
  version: string
  lastUpdated: string
  mandatoryFields: string[]
}

export default function ConsentManagementPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>([
    {
      id: '1',
      type: 'hiv_testing',
      status: 'active',
      grantedDate: '2024-11-20',
      version: '2.0'
    },
    {
      id: '2',
      type: 'data_processing',
      status: 'active',
      grantedDate: '2024-11-20',
      version: '1.5'
    },
    {
      id: '3',
      type: 'sms_communication',
      status: 'active',
      grantedDate: '2024-11-20',
      version: '1.0'
    }
  ])

  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [selectedConsent, setSelectedConsent] = useState<string>('')
  const [consentChecks, setConsentChecks] = useState({
    understand: false,
    voluntary: false,
    withdraw: false,
    dataUse: false
  })

  const consentTemplates: ConsentTemplate[] = [
    {
      id: 'hiv_testing',
      type: 'hiv_testing',
      title: 'HIV Testing Consent',
      description: 'Consent for HIV testing with pre and post-test counseling',
      version: '2.0',
      lastUpdated: '2024-10-01',
      mandatoryFields: ['Full understanding', 'Voluntary decision', 'Right to withdraw', 'Confidentiality']
    },
    {
      id: 'data_processing',
      type: 'data_processing',
      title: 'Data Processing Consent',
      description: 'Consent for collection and processing of personal health information',
      version: '1.5',
      lastUpdated: '2024-09-15',
      mandatoryFields: ['Purpose of processing', 'Data retention', 'Third party sharing', 'Rights']
    },
    {
      id: 'sms_communication',
      type: 'sms_communication',
      title: 'SMS Communication Consent',
      description: 'Consent to receive SMS for health reminders and notifications',
      version: '1.0',
      lastUpdated: '2024-08-01',
      mandatoryFields: ['Message frequency', 'Opt-out mechanism', 'Data charges']
    },
    {
      id: 'treatment',
      type: 'treatment',
      title: 'Treatment Consent',
      description: 'Consent for antiretroviral therapy and ongoing care',
      version: '1.2',
      lastUpdated: '2024-09-01',
      mandatoryFields: ['Treatment plan', 'Side effects', 'Adherence requirements', 'Follow-up']
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge >Active</Badge>
      case 'withdrawn': return <Badge variant="destructive">Withdrawn</Badge>
      case 'expired': return <Badge variant="secondary">Expired</Badge>
      default: return null
    }
  }

  const getConsentIcon = (type: string) => {
    switch (type) {
      case 'hiv_testing': return '🩺'
      case 'data_processing': return '📊'
      case 'sms_communication': return '📱'
      case 'treatment': return '💊'
      default: return '📄'
    }
  }

  const handleGrantConsent = () => {
    if (!selectedConsent) return
    
    const allChecked = Object.values(consentChecks).every(v => v)
    if (!allChecked) {
      alert('Please acknowledge all consent requirements')
      return
    }

    // Add new consent
    const newConsent: ConsentRecord = {
      id: Date.now().toString(),
      type: selectedConsent as any,
      status: 'active',
      grantedDate: new Date().toISOString().split('T')[0],
      version: consentTemplates.find(t => t.type === selectedConsent)?.version || '1.0'
    }

    setConsents([...consents, newConsent])
    setShowConsentDialog(false)
    setSelectedConsent('')
    setConsentChecks({
      understand: false,
      voluntary: false,
      withdraw: false,
      dataUse: false
    })
  }

  const handleWithdrawConsent = (consentId: string) => {
    setConsents(consents.map(c => 
      c.id === consentId 
        ? { ...c, status: 'withdrawn', withdrawnDate: new Date().toISOString().split('T')[0] }
        : c
    ))
  }

  const activeConsents = consents.filter(c => c.status === 'active')
  const withdrawnConsents = consents.filter(c => c.status === 'withdrawn')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consent Management</h1>
        <p className="text-muted-foreground">
          Manage your privacy preferences and consent records
        </p>
      </div>

      {/* Consent Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConsents.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawnConsents.length}</div>
            <p className="text-xs text-muted-foreground">Consent withdrawn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Nov 20, 2024</div>
            <p className="text-xs text-muted-foreground">Most recent consent</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Your Privacy Rights</AlertTitle>
        <AlertDescription>
          Under RA 10173 (Data Privacy Act), you have the right to access, correct, and object to the processing of your personal data. 
          You may withdraw consent at any time, though this may affect our ability to provide certain services.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Consents</TabsTrigger>
          <TabsTrigger value="available">Available Consents</TabsTrigger>
          <TabsTrigger value="history">Consent History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Consents</CardTitle>
              <CardDescription>
                Consents you have granted for data processing and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeConsents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No active consents found
                </p>
              ) : (
                <div className="space-y-4">
                  {activeConsents.map(consent => {
                    const template = consentTemplates.find(t => t.type === consent.type)
                    return (
                      <div key={consent.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getConsentIcon(consent.type)}</span>
                            <div>
                              <h4 className="font-semibold">{template?.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {template?.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Granted: {new Date(consent.grantedDate).toLocaleDateString()}</span>
                                <span>Version: {consent.version}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(consent.status)}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleWithdrawConsent(consent.id)}
                            >
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Consent Forms</CardTitle>
              <CardDescription>
                Review and grant consent for specific data processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {consentTemplates.map(template => {
                  const isActive = activeConsents.some(c => c.type === template.type)
                  return (
                    <Card key={template.id} className={isActive ? 'opacity-60' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getConsentIcon(template.type)}</span>
                            <div>
                              <CardTitle className="text-base">{template.title}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {template.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-xs text-muted-foreground">
                            <p>Version: {template.version}</p>
                            <p>Updated: {new Date(template.lastUpdated).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              disabled={isActive}
                              onClick={() => {
                                setSelectedConsent(template.type)
                                setShowConsentDialog(true)
                              }}
                            >
                              {isActive ? 'Already Granted' : 'Grant Consent'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent History</CardTitle>
              <CardDescription>
                Complete record of all consent activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consents.map(consent => {
                  const template = consentTemplates.find(t => t.type === consent.type)
                  return (
                    <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getConsentIcon(consent.type)}</span>
                        <div>
                          <p className="font-medium">{template?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Granted: {new Date(consent.grantedDate).toLocaleDateString()}
                            {consent.withdrawnDate && ` • Withdrawn: ${new Date(consent.withdrawnDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(consent.status)}
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Subject Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Request Copy of My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Request Data Correction
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Request Data Deletion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grant Consent</DialogTitle>
            <DialogDescription>
              Please review and acknowledge the following before granting consent
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsent && (
            <div className="space-y-4 py-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>
                  {consentTemplates.find(t => t.type === selectedConsent)?.title}
                </AlertTitle>
                <AlertDescription>
                  {consentTemplates.find(t => t.type === selectedConsent)?.description}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="understand"
                    checked={consentChecks.understand}
                    onCheckedChange={(checked) => 
                      setConsentChecks({...consentChecks, understand: checked as boolean})
                    }
                  />
                  <Label htmlFor="understand" className="text-sm">
                    I understand the purpose and scope of this consent
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="voluntary"
                    checked={consentChecks.voluntary}
                    onCheckedChange={(checked) => 
                      setConsentChecks({...consentChecks, voluntary: checked as boolean})
                    }
                  />
                  <Label htmlFor="voluntary" className="text-sm">
                    I am providing this consent voluntarily without coercion
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="withdraw"
                    checked={consentChecks.withdraw}
                    onCheckedChange={(checked) => 
                      setConsentChecks({...consentChecks, withdraw: checked as boolean})
                    }
                  />
                  <Label htmlFor="withdraw" className="text-sm">
                    I understand I can withdraw this consent at any time
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="dataUse"
                    checked={consentChecks.dataUse}
                    onCheckedChange={(checked) => 
                      setConsentChecks({...consentChecks, dataUse: checked as boolean})
                    }
                  />
                  <Label htmlFor="dataUse" className="text-sm">
                    I agree to the specified use of my personal data
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantConsent}>
              Grant Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}