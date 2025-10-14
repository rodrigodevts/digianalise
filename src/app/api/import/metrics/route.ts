import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'JSON inválido no body da requisição' },
        { status: 400 }
      )
    }

    const { date = new Date() } = body

    // Validar data se fornecida
    let processDate: Date
    if (typeof date === 'string') {
      try {
        processDate = new Date(date)
        if (isNaN(processDate.getTime())) {
          throw new Error('Data inválida')
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Formato de data inválido. Use ISO 8601' },
          { status: 400 }
        )
      }
    } else if (date instanceof Date) {
      processDate = date
    } else {
      processDate = new Date()
    }

    // Buscar todas as análises
    const analyses = await prisma.conversationAnalysis.findMany({
      include: { conversation: true }
    })

    if (analyses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma análise encontrada. Execute /api/import/analyze primeiro.'
      }, { status: 400 })
    }

    // Agrupar por serviço
    const serviceGroups = new Map<string, typeof analyses>()

    for (const analysis of analyses) {
      const service = analysis.primaryService
      if (!serviceGroups.has(service)) {
        serviceGroups.set(service, [])
      }
      serviceGroups.get(service)!.push(analysis)
    }

    // Calcular métricas para cada serviço
    const metrics = []

    for (const [service, serviceAnalyses] of serviceGroups) {
      const total = serviceAnalyses.length
      const resolved = serviceAnalyses.filter(a => a.wasResolved).length
      const abandoned = total - resolved

      // Contagem de sentimentos
      const sentiments = {
        positivo: 0,
        neutro: 0,
        negativo: 0,
        frustrado: 0
      }

      // Perfis de usuário
      const userProfiles: Record<string, number> = {}

      // Processar cada análise
      const topQuestions: Record<string, number> = {}
      const topProblems: Record<string, number> = {}
      const opportunities: Record<string, number> = {}
      const funnelMetrics: Record<string, number> = {
        inicio: 0,
        explicacao: 0,
        solicitacao: 0,
        processamento: 0,
        conclusao: 0
      }

      for (const analysis of serviceAnalyses) {
        // Sentimentos
        sentiments[analysis.sentiment as keyof typeof sentiments]++

        // Perfis
        userProfiles[analysis.userProfile] = (userProfiles[analysis.userProfile] || 0) + 1

        // Funil
        funnelMetrics[analysis.funnelStage as keyof typeof funnelMetrics]++

        // Frases chave (simulando perguntas frequentes)
        try {
          const keyPhrases = JSON.parse(analysis.keyPhrases)
          for (const phrase of keyPhrases) {
            if (phrase.includes('?')) {
              topQuestions[phrase] = (topQuestions[phrase] || 0) + 1
            }
          }
        } catch {}

        // Oportunidades
        try {
          const opps = JSON.parse(analysis.opportunities)
          for (const opp of opps) {
            opportunities[opp] = (opportunities[opp] || 0) + 1
          }
        } catch {}

        // Problemas (baseado em abandono)
        if (!analysis.wasResolved && analysis.abandonmentReason) {
          topProblems[analysis.abandonmentReason] = 
            (topProblems[analysis.abandonmentReason] || 0) + 1
        }
      }

      // Converter para arrays ordenados
      const sortedQuestions = Object.entries(topQuestions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([question, count]) => ({ question, count }))

      const sortedProblems = Object.entries(topProblems)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([problem, count]) => ({ problem, count }))

      const sortedOpportunities = Object.entries(opportunities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([opportunity]) => ({ 
          opportunity, 
          impact: 'Alto' // Simplificado
        }))

      // Calcular média de satisfação e frustração
      const avgFrustration = serviceAnalyses.reduce(
        (acc, a) => acc + a.frustrationLevel, 0
      ) / total

      const avgSatisfaction = 5 - (avgFrustration / 2) // Conversão simplificada

      // Calcular impacto econômico estimado
      const economicImpact = resolved * 150 // R$ 150 economizados por atendimento automatizado

      // Criar ou atualizar métrica
      const metric = await prisma.serviceMetrics.upsert({
        where: {
          service_date: {
            service,
            date: processDate
          }
        },
        update: {
          totalConversations: total,
          resolvedConversations: resolved,
          abandonedConversations: abandoned,
          averageSatisfaction: Math.round(avgSatisfaction * 100) / 100, // Arredondar para 2 casas
          economicImpact,
          growthRate: 0, // Calculado comparando com período anterior
          positiveCount: sentiments.positivo,
          neutralCount: sentiments.neutro,
          negativeCount: sentiments.negativo,
          frustratedCount: sentiments.frustrado,
          topQuestions: JSON.stringify(sortedQuestions),
          topProblems: JSON.stringify(sortedProblems),
          topOpportunities: JSON.stringify(sortedOpportunities),
          userProfiles: JSON.stringify(userProfiles),
          funnelMetrics: JSON.stringify(funnelMetrics),
          updatedAt: new Date()
        },
        create: {
          service,
          date: processDate,
          totalConversations: total,
          resolvedConversations: resolved,
          abandonedConversations: abandoned,
          averageSatisfaction: Math.round(avgSatisfaction * 100) / 100,
          economicImpact,
          growthRate: 0,
          previousPeriodTotal: 0,
          positiveCount: sentiments.positivo,
          neutralCount: sentiments.neutro,
          negativeCount: sentiments.negativo,
          frustratedCount: sentiments.frustrado,
          topQuestions: JSON.stringify(sortedQuestions),
          topProblems: JSON.stringify(sortedProblems),
          topOpportunities: JSON.stringify(sortedOpportunities),
          userProfiles: JSON.stringify(userProfiles),
          funnelMetrics: JSON.stringify(funnelMetrics)
        }
      })

      metrics.push(metric)
    }

    // Criar alertas automáticos
    const alerts = []

    // Verificar serviços com alta taxa de abandono
    for (const metric of metrics) {
      const abandonRate = metric.abandonedConversations / metric.totalConversations

      if (abandonRate > 0.3) { // Mais de 30% de abandono
        const alert = await prisma.alert.create({
          data: {
            severity: abandonRate > 0.5 ? 'critical' : 'urgent',
            type: 'high_abandonment',
            service: metric.service,
            title: `Alta taxa de abandono em ${metric.service}`,
            description: `${Math.round(abandonRate * 100)}% das conversas foram abandonadas`,
            recommendation: 'Revisar fluxo de atendimento e identificar pontos de fricção',
            affectedCount: metric.abandonedConversations,
            impactScore: abandonRate * 10
          }
        })
        alerts.push(alert)
      }

      // Verificar serviços com alta frustração
      if (metric.frustratedCount > metric.positiveCount) {
        const alert = await prisma.alert.create({
          data: {
            severity: 'urgent',
            type: 'frustration',
            service: metric.service,
            title: `Alto nível de frustração em ${metric.service}`,
            description: `${metric.frustratedCount} usuários frustrados vs ${metric.positiveCount} satisfeitos`,
            recommendation: 'Melhorar clareza das respostas e tempo de resolução',
            affectedCount: metric.frustratedCount,
            impactScore: 8
          }
        })
        alerts.push(alert)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Métricas agregadas para ${metrics.length} serviços`,
      data: {
        metrics: metrics.length,
        alerts: alerts.length,
        services: metrics.map(m => m.service)
      }
    })

  } catch (error) {
    console.error('Erro ao agregar métricas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      },
      { status: 500 }
    )
  }
}

// GET para verificar métricas existentes
export async function GET() {
  try {
    const metrics = await prisma.serviceMetrics.findMany({
      orderBy: { date: 'desc' }
    })

    const summary = {
      totalServices: new Set(metrics.map(m => m.service)).size,
      totalMetrics: metrics.length,
      latestDate: metrics[0]?.date || null,
      services: metrics.reduce((acc, m) => {
        if (!acc[m.service]) {
          acc[m.service] = {
            conversations: 0,
            resolved: 0,
            abandoned: 0
          }
        }
        acc[m.service].conversations += m.totalConversations
        acc[m.service].resolved += m.resolvedConversations
        acc[m.service].abandoned += m.abandonedConversations
        return acc
      }, {} as Record<string, any>)
    }

    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar métricas' },
      { status: 500 }
    )
  }
}