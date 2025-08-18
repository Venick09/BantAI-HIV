import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/middleware/admin'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API: Starting...')
    
    // Check if user is admin
    const admin = await isAdmin()
    console.log('Test API: Admin check result:', admin)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simple query
    console.log('Test API: Querying users...')
    const allUsers = await db.select().from(users).limit(5)
    console.log('Test API: Found users:', allUsers.length)

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      users: allUsers
    })
  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}