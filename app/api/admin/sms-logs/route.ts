import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/middleware/admin'
import { db } from '@/db'
import { smsLogs, users } from '@/db/schema'
import { desc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get SMS logs
    const logs = await db
      .select({
        id: smsLogs.id,
        phoneNumber: smsLogs.phoneNumber,
        message: smsLogs.message,
        messageType: smsLogs.messageType,
        status: smsLogs.status,
        provider: smsLogs.provider,
        messageId: smsLogs.messageId,
        error: smsLogs.error,
        sentAt: smsLogs.sentAt,
        deliveredAt: smsLogs.deliveredAt,
        userId: smsLogs.userId,
        createdAt: smsLogs.createdAt
      })
      .from(smsLogs)
      .orderBy(desc(smsLogs.createdAt))
      .limit(100) // Limit to last 100 logs

    // Get user IDs
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))]
    
    // Get user data if there are user IDs
    const usersData = userIds.length > 0 
      ? await db.select().from(users).where(sql`${users.id} IN ${userIds}`)
      : []

    // Create user lookup map
    const usersMap = new Map(usersData.map(u => [u.id, u]))

    // Format logs with user info
    const formattedLogs = logs.map(log => ({
      ...log,
      userName: log.userId ? usersMap.get(log.userId)?.firstName || 'Unknown' : null
    }))

    return NextResponse.json({
      success: true,
      logs: formattedLogs
    })
  } catch (error: any) {
    console.error('Admin SMS logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}