import { db } from '../db'
import { users, riskAssessments, testResults, referrals, testCenters } from '../db/schema'
import { sql } from 'drizzle-orm'

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n')

  // Check users
  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users)
  const usersSample = await db.select().from(users).limit(5)
  
  console.log(`👥 Users: ${userCount[0].count}`)
  if (usersSample.length > 0) {
    console.log('Sample users:')
    usersSample.forEach(u => {
      console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`)
    })
  }
  console.log('')

  // Check risk assessments
  const assessmentCount = await db.select({ count: sql<number>`count(*)` }).from(riskAssessments)
  const assessmentsByStatus = await db
    .select({
      status: riskAssessments.status,
      count: sql<number>`count(*)`
    })
    .from(riskAssessments)
    .groupBy(riskAssessments.status)

  console.log(`📋 Risk Assessments: ${assessmentCount[0].count}`)
  assessmentsByStatus.forEach(a => {
    console.log(`  - ${a.status}: ${a.count}`)
  })
  console.log('')

  // Check test results
  const testCount = await db.select({ count: sql<number>`count(*)` }).from(testResults)
  const testsByResult = await db
    .select({
      result: testResults.result,
      count: sql<number>`count(*)`
    })
    .from(testResults)
    .groupBy(testResults.result)

  console.log(`🧪 Test Results: ${testCount[0].count}`)
  testsByResult.forEach(t => {
    console.log(`  - ${t.result}: ${t.count}`)
  })
  console.log('')

  // Check referrals
  const referralCount = await db.select({ count: sql<number>`count(*)` }).from(referrals)
  const referralsByStatus = await db
    .select({
      status: referrals.status,
      count: sql<number>`count(*)`
    })
    .from(referrals)
    .groupBy(referrals.status)

  console.log(`🎫 Referrals: ${referralCount[0].count}`)
  referralsByStatus.forEach(r => {
    console.log(`  - ${r.status}: ${r.count}`)
  })
  console.log('')

  // Check test centers
  const centerCount = await db.select({ count: sql<number>`count(*)` }).from(testCenters)
  console.log(`🏥 Test Centers: ${centerCount[0].count}`)

  process.exit(0)
}

checkDatabase().catch(console.error)