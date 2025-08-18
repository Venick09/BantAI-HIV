'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/db'
import { testResults, users, referrals } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

interface PendingResult {
  id: string
  referralCode: string
  patientName: string
  testDate: string
  testType: string
  result: string
  daysPending: number
}

export default function PendingResultsPage() {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingResults()
  }, [])

  const loadPendingResults = async () => {
    try {
      // This would typically be a server action
      // For now, showing the structure
      const mockData: PendingResult[] = [
        {
          id: '1',
          referralCode: 'REF123ABC',
          patientName: 'John Doe',
          testDate: '2025-01-10',
          testType: 'rapid',
          result: 'positive',
          daysPending: 2
        },
        {
          id: '2',
          referralCode: 'REF456DEF',
          patientName: 'Jane Smith',
          testDate: '2025-01-09',
          testType: 'elisa',
          result: 'positive',
          daysPending: 3
        }
      ]
      setPendingResults(mockData)
    } catch (error) {
      console.error('Error loading pending results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadge = (days: number) => {
    if (days >= 3) return <Badge variant="destructive">High Priority</Badge>
    if (days >= 2) return <Badge variant="secondary">Medium Priority</Badge>
    return <Badge variant="secondary">Low Priority</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading pending results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/test-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Pending Test Results</h1>
          <p className="text-muted-foreground">
            Positive results requiring confirmation
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingResults.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingResults.filter(r => r.daysPending >= 3).length}
            </div>
            <p className="text-xs text-muted-foreground">3+ days pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Pending</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingResults.filter(r => r.testDate === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">From today's tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Confirmations</CardTitle>
          <CardDescription>
            All positive results require confirmation before notifying patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Date</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.referralCode}</TableCell>
                    <TableCell>{result.patientName}</TableCell>
                    <TableCell>{new Date(result.testDate).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{result.testType}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{result.result.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(result.daysPending)}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/test-center/referral/${result.referralCode}`}>
                        <Button size="sm">Review</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">
                No pending test results requiring confirmation
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>All positive results must be confirmed within 72 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Confirmatory testing should use a different test method when possible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Ensure proper post-test counseling is provided before result disclosure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Document all confirmation steps in the patient record</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}