import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verificar conexão com banco
    const start = Date.now()
    await prisma.$connect()
    
    // Teste simples de query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    const dbTime = Date.now() - start
    
    // Verificar se tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' 
      UNION ALL 
      SELECT tablename as name FROM pg_tables WHERE schemaname='public'
    `
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        database: {
          connected: true,
          responseTime: `${dbTime}ms`,
          tables: Array.isArray(tables) ? tables.length : 0
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          databaseUrl: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Health check falhou:', error)
    
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            databaseUrl: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
          },
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}