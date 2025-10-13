import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar todas as métricas agregadas
    const metrics = await prisma.serviceMetrics.findMany({
      orderBy: {
        totalConversations: 'desc'
      }
    })

    // Calcular totais gerais
    const totals = {
      conversations: metrics.reduce((sum, m) => sum + m.totalConversations, 0),
      resolved: metrics.reduce((sum, m) => sum + m.resolvedConversations, 0),
      abandoned: metrics.reduce((sum, m) => sum + m.abandonedConversations, 0),
      economicImpact: metrics.reduce((sum, m) => sum + m.economicImpact, 0),
    }

    // Calcular médias
    const averages = {
      resolutionRate: totals.conversations > 0 ? (totals.resolved / totals.conversations) * 100 : 0,
      satisfaction: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.averageSatisfaction, 0) / metrics.length 
        : 0
    }

    // Distribuição por serviço
    const serviceDistribution = metrics.map(m => ({
      service: m.service,
      total: m.totalConversations,
      percentage: totals.conversations > 0 ? (m.totalConversations / totals.conversations) * 100 : 0
    }))

    // Crescimento geral
    const totalGrowth = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.growthRate, 0) / metrics.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totals,
        averages,
        serviceDistribution,
        totalGrowth,
        metrics
      }
    })
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}