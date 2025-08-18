"use server"

import process from "process"
import { db } from "../index"
import { customers } from "../schema/customers"
import { customersData } from "./data/customers"
import { riskQuestions, riskScoringRules, riskMessageTemplates, testCenters } from "../schema"
import { riskQuestionsData, scoringRulesData, riskMessageTemplatesData } from "./data/risk-questions"
import { enhancedRiskMessageTemplatesData } from "./data/risk-messages-enhanced"

async function seed() {
  console.warn("Seeding database...")

  // Reset all tables in reverse order of dependencies
  console.warn("Resetting tables...")
  await db.execute("TRUNCATE TABLE customers CASCADE")
  await db.execute("TRUNCATE TABLE risk_questions CASCADE")
  await db.execute("TRUNCATE TABLE risk_scoring_rules CASCADE")
  await db.execute("TRUNCATE TABLE risk_message_templates CASCADE")
  await db.execute("TRUNCATE TABLE test_centers CASCADE")
  console.warn("Finished resetting tables")

  // Seed customers
  console.warn("Seeding customers...")
  await db.insert(customers).values(customersData)

  // Seed risk questions
  console.warn("Seeding risk questions...")
  await db.insert(riskQuestions).values(riskQuestionsData)

  // Seed scoring rules
  console.warn("Seeding scoring rules...")
  await db.insert(riskScoringRules).values(scoringRulesData)

  // Seed message templates
  console.warn("Seeding message templates...")
  // Combine basic and enhanced templates
  const allMessageTemplates = [...riskMessageTemplatesData, ...enhancedRiskMessageTemplatesData]
  await db.insert(riskMessageTemplates).values(allMessageTemplates)

  // Seed test centers
  console.warn("Seeding test centers...")
  await db.insert(testCenters).values([
    {
      name: 'Manila Social Hygiene Clinic',
      code: 'MSHC',
      address: '1901 Quiricada St, Santa Cruz',
      city: 'Manila',
      province: 'Metro Manila',
      contactNumber: '(02) 8523-5829',
      operatingHours: 'Mon-Fri 8AM-5PM',
      isActive: true
    },
    {
      name: 'Quezon City Health Department',
      code: 'QCHD',
      address: 'Quezon City Hall Complex, Elliptical Road',
      city: 'Quezon City',
      province: 'Metro Manila',
      contactNumber: '(02) 8988-4242',
      operatingHours: 'Mon-Fri 7AM-4PM',
      isActive: true
    },
    {
      name: 'Makati Social Hygiene Clinic',
      code: 'MAKHC',
      address: 'Makati Health Department, JP Rizal St',
      city: 'Makati',
      province: 'Metro Manila',
      contactNumber: '(02) 8899-9202',
      operatingHours: 'Mon-Fri 8AM-5PM, Sat 8AM-12PM',
      isActive: true
    }
  ])

  console.warn("Seeding complete!")
  db.$client.end()
}

seed().catch(error => {
  console.error("Error seeding database:", error)
  process.exit(1)
})