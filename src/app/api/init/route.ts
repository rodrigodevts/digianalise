import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Iniciando verificação do banco de dados...')
    
    // Verificar conexão
    await prisma.$connect()
    console.log('Conexão com banco estabelecida')
    
    // Aplicar migrações/push do schema
    try {
      // Para PostgreSQL em produção, usar migrate
      if (process.env.DATABASE_URL?.includes('postgresql')) {
        console.log('Detectado PostgreSQL, aplicando schema...')
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Conversation" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "ticketId" TEXT NOT NULL,
            "phoneNumber" TEXT NOT NULL,
            "startedAt" DATETIME NOT NULL,
            "endedAt" DATETIME,
            "duration" INTEGER NOT NULL DEFAULT 0,
            "messageCount" INTEGER NOT NULL DEFAULT 0,
            "status" TEXT NOT NULL DEFAULT 'active',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `
        
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "ServiceMetrics" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "service" TEXT NOT NULL UNIQUE,
            "totalConversations" INTEGER NOT NULL DEFAULT 0,
            "resolvedConversations" INTEGER NOT NULL DEFAULT 0,
            "abandonedConversations" INTEGER NOT NULL DEFAULT 0,
            "averageSatisfaction" REAL NOT NULL DEFAULT 0,
            "economicImpact" REAL NOT NULL DEFAULT 0,
            "growthRate" REAL NOT NULL DEFAULT 0,
            "positiveCount" INTEGER NOT NULL DEFAULT 0,
            "neutralCount" INTEGER NOT NULL DEFAULT 0,
            "negativeCount" INTEGER NOT NULL DEFAULT 0,
            "frustratedCount" INTEGER NOT NULL DEFAULT 0,
            "funnelMetrics" TEXT,
            "topQuestions" TEXT,
            "topProblems" TEXT,
            "userProfiles" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `
      } else {
        // Para SQLite, usar db push
        console.log('Usando SQLite, schema já aplicado')
      }
    } catch (schemaError) {
      console.log('Schema já existe ou erro ao criar:', schemaError)
    }
    
    // Verificar se tabelas existem
    const conversations = await prisma.conversation.count()
    const metrics = await prisma.serviceMetrics.count()
    
    console.log(`Tabelas verificadas - Conversas: ${conversations}, Métricas: ${metrics}`)
    
    // Se não há dados, criar dados de exemplo
    if (metrics === 0) {
      console.log('Criando dados de exemplo...')
      
      await prisma.serviceMetrics.createMany({
        data: [
          {
            id: '1',
            service: 'IPTU',
            date: new Date(),
            totalConversations: 150,
            resolvedConversations: 130,
            abandonedConversations: 20,
            averageSatisfaction: 4.2,
            economicImpact: 25000,
            growthRate: 15.5,
            positiveCount: 95,
            neutralCount: 35,
            negativeCount: 15,
            frustratedCount: 5,
            funnelMetrics: JSON.stringify({
              inicio: 150,
              explicacao: 140,
              solicitacao: 135,
              processamento: 130,
              conclusao: 125
            }),
            topQuestions: JSON.stringify([
              { question: "Como consultar IPTU?", count: 45 },
              { question: "Prazo de pagamento", count: 32 },
              { question: "Valor do IPTU", count: 28 }
            ]),
            topProblems: JSON.stringify([
              { problem: "Sistema lento", count: 8 },
              { problem: "Erro ao gerar boleto", count: 5 }
            ]),
            topOpportunities: JSON.stringify([
              { opportunity: "Automatizar consultas", impact: "Alto" },
              { opportunity: "Melhorar UX do pagamento", impact: "Médio" }
            ]),
            userProfiles: JSON.stringify({
              "tranquilo": 85,
              "confuso": 35,
              "urgente": 20,
              "revoltado": 10
            })
          },
          {
            id: '2',
            service: 'CERTIDAO_NEGATIVA',
            date: new Date(),
            totalConversations: 89,
            resolvedConversations: 75,
            abandonedConversations: 14,
            averageSatisfaction: 4.0,
            economicImpact: 15000,
            growthRate: 8.2,
            positiveCount: 55,
            neutralCount: 20,
            negativeCount: 10,
            frustratedCount: 4,
            funnelMetrics: JSON.stringify({
              inicio: 89,
              explicacao: 85,
              solicitacao: 80,
              processamento: 75,
              conclusao: 70
            }),
            topQuestions: JSON.stringify([
              { question: "Como solicitar certidão?", count: 25 },
              { question: "Prazo de entrega", count: 18 }
            ]),
            topProblems: JSON.stringify([
              { problem: "Demora na emissão", count: 6 }
            ]),
            topOpportunities: JSON.stringify([
              { opportunity: "Portal self-service", impact: "Alto" },
              { opportunity: "Notificações automáticas", impact: "Médio" }
            ]),
            userProfiles: JSON.stringify({
              "tranquilo": 50,
              "confuso": 25,
              "urgente": 10,
              "revoltado": 4
            })
          }
        ]
      })
      
      console.log('Dados de exemplo criados')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Banco inicializado com sucesso',
        stats: {
          conversations,
          metrics: await prisma.serviceMetrics.count()
        },
        environment: process.env.NODE_ENV,
        database: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
      }
    })
    
  } catch (error) {
    console.error('Erro na inicialização:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao inicializar banco',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}