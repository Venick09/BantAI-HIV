import { db } from "../db"
import { riskQuestions, testCenters, riskMessageTemplates, users, riskAssessments } from "../db/schema"
import { sql } from "drizzle-orm"

async function checkData() {
  console.log("🔍 Checking BantAI HIV Database...\n")
  
  // Check risk questions
  const questions = await db.select({ count: sql<number>`count(*)` }).from(riskQuestions)
  console.log(`📋 Risk Questions: ${questions[0].count}`)
  
  // Check test centers
  const centers = await db.select({ count: sql<number>`count(*)` }).from(testCenters)
  console.log(`🏥 Test Centers: ${centers[0].count}`)
  
  // Check message templates
  const templates = await db.select({ count: sql<number>`count(*)` }).from(riskMessageTemplates)
  console.log(`💬 SMS Templates: ${templates[0].count}`)
  
  // Check users
  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users)
  console.log(`👥 Registered Users: ${userCount[0].count}`)
  
  // Check assessments
  const assessments = await db.select({ count: sql<number>`count(*)` }).from(riskAssessments)
  console.log(`📊 Risk Assessments: ${assessments[0].count}`)
  
  // Show sample test center
  const sampleCenter = await db.select().from(testCenters).limit(1)
  if (sampleCenter.length > 0) {
    console.log("\n🏥 Sample Test Center:")
    console.log(`   Name: ${sampleCenter[0].name}`)
    console.log(`   Address: ${sampleCenter[0].address}, ${sampleCenter[0].city}`)
    console.log(`   Hours: ${sampleCenter[0].operatingHours}`)
  }
  
  process.exit(0)
}

checkData().catch(console.error)