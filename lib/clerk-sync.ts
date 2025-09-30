import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { isAdminEmail } from '@/lib/admin-emails'

export async function syncClerkUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Check if user exists in database
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1)

  if (existingUser) {
    return existingUser
  }

  // Get primary email and phone
  const primaryEmail = clerkUser.emailAddresses?.find(
    email => email.id === clerkUser.primaryEmailAddressId
  )?.emailAddress

  const primaryPhone = clerkUser.phoneNumbers?.find(
    phone => phone.id === clerkUser.primaryPhoneNumberId
  )?.phoneNumber || `+1${Date.now()}` // Fallback phone number if none exists

  // Determine if user should be admin
  const shouldBeAdmin = isAdminEmail(primaryEmail)

  // Create new user in database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      phoneNumber: primaryPhone,
      email: primaryEmail,
      firstName: clerkUser.firstName || 'User',
      lastName: clerkUser.lastName || '',
      role: shouldBeAdmin ? 'admin' : 'patient',
      registrationMethod: 'clerk',
      isVerified: true,
      consentGiven: false
    })
    .returning()

  return newUser
}