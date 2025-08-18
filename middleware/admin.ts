import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function isAdmin() {
  const { userId } = await auth()
  
  if (!userId) {
    return false
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    return user && user.role === 'admin'
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}