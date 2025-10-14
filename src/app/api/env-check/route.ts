import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        
        // Verificar todas as possíveis variáveis
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) || 'Not set',
        
        HAS_MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_URI_PREFIX: process.env.MONGODB_URI?.substring(0, 20) || 'Not set',
        
        // Verificar se tem o nome do banco
        DATABASE_URL_HAS_DB_NAME: process.env.DATABASE_URL?.includes('/digianalise') || false,
        MONGODB_URI_HAS_DB_NAME: process.env.MONGODB_URI?.includes('/digianalise') || false,
        
        // Outras variáveis
        HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
        VERCEL: !!process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV || 'Not set',
        
        // Timestamp para cache busting
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}