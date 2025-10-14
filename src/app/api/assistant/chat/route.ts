import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
});

async function getMetricsContext() {
  try {
    // Buscar métricas mais recentes
    const recentMetrics = await prisma.serviceMetrics.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });

    // Buscar alertas ativos
    const activeAlerts = await prisma.alert.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calcular estatísticas gerais
    const totalConversations = recentMetrics.reduce(
      (acc, m) => acc + m.totalConversations,
      0
    );
    const totalResolved = recentMetrics.reduce(
      (acc, m) => acc + m.resolvedConversations,
      0
    );
    const totalAbandoned = recentMetrics.reduce(
      (acc, m) => acc + m.abandonedConversations,
      0
    );
    const avgSatisfaction =
      recentMetrics.length > 0
        ? recentMetrics.reduce((acc, m) => acc + m.averageSatisfaction, 0) /
          recentMetrics.length
        : 0;

    const abandonmentRate =
      totalConversations > 0 ? (totalAbandoned / totalConversations) * 100 : 0;
    const resolutionRate =
      totalConversations > 0 ? (totalResolved / totalConversations) * 100 : 0;

    // Agrupar por serviço
    const serviceStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.service]) {
        acc[metric.service] = {
          total: 0,
          resolved: 0,
          abandoned: 0,
          satisfaction: 0,
          count: 0,
        };
      }
      acc[metric.service].total += metric.totalConversations;
      acc[metric.service].resolved += metric.resolvedConversations;
      acc[metric.service].abandoned += metric.abandonedConversations;
      acc[metric.service].satisfaction += metric.averageSatisfaction;
      acc[metric.service].count += 1;
      return acc;
    }, {} as Record<string, any>);

    // Calcular médias por serviço
    Object.keys(serviceStats).forEach((service) => {
      const stats = serviceStats[service];
      stats.abandonmentRate =
        stats.total > 0 ? (stats.abandoned / stats.total) * 100 : 0;
      stats.resolutionRate =
        stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;
      stats.avgSatisfaction =
        stats.count > 0 ? stats.satisfaction / stats.count : 0;
    });

    return {
      overview: {
        totalConversations,
        totalResolved,
        totalAbandoned,
        abandonmentRate: Math.round(abandonmentRate * 100) / 100,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      },
      serviceStats,
      alerts: activeAlerts.map((alert: any) => ({
        type: alert.type,
        service: alert.service,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        recommendation: alert.recommendation,
      })),
      recentMetrics: recentMetrics.slice(0, 5).map((m: any) => ({
        service: m.service,
        date: m.date,
        conversations: m.totalConversations,
        abandonmentRate:
          m.totalConversations > 0
            ? Math.round(
                (m.abandonedConversations / m.totalConversations) * 10000
              ) / 100
            : 0,
        satisfaction: m.averageSatisfaction,
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar contexto:", error);
    return {
      overview: { error: "Dados não disponíveis" },
      serviceStats: {},
      alerts: [],
      recentMetrics: [],
    };
  }
}

function buildAssistantPrompt(userMessage: string, context: any, wantsRecommendations: boolean = false): string {
  return `Você é um assistente especializado em análise de dados para tomada de decisão na SEFIN (Secretaria de Finanças) de Vitória da Conquista.

CONTEXTO ATUAL DOS DADOS:

VISÃO GERAL:
- Total de conversas: ${context.overview?.totalConversations || "N/A"}
- Taxa de abandono: ${context.overview?.abandonmentRate || "N/A"}%
- Taxa de resolução: ${context.overview?.resolutionRate || "N/A"}%
- Satisfação média: ${context.overview?.avgSatisfaction || "N/A"}/5

ALERTAS ATIVOS:
${
  context.alerts.length > 0
    ? context.alerts
        .map(
          (alert: any) =>
            `- [${alert.severity.toUpperCase()}] ${alert.title}: ${
              alert.description
            }
    Recomendação: ${alert.recommendation}`
        )
        .join("\n")
    : "- Nenhum alerta ativo"
}

ESTATÍSTICAS POR SERVIÇO:
${
  Object.keys(context.serviceStats).length > 0
    ? Object.entries(context.serviceStats)
        .map(
          ([service, stats]: [string, any]) =>
            `- ${service}: ${stats.total} conversas, ${Math.round(
              stats.abandonmentRate
            )}% abandono, ${
              Math.round(stats.avgSatisfaction * 100) / 100
            } satisfação`
        )
        .join("\n")
    : "- Dados não disponíveis"
}

MÉTRICAS RECENTES:
${
  context.recentMetrics.length > 0
    ? context.recentMetrics
        .map(
          (m: any) =>
            `- ${m.service}: ${m.conversations} conversas, ${m.abandonmentRate}% abandono`
        )
        .join("\n")
    : "- Dados não disponíveis"
}

PERGUNTA DO USUÁRIO: ${userMessage}

INSTRUÇÕES:
1. RESPONDA APENAS O QUE FOI PERGUNTADO - seja direto e específico
2. Use os dados fornecidos para responder com precisão 
3. NÃO adicione informações extras, problemas gerais ou contexto não solicitado
4. Seja conciso e objetivo, focando exclusivamente na pergunta
5. Use linguagem clara para gestores
6. Se não houver dados suficientes, informe que precisa de mais informações

IMPORTANTE: 
- Responda SOMENTE a pergunta feita
- NÃO adicione informações extras, problemas gerais ou contexto não solicitado
${wantsRecommendations ? 
  '- O usuário QUER recomendações: forneça sugestões específicas e acionáveis para resolver o problema identificado' : 
  '- AO FINAL da resposta, pergunte: "Gostaria de recomendações e ações imediatas sobre este tópico?"'
}
- Seja conciso e direto

Responda exclusivamente a pergunta do usuário de forma objetiva.`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API Key do Gemini não configurada" },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "JSON inválido no body da requisição" },
        { status: 400 }
      );
    }

    const { message } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Mensagem muito longa (máximo 1000 caracteres)",
        },
        { status: 400 }
      );
    }

    // Detectar se o usuário quer recomendações
    const wantsRecommendations = /\b(sim|yes|quero|gostaria|recomenda|sugest|ação|melhor)/i.test(message.toLowerCase())

    // Buscar contexto dos dados
    const context = await getMetricsContext();

    // Construir prompt
    const prompt = buildAssistantPrompt(message, context, wantsRecommendations);

    // Chamar IA
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText || responseText.trim() === "") {
      throw new Error("Resposta vazia da IA");
    }

    // Gerar insights baseados nos dados
    const insights = [];

    // Insights sobre alertas críticos
    const criticalAlerts = context.alerts.filter(
      (a) => a.severity === "critical"
    );
    if (criticalAlerts.length > 0) {
      insights.push(
        `🚨 ${criticalAlerts.length} alerta(s) crítico(s) ativo(s)`
      );
    }

    // Insights sobre abandono
    if (
      context?.overview?.abandonmentRate &&
      context?.overview?.abandonmentRate > 30
    ) {
      insights.push(
        `⚠️ Taxa de abandono alta: ${context.overview.abandonmentRate}%`
      );
    }

    // Insights sobre satisfação
    if (
      context?.overview?.avgSatisfaction &&
      context?.overview?.avgSatisfaction < 3
    ) {
      insights.push(
        `😞 Satisfação baixa: ${context.overview.avgSatisfaction}/5`
      );
    }

    // Insights sobre melhor/pior serviço
    const services = Object.entries(context.serviceStats);
    if (services.length > 0) {
      const bestService = services.reduce(
        (best, [service, stats]: [string, any]) =>
          stats.avgSatisfaction > (best[1] as any).avgSatisfaction
            ? [service, stats]
            : best
      );
      const worstService = services.reduce(
        (worst, [service, stats]: [string, any]) =>
          stats.avgSatisfaction < (worst[1] as any).avgSatisfaction
            ? [service, stats]
            : worst
      );

      if (bestService[0] !== worstService[0]) {
        insights.push(`📈 Melhor serviço: ${bestService[0]}`);
        insights.push(`📉 Precisa atenção: ${worstService[0]}`);
      }
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      insights: insights.slice(0, 4), // Máximo 4 insights
    });
  } catch (error) {
    console.error("Erro no assistente:", error);

    let errorMessage = "Erro interno do servidor";

    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        errorMessage = "Cota da API excedida. Tente novamente mais tarde.";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Muitas requisições. Aguarde um momento.";
      } else if (error.message.includes("API key")) {
        errorMessage = "Erro de autenticação da IA";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
