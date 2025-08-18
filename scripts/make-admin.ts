import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

async function makeAdmin(email: string) {
  console.log(`🔧 Making user with email ${email} an admin...`)
  
  const result = await db
    .update(users)
    .set({ role: 'admin' })
    .where(eq(users.email, email))
    
  console.log('✅ User role updated to admin!')
  process.exit(0)
}

// Make the first user an admin
makeAdmin('leannemarasigan21@gmail.com').catch(console.error)