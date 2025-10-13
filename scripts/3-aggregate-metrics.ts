#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'
import { startOfDay, subDays } from 'date-fns'

const prisma = new PrismaClient()

const COST_PER_HUMAN_INTERACTION = 12.50
const COST_PER_BOT_INTERACTION = 0.35

interface ServiceMetric {
  service: string
  total: number
  resolved: number
  abandoned: number
  sentiments: {
    positivo: number
    neutro: number
    negativo: number
    frustrado: number
  }
  profiles: {
    urgente: number
    confuso: number
    revoltado: number
    tranquilo: number
  }
  avgFrustration: number
  topQuestions: string[]
  topProblems: string[]
  topOpportunities: string[]
  funnelMetrics: {
    inicio: number
    explicacao: number
    solicitacao: number
    processamento: number
    conclusao: number
  }
}

async function calculateServiceMetrics(): Promise<Map<string, ServiceMetric>> {
  const analyses = await prisma.conversationAnalysis.findMany({
    include: {
      conversation: true
    }
  })

  const metricsMap = new Map<string, ServiceMetric>()

  for (const analysis of analyses) {
    const service = analysis.primaryService
    
    if (!metricsMap.has(service)) {
      metricsMap.set(service, {
        service,
        total: 0,
        resolved: 0,
        abandoned: 0,
        sentiments: { positivo: 0, neutro: 0, negativo: 0, frustrado: 0 },
        profiles: { urgente: 0, confuso: 0, revoltado: 0, tranquilo: 0 },
        avgFrustration: 0,
        topQuestions: [],
        topProblems: [],
        topOpportunities: [],
        funnelMetrics: {
          inicio: 0,
          explicacao: 0,
          solicitacao: 0,
          processamento: 0,
          conclusao: 0
        }
      })
    }

    const metric = metricsMap.get(service)!
    
    metric.total++
    
    if (analysis.wasResolved) {
      metric.resolved++
    } else {
      metric.abandoned++
    }

    // Incrementar sentiments com verificação de tipo
    const sentiment = analysis.sentiment as keyof typeof metric.sentiments
    if (sentiment in metric.sentiments) {
      metric.sentiments[sentiment]++
    }

    // Incrementar profiles com verificação de tipo
    const profile = analysis.userProfile as keyof typeof metric.profiles
    if (profile in metric.profiles) {
      metric.profiles[profile]++
    }

    metric.avgFrustration += analysis.frustrationLevel || 0

    // Incrementar funil com verificação de tipo
    const funnelStage = analysis.funnelStage as keyof typeof metric.funnelMetrics
    if (funnelStage in metric.funnelMetrics) {
      metric.funnelMetrics[funnelStage]++
    }

    // Parse seguro dos JSONs
    try {
      const keyPhrases = analysis.keyPhrases ? JSON.parse(analysis.keyPhrases) : []
      if (Array.isArray(keyPhrases)) {
        metric.topQuestions.push(...keyPhrases)
      }
    } catch (error) {
      console.warn(`Erro ao parsear keyPhrases para conversa ${analysis.conversationId}`)
    }

    if (analysis.abandonmentReason) {
      metric.topProblems.push(analysis.abandonmentReason)
    }

    try {
      const opportunities = analysis.opportunities ? JSON.parse(analysis.opportunities) : []
      if (Array.isArray(opportunities)) {
        metric.topOpportunities.push(...opportunities)
      }
    } catch (error) {
      console.warn(`Erro ao parsear opportunities para conversa ${analysis.conversationId}`)
    }
  }

  // Converter para array para iteração compatível
  const metricsArray = Array.from(metricsMap.values())
  for (const metric of metricsArray) {
    metric.avgFrustration = metric.total > 0 ? metric.avgFrustration / metric.total : 0

    const questionFreq = new Map<string, number>()
    metric.topQuestions.forEach(q => {
      questionFreq.set(q, (questionFreq.get(q) || 0) + 1)
    })
    metric.topQuestions = Array.from(questionFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([q]) => q)

    const problemFreq = new Map<string, number>()
    metric.topProblems.forEach(p => {
      problemFreq.set(p, (problemFreq.get(p) || 0) + 1)
    })
    metric.topProblems = Array.from(problemFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([p]) => p)

    const oppFreq = new Map<string, number>()
    metric.topOpportunities.forEach(o => {
      oppFreq.set(o, (oppFreq.get(o) || 0) + 1)
    })
    metric.topOpportunities = Array.from(oppFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([o]) => o)
  }

  return metricsMap
}

