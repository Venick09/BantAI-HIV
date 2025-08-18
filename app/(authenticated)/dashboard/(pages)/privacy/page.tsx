'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Info, Shield, Lock, Eye, FileText, UserCheck, Database, Globe } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: January 10, 2025
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Your Privacy is Protected</AlertTitle>
        <AlertDescription>
          BantAI is committed to protecting your privacy and complying with RA 10173 (Data Privacy Act) 
          and RA 11166 (Philippine HIV and AIDS Policy Act). Your health information is kept strictly confidential.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="usage">Data Usage</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Overview</CardTitle>
              <CardDescription>
                How we protect your personal and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Data Encryption</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All sensitive data is encrypted using AES-256 encryption at rest and TLS 1.3 in transit
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Access Control</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Strict role-based access control ensures only authorized personnel can access your data
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Audit Trails</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All data access is logged and monitored for security and compliance purposes
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold">Consent-Based</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We only process your data with your explicit consent, which you can withdraw anytime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge  className="mt-0.5">Compliant</Badge>
                  <div>
                    <p className="font-medium">RA 11166 - Philippine HIV and AIDS Policy Act</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensures confidentiality of HIV-related information and prohibits discrimination
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge  className="mt-0.5">Compliant</Badge>
                  <div>
                    <p className="font-medium">RA 10173 - Data Privacy Act of 2012</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Protects individual personal information in information and communications systems
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
              <CardDescription>
                We collect only the minimum information necessary to provide our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Name (encrypted)</li>
                    <li>Phone number (encrypted)</li>
                    <li>Date of birth (for age verification)</li>
                    <li>Gender (optional)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Health Information</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Risk assessment responses</li>
                    <li>HIV test results (with consent)</li>
                    <li>Treatment status (for positive cases)</li>
                    <li>Medication adherence data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technical Information</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>IP address (for security)</li>
                    <li>Device information</li>
                    <li>Access timestamps</li>
                    <li>SMS delivery status</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Collect Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Direct Collection</p>
                    <p className="text-sm text-muted-foreground">
                      Information you provide during registration and risk assessment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Automated Collection</p>
                    <p className="text-sm text-muted-foreground">
                      Technical data collected for security and service improvement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <UserCheck className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Health Workers</p>
                    <p className="text-sm text-muted-foreground">
                      Test results and treatment data entered by authorized healthcare providers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
              <CardDescription>
                Your data is used only for the purposes you've consented to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Primary Purposes</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Conduct HIV risk assessments</li>
                    <li>Generate testing referrals</li>
                    <li>Track test results (with consent)</li>
                    <li>Manage ART adherence reminders</li>
                    <li>Provide health education via SMS</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Secondary Purposes</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Generate anonymized statistics for public health</li>
                    <li>Improve service quality</li>
                    <li>Comply with DOH reporting requirements</li>
                    <li>Research (with additional consent)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Limited Sharing</AlertTitle>
                <AlertDescription>
                  We never sell your personal information. Sharing is limited to essential healthcare purposes.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <p className="font-medium">We may share information with:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Healthcare providers directly involved in your care</li>
                    <li>Department of Health (anonymized data only)</li>
                    <li>Emergency contacts (in medical emergencies)</li>
                    <li>Law enforcement (only when legally required)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
              <CardDescription>
                Under Philippine law, you have specific rights regarding your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Right to Access
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of all personal data we have about you
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Right to Correction
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Request correction of any inaccurate or outdated information
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Right to Erasure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your data (with some legal exceptions)
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Right to Object
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Object to specific processing of your personal data
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Right to Data Portability
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive your data in a structured, machine-readable format
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Right to Withdraw Consent
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Withdraw consent for data processing at any time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Data Protection Officer</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Email: privacy@bantai.ph<br />
                    Phone: (02) 8888-PRIV<br />
                    Address: BantAI Office, Makati City
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">National Privacy Commission</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    For complaints or inquiries about your privacy rights<br />
                    Website: privacy.gov.ph<br />
                    Email: complaints@privacy.gov.ph
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}