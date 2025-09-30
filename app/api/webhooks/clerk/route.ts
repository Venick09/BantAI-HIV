import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { isAdminEmail } from '@/lib/admin-emails'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET environment variable is not set')
  }
  
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data

    const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)
    const primaryPhone = phone_numbers?.find(p => p.id === evt.data.primary_phone_number_id)

    // Check if this is an existing user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, id))
      .limit(1)

    // Determine if this email should be admin
    const shouldBeAdmin = isAdminEmail(primaryEmail?.email_address)

    if (existingUser.length > 0) {
      // Update existing user
      const updates: any = {
        email: primaryEmail?.email_address,
        firstName: first_name || existingUser[0].firstName,
        lastName: last_name || existingUser[0].lastName,
        updatedAt: new Date()
      }

      // Only update to admin if the email matches and they're not already admin
      if (shouldBeAdmin && existingUser[0].role !== 'admin') {
        updates.role = 'admin'
      }

      await db
        .update(users)
        .set(updates)
        .where(eq(users.clerkId, id))
    } else if (primaryPhone?.phone_number) {
      // Create new user only if they have a phone number
      await db
        .insert(users)
        .values({
          clerkId: id,
          phoneNumber: primaryPhone.phone_number,
          email: primaryEmail?.email_address,
          firstName: first_name || 'User',
          lastName: last_name || '',
          role: shouldBeAdmin ? 'admin' : 'patient',
          registrationMethod: 'clerk',
          isVerified: true
        })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}