async function generateAlerts() {
  console.log('\n🚨 Gerando alertas automáticos...')

  await prisma.alert.updateMany({
    where: { status: 'active' },
    data: { status: 'resolved' }
  })

  const analyses = await prisma.conversationAnalysis.findMany({
    include: {
      conversation: true
    },
    where: {
      OR: [
        { frustrationLevel: { gte: 7 } },
        { sentiment: 'frustrado' },
        { wasResolved: false }
      ]
    }
  })

  const alerts = []

  for (const analysis of analyses) {
    if (analysis.frustrationLevel >= 9) {
      alerts.push({
        severity: 'critical',
        type: 'frustration',
        conversationId: analysis.conversationId,
        service: analysis.primaryService,
        title: 'Cidadão extremamente frustrado',
        description: `Conversa ${analysis.conversation.ticketId} com nível de frustração ${analysis.frustrationLevel}/10`,
        recommendation: 'Contato humano imediato recomendado',
        impactScore: 10
      })
    } else if (analysis.frustrationLevel >= 7) {
      alerts.push({
        severity: 'urgent',
        type: 'frustration',
        conversationId: analysis.conversationId,
        service: analysis.primaryService,
        title: 'Alta frustração detectada',
        description: `Conversa ${analysis.conversation.ticketId} com frustração elevada`,
        recommendation: 'Revisar processo de atendimento para este tipo de solicitação',
        impactScore: 7
      })
    }

    if (!analysis.wasResolved && analysis.sentiment === 'frustrado') {
      alerts.push({
        severity: 'urgent',
        type: 'churn_risk',
        conversationId: analysis.conversationId,
        service: analysis.primaryService,
        title: 'Risco de abandono do canal',
        description: `Cidadão frustrado não teve problema resolvido`,
        recommendation: 'Implementar melhorias no fluxo de ${analysis.primaryService}',
        impactScore: 8
      })
    }
  }

  const serviceMetrics = await calculateServiceMetrics()
  
  // Converter para array para iteração compatível
  const serviceMetricsArray = Array.from(serviceMetrics.entries())
  for (const [service, metric] of serviceMetricsArray) {
    const abandonmentRate = metric.total > 0 ? (metric.abandoned / metric.total) * 100 : 0
    
    if (abandonmentRate > 30) {
      alerts.push({
        severity: 'critical',
        type: 'high_abandonment',
        service,
        title: `Taxa de abandono crítica em ${service}`,
        description: `${abandonmentRate.toFixed(1)}% dos cidadãos abandonam o atendimento`,
        recommendation: 'Revisar urgentemente o fluxo de atendimento',
        affectedCount: metric.abandoned,
        impactScore: 9
      })
    }

    if (metric.topOpportunities.length > 0) {
      alerts.push({
        severity: 'monitor',
        type: 'opportunity',
        service,
        title: `Oportunidades identificadas em ${service}`,
        description: metric.topOpportunities[0],
        recommendation: 'Avaliar implementação de melhorias sugeridas',
        affectedCount: metric.total,
        impactScore: 5
      })
    }
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({
      data: alerts
    })
    console.log(`   ✅ ${alerts.length} alertas gerados`)
  } else {
    console.log(`   ℹ️  Nenhum alerta necessário`)
  }
}

