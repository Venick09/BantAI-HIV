'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Clock,
  Languages
} from 'lucide-react'
import { startRiskAssessment, submitRiskResponse, completeRiskAssessment } from '@/actions/risk-assessment'
import { ensureUserExists } from '@/actions/users'

interface Question {
  id: string
  questionText: string
  questionTextTagalog: string
}

interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high'
  totalScore: number
  referralCode?: string
  description: string
}

export default function RiskAssessmentPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'start' | 'questions' | 'result'>('start')
  
  // Assessment state
  const [assessmentId, setAssessmentId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [language, setLanguage] = useState<'en' | 'tl'>('en')

  const handleStartAssessment = async () => {
    setLoading(true)
    setError('')
    
    if (!user?.id) {
      setError('User not authenticated')
      setLoading(false)
      return
    }
    
    // Ensure user exists in our database
    const dbUser = await ensureUserExists(user.id)
    
    if (!dbUser || !dbUser.id) {
      setError('Failed to create user record. Please try again.')
      setLoading(false)
      return
    }
    
    const result = await startRiskAssessment(dbUser.id)
    
    if (result.success && result.assessmentId && result.questions) {
      setAssessmentId(result.assessmentId)
      setQuestions(result.questions)
      setStep('questions')
    } else {
      setError(result.error || 'Failed to start assessment')
    }
    
    setLoading(false)
  }

  const handleSubmitResponse = async (response: string) => {
    setLoading(true)
    setError('')
    
    const currentQuestion = questions[currentQuestionIndex]
    
    // Save response
    const result = await submitRiskResponse(
      assessmentId,
      currentQuestion.id,
      response
    )
    
    if (result.success) {
      setResponses({
        ...responses,
        [currentQuestion.id]: response
      })
      
      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // Complete assessment
        await handleCompleteAssessment()
      }
    } else {
      setError(result.error || 'Failed to submit response')
    }
    
    setLoading(false)
  }

  const handleCompleteAssessment = async () => {
    const result = await completeRiskAssessment(assessmentId)
    
    if (result.success && result.riskLevel) {
      setResult({
        riskLevel: result.riskLevel,
        totalScore: result.totalScore || 0,
        referralCode: result.referralCode,
        description: result.description || ''
      })
      setStep('result')
    } else {
      setError(result.error || 'Failed to complete assessment')
    }
  }

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50',
          icon: <Shield className="h-6 w-6 text-green-600" />,
          title: 'Low Risk',
          action: 'Stay informed and protected'
        }
      case 'moderate':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50',
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          title: 'Moderate Risk',
          action: 'Consider getting tested'
        }
      case 'high':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50',
          icon: <AlertCircle className="h-6 w-6 text-red-600" />,
          title: 'High Risk',
          action: 'Testing recommended soon'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50',
          icon: <AlertCircle className="h-6 w-6" />,
          title: 'Risk Level',
          action: 'Complete assessment'
        }
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        {step !== 'result' && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">HIV Risk Assessment</h1>
            <p className="text-gray-600 mt-2">Private • Confidential • Free</p>
          </div>
        )}

        {/* Start Screen */}
        {step === 'start' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">100% Confidential</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your answers are encrypted and protected by law. No personal information is shared.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Quick & Easy</p>
                    <p className="text-sm text-green-700 mt-1">
                      Just 7 simple yes/no questions. Takes less than 5 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <Languages className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-purple-900">Bilingual Support</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Available in English and Tagalog. Switch languages anytime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleStartAssessment} 
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  size="lg"
                >
                  {loading ? 'Starting...' : 'Begin Assessment'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  You can only take this assessment once every 30 days
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {step === 'questions' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'tl' : 'en')}
                  className="text-gray-600"
                >
                  {language === 'en' ? '🇵🇭 Tagalog' : '🇬🇧 English'}
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                  {language === 'en' 
                    ? currentQuestion.questionText 
                    : currentQuestion.questionTextTagalog}
                </h2>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleSubmitResponse('yes')}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-6 text-lg hover:bg-green-50 hover:border-green-300"
                  >
                    {language === 'en' ? 'Yes' : 'Oo'}
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmitResponse('no')}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-6 text-lg hover:bg-red-50 hover:border-red-300"
                  >
                    {language === 'en' ? 'No' : 'Hindi'}
                  </Button>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-500"
                  >
                    Save for Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className={`h-2 ${getRiskLevelInfo(result.riskLevel).color}`}></div>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full mb-6"
                     style={{ backgroundColor: getRiskLevelInfo(result.riskLevel).bgColor }}>
                  {getRiskLevelInfo(result.riskLevel).icon}
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Assessment Complete
                </h2>
                
                <Badge className={`text-lg px-6 py-2 mb-6 ${getRiskLevelInfo(result.riskLevel).color}`}>
                  {getRiskLevelInfo(result.riskLevel).title}
                </Badge>
                
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {result.description}
                </p>

                {result.referralCode && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                    <p className="text-3xl font-mono font-bold text-gray-900">
                      {result.referralCode}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Show this code for priority testing
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {result.riskLevel !== 'low' && (
                    <Button 
                      onClick={() => router.push('/dashboard/test-centers')}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      size="lg"
                    >
                      Find Testing Centers
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="w-full"
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Recommended Next Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-gray-600">
                      {getRiskLevelInfo(result.riskLevel).action}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-gray-600">
                      Practice safe behaviors and prevention methods
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-gray-600">
                      Retake assessment in 30 days if needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}