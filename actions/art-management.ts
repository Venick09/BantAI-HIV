'use server'

import { db } from '@/db'
import { 
  artPatients, 
  artReminders, 
  artAdherence, 
  artClinicVisits,
  users,
  billingEvents
} from '@/db/schema'
import { eq, and, desc, gte } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SMSService } from '@/lib/sms/sms-service'

export async function recordARTStartDate(data: {
  patientId: string
  artStartDate: string
  currentRegimen: string
  clinicName?: string
  nextAppointmentDate?: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user to check permissions
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update ART patient record
    const [updatedPatient] = await db
      .update(artPatients)
      .set({
        artStartDate: data.artStartDate,
        currentRegimen: data.currentRegimen,
        clinicName: data.clinicName,
        nextAppointmentDate: data.nextAppointmentDate,
        status: 'active',
        updatedAt: new Date()
      })
      .where(eq(artPatients.id, data.patientId))
      .returning()

    if (!updatedPatient) {
      return { success: false, error: 'Patient not found' }
    }

    // Create initial adherence reminder
    await db.insert(artReminders).values({
      patientId: data.patientId,
      reminderType: 'daily_medication',
      scheduledDate: data.artStartDate,
      scheduledTime: '08:00', // Default morning reminder
      isActive: true
    })

    // Create appointment reminder if next appointment is set
    if (data.nextAppointmentDate) {
      await db.insert(artReminders).values({
        patientId: data.patientId,
        reminderType: 'appointment',
        scheduledDate: data.nextAppointmentDate,
        scheduledTime: '08:00',
        isActive: true
      })
    }

    // Create billing event for ART initiation
    await db.insert(billingEvents).values({
      userId: updatedPatient.userId,
      eventType: 'art_started',
      eventDate: new Date(),
      amount: '500', // ₱500 for ART initiation
      referenceId: updatedPatient.id,
      referenceTable: 'art_patients',
      description: `ART initiated - ${data.currentRegimen}`
    })

    // Send SMS notification to patient
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.id, updatedPatient.userId))
      .limit(1)

    if (patient) {
      const smsService = new SMSService()
      await smsService.initialize()
      
      const message = `Hi ${patient.firstName}, congratulations on starting ART! Your medication (${data.currentRegimen}) starts on ${new Date(data.artStartDate).toLocaleDateString()}. We'll send daily reminders. Stay strong! Reply STOP to opt out.`
      
      await smsService.sendSMS(
        patient.phoneNumber,
        message,
        patient.id,
        'art_initiation'
      )
    }

    revalidatePath('/dashboard/art')
    return { success: true, message: 'ART start date recorded successfully' }
  } catch (error) {
    console.error('Record ART start date error:', error)
    return { success: false, error: 'Failed to record ART start date' }
  }
}

export async function getARTPatients(status?: string) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return []
    }

    const query = db
      .select({
        id: artPatients.id,
        patientCode: artPatients.patientCode,
        status: artPatients.status,
        artStartDate: artPatients.artStartDate,
        currentRegimen: artPatients.currentRegimen,
        nextAppointmentDate: artPatients.nextAppointmentDate,
        patient: {
          firstName: users.firstName,
          lastName: users.lastName,
          phoneNumber: users.phoneNumber
        }
      })
      .from(artPatients)
      .innerJoin(users, eq(artPatients.userId, users.id))
      .orderBy(desc(artPatients.createdAt))

    if (status) {
      return await query.where(eq(artPatients.status, status as any))
    }

    return await query
  } catch (error) {
    console.error('Get ART patients error:', error)
    return []
  }
}

