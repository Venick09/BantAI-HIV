import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, customers } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clerkId, phoneNumber, firstName, lastName, email } = body

    // Verify the authenticated user matches the clerkId
    if (userId !== clerkId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)

    if (existingUser.length > 0) {
      // User exists, create customer if needed
      const existingCustomer = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, clerkId))
        .limit(1)

      if (existingCustomer.length === 0) {
        await db.insert(customers).values({
          userId: clerkId,
          membership: 'free'
        })
      }

      return NextResponse.json({ success: true })
    }

    // Create new user
    await db.insert(users).values({
      clerkId,
      phoneNumber,
      firstName,
      lastName,
      email,
      role: 'patient',
      isVerified: true,
      consentGiven: true,
      consentDate: new Date(),
      registrationMethod: 'manual_sync'
    })

    // Create customer record
    await db.insert(customers).values({
      userId: clerkId,
      membership: 'free'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json({ success: false, error: 'Failed to sync user' }, { status: 500 })
  }
}

// Add missing import
import { eq } from 'drizzle-orm'