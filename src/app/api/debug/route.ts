import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 
        (process.env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL configured' : 'Other DB configured') : 
        'Not configured',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
      VERCEL: process.env.VERCEL ? 'Running on Vercel' : 'Not on Vercel',
      VERCEL_ENV: process.env.VERCEL_ENV || 'Not set'
    }
  })
}