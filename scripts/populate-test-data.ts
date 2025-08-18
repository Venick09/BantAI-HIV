import { db } from '../db'
import { testResults, referrals, riskAssessments, smsLogs, testCenters, users } from '../db/schema'
import { eq } from 'drizzle-orm'

async function populateTestData() {
  console.log('🌱 Populating test data...\n')

  // Get the existing referral
  const [existingReferral] = await db.select().from(referrals).limit(1)
  
  // Get a test center
  const [testCenter] = await db.select().from(testCenters).limit(1)
  
  // Get the admin user to be the recorder
  const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1)
  
  if (existingReferral && testCenter && adminUser) {
    // Add a test result for the existing referral
    console.log('Adding test result...')
    await db.insert(testResults).values({
      referralId: existingReferral.id,
      userId: existingReferral.userId!,
      testCenterId: testCenter.id,
      testDate: new Date().toISOString().split('T')[0], // Convert to date string
      testType: 'rapid',
      result: 'negative',
      resultDate: new Date().toISOString().split('T')[0],
      recordedBy: adminUser.id,
      notes: 'Test completed successfully',
      isConfirmed: true,
      confirmedDate: new Date().toISOString().split('T')[0],
      confirmedBy: adminUser.id
    })
  }

  // Add some SMS logs
  console.log('Adding SMS logs...')
  await db.insert(smsLogs).values([
    {
      phoneNumber: '+639123456789',
      message: 'Your OTP is: 123456',
      messageType: 'otp',
      status: 'delivered',
      provider: 'semaphore',
      messageId: 'msg_001',
      sentAt: new Date(),
      deliveredAt: new Date()
    },
    {
      phoneNumber: '+639987654321',
      message: 'Reminder: Your HIV test is scheduled tomorrow',
      messageType: 'reminder',
      status: 'delivered',
      provider: 'semaphore',
      messageId: 'msg_002',
      sentAt: new Date(Date.now() - 86400000), // Yesterday
      deliveredAt: new Date(Date.now() - 86400000)
    },
    {
      phoneNumber: '+639555555555',
      message: 'Your test results are ready',
      messageType: 'test_result',
      status: 'failed',
      provider: 'semaphore',
      error: 'Invalid phone number',
      sentAt: new Date(Date.now() - 172800000) // 2 days ago
    }
  ])

  console.log('\n✅ Test data populated!')
  console.log('You should now see:')
  console.log('- 1 test result')
  console.log('- 3 SMS logs')
  console.log('\nRefresh your admin dashboard to see the updated data.')
  
  process.exit(0)
}

populateTestData().catch(console.error)