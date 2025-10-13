import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { service: string } }
) {
  try {
    const service = params.service

    // Buscar métricas do serviço
    const serviceMetric = await prisma.serviceMetrics.findFirst({
      where: { service }
    })

    if (!serviceMetric) {
      return NextResponse.json(
        { success: false, error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Buscar conversas do serviço (últimas 20)
    const conversations = await prisma.conversation.findMany({
      where: {
        analysis: {
          primaryService: service
        }
      },
      include: {
        analysis: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 20
    })

    // Buscar alertas relacionados ao serviço
    const alerts = await prisma.alert.findMany({
      where: {
        service,
        status: 'active'
      },
      orderBy: {
        detectedAt: 'desc'
      }
    })

    // Parse dos dados JSON
    const topQuestions = serviceMetric.topQuestions 
      ? JSON.parse(serviceMetric.topQuestions) 
      : []
    const topProblems = serviceMetric.topProblems 
      ? JSON.parse(serviceMetric.topProblems) 
      : []
    const topOpportunities = serviceMetric.topOpportunities 
      ? JSON.parse(serviceMetric.topOpportunities) 
      : []
    const userProfiles = serviceMetric.userProfiles 
      ? JSON.parse(serviceMetric.userProfiles) 
      : {}
    const funnelMetrics = serviceMetric.funnelMetrics 
      ? JSON.parse(serviceMetric.funnelMetrics) 
      : {}

    return NextResponse.json({
      success: true,
      data: {
        service,
        metrics: {
          ...serviceMetric,
          topQuestions,
          topProblems,
          topOpportunities,
          userProfiles,
          funnelMetrics
        },
        conversations,
        alerts
      }
    })
  } catch (error) {
    console.error('Erro ao buscar dados do serviço:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}