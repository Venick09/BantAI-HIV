'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Phone,
  Loader2
} from 'lucide-react'
import { getUserTestResults, downloadTestResult, getPendingReferrals } from '@/actions/test-results'
import { useRouter } from 'next/navigation'

interface TestResult {
  id: string
  testDate: string
  testType: string
  result: 'positive' | 'negative' | 'inconclusive'
  referralCode: string
  testCenter: {
    id: string
    name: string
    address: string
    city: string
    province: string
  }
  isConfirmed: boolean
  resultDate?: string
  notes?: string
  createdAt: Date
}

interface PendingReferral {
  id: string
  referralCode: string
  status: string
  createdAt: Date
  expiresAt: Date
  riskLevel: string
  assessmentDate: Date
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [pendingReferrals, setPendingReferrals] = useState<PendingReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load both test results and pending referrals
      const [resultsResponse, referralsResponse] = await Promise.all([
        getUserTestResults(),
        getPendingReferrals()
      ])
      
      if (resultsResponse.success && resultsResponse.results) {
        setResults(resultsResponse.results as TestResult[])
      }
      
      if (referralsResponse.success && referralsResponse.referrals) {
        setPendingReferrals(referralsResponse.referrals as PendingReferral[])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (result: TestResult) => {
    setDownloadingId(result.id)
    try {
      const response = await downloadTestResult(result.id)
      if (response.success && response.data) {
        // Create a text file with the result data
        const content = `
HIV TEST RESULT CERTIFICATE
===========================

Patient Information
------------------
Name: ${response.data.patientName}
Referral Code: ${response.data.referralCode}

Test Information
---------------
Test Date: ${new Date(response.data.testDate).toLocaleDateString()}
Test Type: ${response.data.testType}
Test Center: ${response.data.testCenter}

Result
------
Status: ${response.data.result.toUpperCase()}
Result Date: ${new Date(response.data.resultDate).toLocaleDateString()}
Confirmed: ${response.data.isConfirmed ? 'Yes' : 'Pending'}

IMPORTANT NOTICE
----------------
This is an official HIV test result certificate. 
This document is confidential and protected under RA 11166.

For verification, please contact the test center or call 1-800-HIV-HELP.

Generated on: ${new Date().toLocaleString()}
        `.trim()

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `HIV_Test_Result_${response.data.referralCode}_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download result:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result)
    setShowDetails(true)
  }

  const getResultInfo = (result: string) => {
    switch (result) {
      case 'negative':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          badge: 'bg-green-100 text-green-700 border-0',
          message: 'No HIV detected'
        }
      case 'positive':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-600" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          badge: 'bg-red-100 text-red-700 border-0',
          message: 'Follow-up required'
        }
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700 border-0',
          message: 'Retest needed'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Test Results</h1>
              <p className="text-gray-600">View and download your HIV test results</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ) : results.length === 0 && pendingReferrals.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your test results will appear here after you've been tested at one of our partner centers.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/dashboard/risk-assessment'}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Take Risk Assessment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/test-centers'}
                >
                  Find Test Centers
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Referrals Section */}
            {pendingReferrals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Test Referrals</h2>
                <div className="space-y-4">
                  {pendingReferrals.map((referral) => (
                    <Card key={referral.id} className="border-0 shadow-sm bg-yellow-50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">Awaiting Test</h3>
                              <Badge className={`${
                                referral.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                                referral.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-green-100 text-green-700'
                              } border-0`}>
                                {referral.riskLevel.charAt(0).toUpperCase() + referral.riskLevel.slice(1)} Risk
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">Referral Code: <span className="font-mono text-gray-900">{referral.referralCode}</span></span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Assessment Date: {new Date(referral.assessmentDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Expires: {new Date(referral.expiresAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Next Step:</strong> Visit any testing center with this referral code for free HIV testing. 
                                Your code gives you priority service.
                              </p>
                            </div>

                            <Button 
                              onClick={() => router.push('/dashboard/test-centers')}
                              size="sm"
                              className="mt-4"
                            >
                              Find Testing Centers
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {results.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Completed Test Results</h2>
                )}
              </div>
            )}

            {/* Results List */}
            {results.map((result) => {
              const resultInfo = getResultInfo(result.result)
              return (
                <Card key={result.id} className="border-0 shadow-sm overflow-hidden">
                  <div className={`h-2 ${resultInfo.bgColor}`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Result Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${resultInfo.bgColor}`}>
                            {resultInfo.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {result.testType}
                              </h3>
                              <Badge className={resultInfo.badge}>
                                {resultInfo.message}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Test Date: {new Date(result.testDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>Referral Code: {result.referralCode}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span>{result.testCenter.name}, {result.testCenter.address}</span>
                              </div>
                              
                              {result.isConfirmed && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium">Result Confirmed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:w-full"
                          onClick={() => handleViewDetails(result)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:w-full"
                          onClick={() => handleDownload(result)}
                          disabled={downloadingId === result.id}
                        >
                          {downloadingId === result.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Result-specific messages */}
                    {result.result === 'negative' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Good news!</strong> Your test showed no HIV detected. Continue practicing safe behaviors 
                          and consider regular testing every 3-6 months if you're at ongoing risk.
                        </p>
                      </div>
                    )}

                    {result.result === 'positive' && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 mb-3">
                          <strong>Important:</strong> Please contact the test center immediately for counseling and 
                          treatment options. Early treatment leads to better health outcomes.
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => window.location.href = 'tel:1800HIVHELP'}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Support Hotline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* Information Cards */}
            <div className="grid gap-4 md:grid-cols-2 mt-8">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                      <p className="text-sm text-gray-600">
                        All test results are strictly confidential and protected under RA 11166. 
                        Only you can access or share your results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Regular Testing</h3>
                      <p className="text-sm text-gray-600">
                        Regular testing is recommended every 3-6 months if you're at ongoing risk. 
                        Early detection saves lives.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetails && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold">Test Result Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedResult(null)
                    }}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Result Status */}
                  <div className={`p-4 rounded-lg ${getResultInfo(selectedResult.result).bgColor} border ${getResultInfo(selectedResult.result).borderColor}`}>
                    <div className="flex items-center gap-3">
                      {getResultInfo(selectedResult.result).icon}
                      <div>
                        <p className={`font-semibold ${getResultInfo(selectedResult.result).textColor}`}>
                          Test Result: {selectedResult.result.toUpperCase()}
                        </p>
                        <p className={`text-sm ${getResultInfo(selectedResult.result).textColor}`}>
                          {getResultInfo(selectedResult.result).message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Test Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Test Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Test Type:</span>
                        <span className="font-medium">{selectedResult.testType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Test Date:</span>
                        <span className="font-medium">{new Date(selectedResult.testDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Referral Code:</span>
                        <span className="font-medium font-mono">{selectedResult.referralCode}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedResult.isConfirmed ? (
                            <Badge className="bg-green-100 text-green-700 border-0">Confirmed</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test Center */}
                  <div>
                    <h3 className="font-semibold mb-3">Test Center</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedResult.testCenter.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedResult.testCenter.address}</p>
                      <p className="text-sm text-gray-600">{selectedResult.testCenter.city}, {selectedResult.testCenter.province}</p>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {selectedResult.notes && (
                    <div>
                      <h3 className="font-semibold mb-3">Additional Notes</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {selectedResult.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={() => handleDownload(selectedResult)}
                      disabled={downloadingId === selectedResult.id}
                    >
                      {downloadingId === selectedResult.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download Certificate
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowDetails(false)
                        setSelectedResult(null)
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}