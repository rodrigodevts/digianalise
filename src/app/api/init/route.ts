import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Iniciando verificação do banco de dados...')
    
    // Verificar conexão
    await prisma.$connect()
    console.log('Conexão com MongoDB estabelecida')
    
    // Testar comando básico primeiro
    try {
      const pingResult = await prisma.$runCommandRaw({ ping: 1 })
      console.log('Ping MongoDB:', pingResult)
    } catch (pingError) {
      console.log('Erro no ping:', pingError)
      // Continua mesmo com erro de ping
    }
    
    // MongoDB não precisa de criação de tabelas (coleções são criadas automaticamente)
    
    // Verificar se há dados - com tratamento de erro mais específico
    let metrics = 0
    try {
      metrics = await prisma.serviceMetrics.count()
      console.log(`Métricas existentes: ${metrics}`)
    } catch (countError) {
      console.log('Erro ao contar métricas, tentando criar primeira coleção:', countError)
      // Se count falha, a coleção não existe, então metrics = 0
      metrics = 0
    }
    
    // Se não há dados, criar dados de exemplo
    if (metrics === 0) {
      console.log('Criando dados de exemplo...')
      
      await prisma.serviceMetrics.createMany({
        data: [
          {
            service: 'IPTU',
            date: new Date(),
            totalConversations: 150,
            resolvedConversations: 130,
            abandonedConversations: 20,
            averageSatisfaction: 4.2,
            economicImpact: 25000,
            growthRate: 15.5,
            previousPeriodTotal: 130,
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
            service: 'CERTIDAO_NEGATIVA',
            date: new Date(),
            totalConversations: 89,
            resolvedConversations: 75,
            abandonedConversations: 14,
            averageSatisfaction: 4.0,
            economicImpact: 15000,
            growthRate: 8.2,
            previousPeriodTotal: 82,
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
        message: 'MongoDB inicializado com sucesso',
        stats: {
          metrics: await prisma.serviceMetrics.count()
        },
        environment: process.env.NODE_ENV,
        database: 'MongoDB'
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