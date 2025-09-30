import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { syncClerkUser } from '@/lib/clerk-sync'

export async function isAdmin() {
  const { userId } = await auth()
  
  if (!userId) {
    return false
  }

  try {
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    // If user doesn't exist, sync from Clerk
    if (!user) {
      user = await syncClerkUser()
      if (!user) {
        return false
      }
    }

    return user.role === 'admin'
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}