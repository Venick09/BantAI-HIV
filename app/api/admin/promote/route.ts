import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { isAdminEmail } from '@/lib/admin-emails'
import { withMiddleware, createApiResponse, createErrorResponse } from '@/lib/api-middleware'
import { syncClerkUser } from '@/lib/clerk-sync'

export async function POST(request: NextRequest) {
  return withMiddleware(request, async (req) => {
    const { userId } = await auth()
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get the current user
    let [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    // If user doesn't exist, sync from Clerk
    if (!currentUser) {
      currentUser = await syncClerkUser()
      if (!currentUser) {
        return createErrorResponse('User not found', 404)
      }
    }

    // Check if the user's email is in the admin list
    if (!isAdminEmail(currentUser.email)) {
      return createErrorResponse('Your email is not authorized for admin access', 403)
    }

    // Check if already admin
    if (currentUser.role === 'admin') {
      return createApiResponse({
        message: 'You already have admin access',
        role: currentUser.role
      })
    }

    // Promote to admin
    await db
      .update(users)
      .set({ 
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.id, currentUser.id))

    return createApiResponse({
      message: 'Successfully promoted to admin',
      role: 'admin'
    })
  })
}