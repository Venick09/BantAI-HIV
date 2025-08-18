'use server'

import { db } from '@/db'
import { auth } from '@clerk/nextjs/server'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getUserAppointments() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized', appointments: [] }
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found', appointments: [] }
    }

    // TODO: When appointments table is created, query real appointments
    // For now, return empty array as no appointments table exists yet
    return { 
      success: true, 
      appointments: [] 
    }
  } catch (error) {
    console.error('Get appointments error:', error)
    return { success: false, error: 'Failed to fetch appointments', appointments: [] }
  }
}

export async function getAvailableSlots(testCenterId: string, date: string) {
  try {
    // Simulate available time slots
    const slots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ]
    
    return { success: true, slots }
  } catch (error) {
    console.error('Get available slots error:', error)
    return { success: false, error: 'Failed to fetch available slots', slots: [] }
  }
}

export async function bookAppointment(data: {
  testCenterId: string
  date: string
  time: string
  referralCode?: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // In a real app, this would create an appointment record in the database
    return { 
      success: true, 
      message: 'Appointment booked successfully',
      appointmentId: `APT${Date.now()}`
    }
  } catch (error) {
    console.error('Book appointment error:', error)
    return { success: false, error: 'Failed to book appointment' }
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // In a real app, this would update the appointment status
    return { success: true, message: 'Appointment cancelled successfully' }
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return { success: false, error: 'Failed to cancel appointment' }
  }
}