export async function recordAdherenceStatus(data: {
  patientId: string
  trackingDate: string
  pillsTaken: boolean
  missedDoses?: number
  adherenceStatus: 'good' | 'fair' | 'poor' | 'unknown'
  notes?: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Create adherence record
    await db.insert(artAdherence).values({
      patientId: data.patientId,
      trackingDate: data.trackingDate,
      pillsTaken: data.pillsTaken,
      missedDoses: data.missedDoses || 0,
      adherenceStatus: data.adherenceStatus,
      reportedVia: 'web',
      notes: data.notes
    })

    // If adherence is poor, create follow-up reminder
    if (data.adherenceStatus === 'poor') {
      const [patient] = await db
        .select()
        .from(artPatients)
        .where(eq(artPatients.id, data.patientId))
        .limit(1)

      if (patient) {
        // Send immediate follow-up SMS
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, patient.userId))
          .limit(1)

        if (user) {
          const smsService = new SMSService()
          await smsService.initialize()
          
          const message = `Hi ${user.firstName}, we noticed you may have missed doses. Your health is important! If you're having challenges with your medication, please visit the clinic or reply HELP for support.`
          
          await smsService.sendSMS(
            user.phoneNumber,
            message,
            user.id,
            'adherence_followup'
          )
        }
      }
    }

    revalidatePath('/dashboard/art')
    return { success: true, message: 'Adherence status recorded' }
  } catch (error) {
    console.error('Record adherence error:', error)
    return { success: false, error: 'Failed to record adherence' }
  }
}

export async function recordClinicVisit(data: {
  patientId: string
  visitDate: string
  visitType: 'scheduled' | 'unscheduled' | 'emergency'
  attended: boolean
  viralLoadTested?: boolean
  viralLoadResult?: string
  cd4Tested?: boolean
  cd4Result?: string
  regimenChanged?: boolean
  newRegimen?: string
  nextVisitDate?: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Record clinic visit
    await db.insert(artClinicVisits).values({
      ...data,
      recordedBy: currentUser.id
    })

    // Update patient record if needed
    const updates: any = {}
    if (data.regimenChanged && data.newRegimen) {
      updates.currentRegimen = data.newRegimen
    }
    if (data.nextVisitDate) {
      updates.nextAppointmentDate = data.nextVisitDate
    }
    if (data.viralLoadTested && data.viralLoadResult) {
      updates.viralLoadSuppressed = data.viralLoadResult.toLowerCase().includes('suppressed') || 
                                   data.viralLoadResult.toLowerCase().includes('undetectable')
      updates.lastViralLoadDate = data.visitDate
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date()
      await db
        .update(artPatients)
        .set(updates)
        .where(eq(artPatients.id, data.patientId))
    }

    // Create next appointment reminder
    if (data.nextVisitDate) {
      await db.insert(artReminders).values({
        patientId: data.patientId,
        reminderType: 'appointment',
        scheduledDate: data.nextVisitDate,
        scheduledTime: '08:00',
        isActive: true
      })
    }

    // Note: Clinic visits are not billed separately in the current billing model

    revalidatePath('/dashboard/art')
    return { success: true, message: 'Clinic visit recorded successfully' }
  } catch (error) {
    console.error('Record clinic visit error:', error)
    return { success: false, error: 'Failed to record clinic visit' }
  }
}

export async function getPatientAdherenceHistory(patientId: string, days: number = 30) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const adherenceRecords = await db
      .select()
      .from(artAdherence)
      .where(
        and(
          eq(artAdherence.patientId, patientId),
          gte(artAdherence.trackingDate, startDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(artAdherence.trackingDate))

    return adherenceRecords
  } catch (error) {
    console.error('Get adherence history error:', error)
    return []
  }
}

export async function getUpcomingAppointments(days: number = 7) {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!currentUser || !['health_worker', 'admin', 'test_center'].includes(currentUser.role)) {
      return []
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const appointments = await db
      .select({
        id: artPatients.id,
        patientCode: artPatients.patientCode,
        nextAppointmentDate: artPatients.nextAppointmentDate,
        patient: {
          firstName: users.firstName,
          lastName: users.lastName,
          phoneNumber: users.phoneNumber
        }
      })
      .from(artPatients)
      .innerJoin(users, eq(artPatients.userId, users.id))
      .where(
        and(
          eq(artPatients.status, 'active'),
          gte(artPatients.nextAppointmentDate, new Date().toISOString().split('T')[0])
        )
      )
      .orderBy(artPatients.nextAppointmentDate)

    return appointments
  } catch (error) {
    console.error('Get upcoming appointments error:', error)
    return []
  }
}