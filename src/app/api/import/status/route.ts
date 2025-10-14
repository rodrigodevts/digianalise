import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Coletar estatísticas gerais
    const [
      conversations,
      messages,
      analyses,
      metrics,
      alerts
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversationAnalysis.count(),
      prisma.serviceMetrics.count(),
      prisma.alert.count({ where: { status: 'active' } })
    ])

    // Verificar progresso de cada etapa
    const importProgress = {
      conversations: {
        total: conversations,
        status: conversations > 0 ? 'completed' : 'pending',
        message: conversations > 0 
          ? `${conversations} conversas importadas` 
          : 'Aguardando importação'
      },
      analysis: {
        total: analyses,
        pending: conversations - analyses,
        progress: conversations > 0 ? Math.round((analyses / conversations) * 100) : 0,
        status: analyses === conversations && conversations > 0 ? 'completed' : 
                analyses > 0 ? 'in_progress' : 'pending',
        message: analyses > 0 
          ? `${analyses}/${conversations} conversas analisadas` 
          : 'Aguardando análise'
      },
      metrics: {
        total: metrics,
        status: metrics > 0 ? 'completed' : 'pending',
        message: metrics > 0 
          ? `Métricas agregadas para ${metrics} períodos` 
          : 'Aguardando agregação'
      }
    }

    // Estatísticas por serviço
    const serviceStats = await prisma.conversationAnalysis.groupBy({
      by: ['primaryService'],
      _count: {
        _all: true
      }
    })

    // Últimas atualizações
    const lastConversation = await prisma.conversation.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const lastAnalysis = await prisma.conversationAnalysis.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const lastMetric = await prisma.serviceMetrics.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          conversations,
          messages,
          analyses,
          metrics,
          activeAlerts: alerts
        },
        progress: importProgress,
        services: serviceStats.map(s => ({
          service: s.primaryService,
          count: s._count._all
        })),
        lastUpdates: {
          conversation: lastConversation?.createdAt || null,
          analysis: lastAnalysis?.createdAt || null,
          metrics: lastMetric?.createdAt || null
        },
        status: metrics > 0 ? 'ready' : 
                analyses > 0 ? 'processing' : 
                conversations > 0 ? 'imported' : 'empty'
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      },
      { status: 500 }
    )
  }
}

// DELETE para resetar dados (desenvolvimento)
export async function DELETE() {
  try {
    // Verificar se está em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Reset não permitido em produção' },
        { status: 403 }
      )
    }

    // Deletar em ordem para respeitar foreign keys
    await prisma.alert.deleteMany()
    await prisma.serviceMetrics.deleteMany()
    await prisma.conversationAnalysis.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()

    return NextResponse.json({
      success: true,
      message: 'Todos os dados foram removidos'
    })

  } catch (error) {
    console.error('Erro ao resetar dados:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      },
      { status: 500 }
    )
  }
}