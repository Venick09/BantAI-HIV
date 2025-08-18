'use server'

import { db } from '@/db'
import { 
  riskAssessments, 
  riskQuestions, 
  riskResponses, 
  riskScoringRules,
  riskMessageTemplates,
  referrals,
  testCenters,
  users,
  billingEvents
} from '@/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { SMSService } from '@/lib/sms/sms-service'
import { RiskMessagingService } from '@/lib/services/risk-messaging.service'
import { QRCodeService } from '@/lib/services/qr-code.service'
import { nanoid } from 'nanoid'

export async function startRiskAssessment(userId: string) {
  try {
    // Check if user has a recent assessment (within 30 days)
    const recentAssessment = await db
      .select()
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.userId, userId),
          gte(riskAssessments.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(riskAssessments.createdAt))
      .limit(1)

    if (recentAssessment.length > 0) {
      return { 
        success: false, 
        error: 'You have already completed an assessment recently. Please wait 30 days before taking another.' 
      }
    }

    // Create new assessment
    const assessmentCode = `RA${nanoid(8).toUpperCase()}`
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    const [assessment] = await db
      .insert(riskAssessments)
      .values({
        userId,
        assessmentCode,
        status: 'pending',
        deliveryMethod: 'web',
        expiresAt
      })
      .returning()

    // Get all active questions
    const questions = await db
      .select()
      .from(riskQuestions)
      .where(eq(riskQuestions.isActive, true))
      .orderBy(riskQuestions.orderIndex)

    return { 
      success: true, 
      assessmentId: assessment.id,
      assessmentCode: assessment.assessmentCode,
      questions 
    }
  } catch (error) {
    console.error('Start risk assessment error:', error)
    return { success: false, error: 'Failed to start assessment' }
  }
}

export async function submitRiskResponse(
  assessmentId: string,
  questionId: string,
  response: string
) {
  try {
    // Get question to calculate score
    const [question] = await db
      .select()
      .from(riskQuestions)
      .where(eq(riskQuestions.id, questionId))
      .limit(1)

    if (!question) {
      return { success: false, error: 'Invalid question' }
    }

    // Calculate score based on response
    let score = 0
    if (response.toLowerCase() === 'yes') {
      score = question.weight
    } else if (response.toLowerCase() === 'no') {
      score = 0
    }

    // Save response
    await db.insert(riskResponses).values({
      assessmentId,
      questionId,
      response,
      score,
      responseMethod: 'web'
    })

    // Update assessment status
    await db
      .update(riskAssessments)
      .set({ 
        status: 'in_progress',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(riskAssessments.id, assessmentId))

    return { success: true, score }
  } catch (error) {
    console.error('Submit risk response error:', error)
    return { success: false, error: 'Failed to submit response' }
  }
}

export async function completeRiskAssessment(assessmentId: string) {
  try {
    // Calculate total score
    const responses = await db
      .select()
      .from(riskResponses)
      .where(eq(riskResponses.assessmentId, assessmentId))

    const totalScore = responses.reduce((sum, r) => sum + r.score, 0)

    // Determine risk level
    const [scoringRule] = await db
      .select()
      .from(riskScoringRules)
      .where(
        and(
          lte(riskScoringRules.minScore, totalScore),
          gte(riskScoringRules.maxScore, totalScore),
          eq(riskScoringRules.isActive, true)
        )
      )
      .limit(1)

    if (!scoringRule) {
      return { success: false, error: 'Unable to determine risk level' }
    }

    // Update assessment
    const [assessment] = await db
      .update(riskAssessments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        riskLevel: scoringRule.riskLevel,
        updatedAt: new Date()
      })
      .where(eq(riskAssessments.id, assessmentId))
      .returning()

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, assessment.userId))
      .limit(1)

    // Create referral if moderate or high risk
    let referral: typeof referrals.$inferSelect | null = null
    if (scoringRule.riskLevel !== 'low') {
      // Get nearest test center (for now, just get the first active one)
      const [testCenter] = await db
        .select()
        .from(testCenters)
        .where(eq(testCenters.isActive, true))
        .limit(1)

      if (testCenter) {
        const referralCode = `REF${nanoid(6).toUpperCase()}`
        const referralExpiry = new Date()
        referralExpiry.setDate(referralExpiry.getDate() + 30) // 30 day expiry

        const [newReferral] = await db
          .insert(referrals)
          .values({
            referralCode,
            userId: assessment.userId,
            assessmentId,
            testCenterId: testCenter.id,
            status: 'pending',
            expiresAt: referralExpiry
          })
          .returning()
        
        referral = newReferral

        // Generate QR code for the referral
        const qrService = new QRCodeService()
        const qrData = {
          referralCode: referral.referralCode,
          userId: referral.userId,
          testCenterId: referral.testCenterId || undefined,
          riskLevel: scoringRule.riskLevel,
          expiresAt: referral.expiresAt
        }

        // Use priority QR for high risk, regular for others
        if (scoringRule.riskLevel === 'high') {
          await qrService.generatePriorityQRCode(qrData)
        } else {
          await qrService.generateReferralQRCode(qrData)
        }
      }
    }

    // Send comprehensive risk-based messages
    const riskMessagingService = new RiskMessagingService()
    await riskMessagingService.initialize()

    const messageContext = {
      userId: assessment.userId,
      referralCode: referral?.referralCode,
      riskLevel: scoringRule.riskLevel,
      assessmentId: assessment.id,
      testCenterId: referral?.testCenterId || undefined
    }

    const messageResult = await riskMessagingService.sendRiskBasedMessage(messageContext, 'result')

    if (messageResult.success && referral) {
      // Mark referral as sent
      await db
        .update(referrals)
        .set({ 
          status: 'sent', 
          sentAt: new Date(),
          sentVia: 'sms'
        })
        .where(eq(referrals.id, referral.id))
    }

    // Create billing event for questionnaire delivery
    await db.insert(billingEvents).values({
      userId: assessment.userId,
      eventType: 'questionnaire_delivered',
      eventDate: new Date(),
      amount: '150', // ₱150 for questionnaire delivery
      referenceId: assessment.id,
      referenceTable: 'risk_assessments',
      description: `Risk assessment completed - ${scoringRule.riskLevel} risk`
    })

    return { 
      success: true, 
      riskLevel: scoringRule.riskLevel,
      totalScore,
      referralCode: referral?.referralCode,
      description: scoringRule.description
    }
  } catch (error) {
    console.error('Complete risk assessment error:', error)
    return { success: false, error: 'Failed to complete assessment' }
  }
}

export async function sendAssessmentViaSMS(userId: string) {
  try {
    // Start assessment
    const assessmentResult = await startRiskAssessment(userId)
    if (!assessmentResult.success) {
      return assessmentResult
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Update assessment to SMS delivery
    await db
      .update(riskAssessments)
      .set({ 
        deliveryMethod: 'sms',
        smsDeliveredAt: new Date()
      })
      .where(eq(riskAssessments.id, assessmentResult.assessmentId!))

    // Send first question via SMS
    const firstQuestion = assessmentResult.questions![0]
    const smsService = new SMSService()
    await smsService.initialize()

    const message = `BantAI HIV Risk Assessment\n\n${firstQuestion.questionText}\n\nReply YES or NO`
    
    await smsService.sendSMS(
      user.phoneNumber,
      message,
      user.id,
      'risk_assessment_question'
    )

    return { 
      success: true, 
      message: 'Assessment sent via SMS. Please check your messages.' 
    }
  } catch (error) {
    console.error('Send assessment via SMS error:', error)
    return { success: false, error: 'Failed to send assessment' }
  }
}