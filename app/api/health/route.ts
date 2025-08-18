import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Check database connection
    const dbCheck = await db.execute(sql`SELECT 1`)
    
    // Check environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      clerk: !!process.env.CLERK_SECRET_KEY,
      sms: !!process.env.SMS_PROVIDER
    }
    
    const allHealthy = dbCheck && Object.values(envCheck).every(v => v)
    
    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: !!dbCheck,
        environment: envCheck
      }
    }, {
      status: allHealthy ? 200 : 503
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, {
      status: 503
    })
  }
}