async function saveMetrics() {
  console.log('\n💾 Salvando métricas agregadas...')

  const serviceMetrics = await calculateServiceMetrics()
  const today = startOfDay(new Date())

  // Converter para array para iteração compatível
  const serviceMetricsArray2 = Array.from(serviceMetrics.entries())
  for (const [service, metric] of serviceMetricsArray2) {
    const economicImpact = metric.resolved * (COST_PER_HUMAN_INTERACTION - COST_PER_BOT_INTERACTION)

    const satisfactionScore = (
      (metric.sentiments.positivo * 5 + 
       metric.sentiments.neutro * 3 + 
       metric.sentiments.negativo * 1 + 
       metric.sentiments.frustrado * 0) / 
      metric.total
    )

    const existingMetric = await prisma.serviceMetrics.findFirst({
      where: {
        service,
        date: today
      }
    })

    const previousMetric = await prisma.serviceMetrics.findFirst({
      where: {
        service,
        date: subDays(today, 1)
      }
    })

    const growthRate = previousMetric 
      ? ((metric.total - previousMetric.totalConversations) / previousMetric.totalConversations) * 100
      : 0

    const data = {
      service,
      date: today,
      totalConversations: metric.total,
      resolvedConversations: metric.resolved,
      abandonedConversations: metric.abandoned,
      growthRate,
      previousPeriodTotal: previousMetric?.totalConversations || 0,
      averageSatisfaction: satisfactionScore,
      positiveCount: metric.sentiments.positivo,
      neutralCount: metric.sentiments.neutro,
      negativeCount: metric.sentiments.negativo,
      frustratedCount: metric.sentiments.frustrado,
      topQuestions: JSON.stringify(metric.topQuestions),
      topProblems: JSON.stringify(metric.topProblems),
      topOpportunities: JSON.stringify(metric.topOpportunities),
      userProfiles: JSON.stringify(metric.profiles),
      funnelMetrics: JSON.stringify(metric.funnelMetrics),
      economicImpact
    }

    if (existingMetric) {
      await prisma.serviceMetrics.update({
        where: { id: existingMetric.id },
        data
      })
    } else {
      await prisma.serviceMetrics.create({
        data
      })
    }
  }

  console.log(`   ✅ Métricas salvas para ${serviceMetrics.size} serviços`)
}

async function aggregateMetrics() {
  console.log('📊 Iniciando agregação de métricas...\n')

  const conversationCount = await prisma.conversation.count()
  const analysisCount = await prisma.conversationAnalysis.count()

  if (conversationCount === 0) {
    console.log('⚠️  Nenhuma conversa encontrada no banco')
    console.log('    Execute primeiro o script de importação')
    return
  }

  if (analysisCount === 0) {
    console.log('⚠️  Nenhuma análise encontrada')
    console.log('    Execute primeiro o script de análise com IA')
    return
  }

  console.log(`📈 Processando ${analysisCount} análises de ${conversationCount} conversas`)

  await saveMetrics()
  await generateAlerts()

  console.log('\n' + '='.repeat(50))
  console.log('✨ Agregação concluída!')
  console.log('='.repeat(50))

  const metrics = await prisma.serviceMetrics.findMany({
    orderBy: { totalConversations: 'desc' }
  })

  console.log('\n📊 Resumo das Métricas:')
  for (const metric of metrics) {
    console.log(`\n   ${metric.service}:`)
    console.log(`      Total: ${metric.totalConversations} conversas`)
    console.log(`      Resolvidas: ${metric.resolvedConversations} (${((metric.resolvedConversations/metric.totalConversations)*100).toFixed(1)}%)`)
    console.log(`      Satisfação: ${metric.averageSatisfaction.toFixed(1)}/5`)
    console.log(`      Economia: R$ ${metric.economicImpact.toFixed(2)}`)
  }

  const totalEconomy = metrics.reduce((sum, m) => sum + m.economicImpact, 0)
  console.log(`\n💰 Economia Total Estimada: R$ ${totalEconomy.toFixed(2)}`)

  const alertCount = await prisma.alert.count({
    where: { status: 'active' }
  })

  const criticalAlerts = await prisma.alert.count({
    where: { 
      status: 'active',
      severity: 'critical'
    }
  })

  console.log(`\n🚨 Alertas Ativos: ${alertCount}`)
  if (criticalAlerts > 0) {
    console.log(`   ⚠️  ${criticalAlerts} alertas CRÍTICOS requerem atenção imediata!`)
  }
}

aggregateMetrics()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!')
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })