import { db } from '@/db'
import { users, otpVerifications, testResults, appointments, artPatients, billingEvents, riskAssessments, referrals, referralEvents, smsLogs } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

async function deleteUserByPhone(phoneNumber: string) {
  console.log(`🔍 Looking for user with phone number: ${phoneNumber}`)
  
  try {
    // First, find the user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)
    
    if (user.length === 0) {
      console.log('❌ No user found with this phone number')
      return
    }
    
    console.log(`✅ Found user: ${user[0].firstName} ${user[0].lastName} (ID: ${user[0].id})`)
    
    const userId = user[0].id
    
    // Delete all related records first
    console.log('🗑️  Deleting related records...')
    
    // Delete SMS logs
    try {
      const deletedSmsLogs = await db
        .delete(smsLogs)
        .where(eq(smsLogs.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedSmsLogs.length} SMS log records`)
    } catch (e) {
      console.log(`  - No SMS logs to delete`)
    }
    
    // Delete billing events
    try {
      const deletedBilling = await db
        .delete(billingEvents)
        .where(eq(billingEvents.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedBilling.length} billing event records`)
    } catch (e) {
      console.log(`  - No billing events to delete`)
    }
    
    // Delete ART patients and related records
    try {
      const deletedArt = await db
        .delete(artPatients)
        .where(eq(artPatients.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedArt.length} ART patient records`)
    } catch (e) {
      console.log(`  - No ART records to delete`)
    }
    
    // Delete appointments
    try {
      const deletedAppointments = await db
        .delete(appointments)
        .where(eq(appointments.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedAppointments.length} appointment records`)
    } catch (e) {
      console.log(`  - No appointments to delete`)
    }
    
    // Delete referral events first (as they reference referrals)
    try {
      const userReferrals = await db
        .select({ id: referrals.id })
        .from(referrals)
        .where(eq(referrals.userId, userId))
      
      if (userReferrals.length > 0) {
        const referralIds = userReferrals.map(r => r.id)
        for (const refId of referralIds) {
          await db
            .delete(referralEvents)
            .where(eq(referralEvents.referralId, refId))
        }
        console.log(`  - Deleted referral events for ${userReferrals.length} referrals`)
      }
    } catch (e) {
      console.log(`  - No referral events to delete`)
    }
    
    // Delete test results (they can reference user as patient, recordedBy, or confirmedBy)
    try {
      const deletedTestResults = await db
        .delete(testResults)
        .where(
          or(
            eq(testResults.userId, userId),
            eq(testResults.recordedBy, userId),
            eq(testResults.confirmedBy, userId)
          )
        )
        .returning()
      console.log(`  - Deleted ${deletedTestResults.length} test result records`)
    } catch (e) {
      console.log(`  - No test results to delete`)
    }
    
    // Delete referrals
    try {
      const deletedReferrals = await db
        .delete(referrals)
        .where(eq(referrals.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedReferrals.length} referral records`)
    } catch (e) {
      console.log(`  - No referrals to delete`)
    }
    
    // Delete risk assessments
    try {
      const deletedAssessments = await db
        .delete(riskAssessments)
        .where(eq(riskAssessments.userId, userId))
        .returning()
      console.log(`  - Deleted ${deletedAssessments.length} risk assessment records`)
    } catch (e) {
      console.log(`  - No risk assessments to delete`)
    }
    
    // Delete OTP verifications for this phone number
    try {
      const deletedOtps = await db
        .delete(otpVerifications)
        .where(eq(otpVerifications.phoneNumber, phoneNumber))
        .returning()
      console.log(`  - Deleted ${deletedOtps.length} OTP verification records`)
    } catch (e) {
      console.log(`  - No OTP verifications to delete`)
    }
    
    // Finally, delete the user
    const deletedUser = await db
      .delete(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .returning()
    
    console.log(`\n✅ Successfully deleted user: ${deletedUser[0].firstName} ${deletedUser[0].lastName}`)
    console.log('🎉 Phone number is now available for registration!')
    
  } catch (error) {
    console.error('❌ Error deleting user:', error)
  }
}

// Run the deletion
deleteUserByPhone('09999986806')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })