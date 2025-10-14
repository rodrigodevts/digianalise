import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verificar conexão básica
    await prisma.$connect()
    
    // Tentar uma operação simples
    const testConnection = await prisma.$runCommandRaw({ ping: 1 })
    
    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_TYPE: process.env.DATABASE_URL?.includes('mongodb') ? 'MongoDB' : 'Other',
        DATABASE_URL_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Not parsed',
        DATABASE_URL_DB: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'No DB name',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
        VERCEL: process.env.VERCEL ? 'Running on Vercel' : 'Not on Vercel',
        VERCEL_ENV: process.env.VERCEL_ENV || 'Not set'
      },
      database: {
        connected: true,
        ping: testConnection
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_TYPE: process.env.DATABASE_URL?.includes('mongodb') ? 'MongoDB' : 'Other',
        DATABASE_URL_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Not parsed',
        DATABASE_URL_DB: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'No DB name',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
        VERCEL: process.env.VERCEL ? 'Running on Vercel' : 'Not on Vercel'
      }
    })
  }
}