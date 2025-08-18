import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/make-user-admin.ts <email>')
  process.exit(1)
}

async function makeAdmin(email: string) {
  console.log(`🔧 Making user with email ${email} an admin...`)
  
  // Check if user exists
  const [user] = await db.select().from(users).where(eq(users.email, email))
  
  if (!user) {
    console.error(`❌ User with email ${email} not found`)
    process.exit(1)
  }
  
  if (user.role === 'admin') {
    console.log('✅ User is already an admin!')
    process.exit(0)
  }
  
  const result = await db
    .update(users)
    .set({ role: 'admin' })
    .where(eq(users.email, email))
    
  console.log('✅ User role updated to admin!')
  console.log(`User ${user.firstName} ${user.lastName} is now an administrator`)
  process.exit(0)
}

makeAdmin(email).catch(console.error)