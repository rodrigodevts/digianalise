import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite' 
})

function buildPrompt(messages: any[]): string {
  const conversationText = messages
    .map(m => `[${m.sender === 'user' ? 'CIDADÃO' : 'SISTEMA'}]: ${m.content}`)
    .join('\n')

  return `Analise esta conversa entre um cidadão e o sistema de atendimento da Secretaria de Finanças municipal.

CONVERSA:
${conversationText}

CONTEXTO:
- IPTU: Imposto Predial e Territorial Urbano
- Certidão Negativa: Documento que comprova ausência de débitos
- Dívida Ativa: Débitos não pagos inscritos
- Alvará: Licença de funcionamento

Retorne a análise em formato JSON com:
{
  "primaryService": "IPTU|CERTIDAO_NEGATIVA|DIVIDA_ATIVA|ALVARA|OUTROS|NAO_IDENTIFICADO",
  "secondaryServices": ["lista de outros serviços mencionados"],
  "sentiment": "positivo|neutro|negativo|frustrado",
  "userProfile": "urgente|confuso|revoltado|tranquilo",
  "frustrationLevel": 0-10,
  "keyPhrases": ["frases importantes"],
  "userIntent": "informacao|acao|reclamacao|duvida|outros",
  "wasResolved": true/false,
  "resolutionStage": "etapa onde foi resolvido ou null",
  "abandonmentReason": "motivo do abandono ou null",
  "opportunities": ["oportunidades de melhoria"],
  "recommendations": ["recomendações"],
  "funnelStage": "inicio|explicacao|solicitacao|processamento|conclusao",
  "dropoffPoint": "onde abandonou ou null"
}

Responda APENAS com o JSON, sem explicações adicionais.`
}

export async function POST(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY não configurada' },
        { status: 500 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'JSON inválido no body da requisição' },
        { status: 400 }
      )
    }

    const { conversationId, limit = 10, skip = 0 } = body

    // Validar parâmetros
    if (conversationId && typeof conversationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'conversationId deve ser uma string' },
        { status: 400 }
      )
    }

    if (typeof limit !== 'number' || limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: 'limit deve ser um número entre 1 e 50' },
        { status: 400 }
      )
    }

    if (typeof skip !== 'number' || skip < 0) {
      return NextResponse.json(
        { success: false, error: 'skip deve ser um número >= 0' },
        { status: 400 }
      )
    }

    // Se conversationId específico, processar apenas ele
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { timestamp: 'asc' } } }
      })

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: 'Conversa não encontrada' },
          { status: 404 }
        )
      }

      // Verificar se já foi analisada
      const existingAnalysis = await prisma.conversationAnalysis.findUnique({
        where: { conversationId }
      })

      if (existingAnalysis) {
        return NextResponse.json({
          success: true,
          message: 'Conversa já analisada',
          data: existingAnalysis
        })
      }

      // Analisar com IA
      const prompt = buildPrompt(conversation.messages)
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Parse do JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta da IA inválida')
      }

      const analysis = JSON.parse(jsonMatch[0])

      // Salvar análise
      const savedAnalysis = await prisma.conversationAnalysis.create({
        data: {
          conversationId,
          primaryService: analysis.primaryService,
          secondaryServices: JSON.stringify(analysis.secondaryServices),
          sentiment: analysis.sentiment,
          userProfile: analysis.userProfile,
          frustrationLevel: analysis.frustrationLevel,
          keyPhrases: JSON.stringify(analysis.keyPhrases),
          userIntent: analysis.userIntent,
          wasResolved: analysis.wasResolved,
          resolutionStage: analysis.resolutionStage,
          abandonmentReason: analysis.abandonmentReason,
          opportunities: JSON.stringify(analysis.opportunities),
          recommendations: JSON.stringify(analysis.recommendations),
          funnelStage: analysis.funnelStage,
          dropoffPoint: analysis.dropoffPoint
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Análise concluída',
        data: savedAnalysis
      })
    }

    // Processar em lote
    const conversations = await prisma.conversation.findMany({
      where: {
        analysis: null // Apenas conversas sem análise
      },
      include: {
        messages: { orderBy: { timestamp: 'asc' } }
      },
      skip,
      take: limit
    })

    if (conversations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma conversa para analisar',
        stats: { processed: 0, total: 0 }
      })
    }

    let processed = 0
    const errors: string[] = []
    const BATCH_SIZE = 5 // Processar 5 por vez para evitar rate limiting
    const DELAY = 1000 // 1 segundo entre batches

    for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
      const batch = conversations.slice(i, i + BATCH_SIZE)
      
      await Promise.all(batch.map(async (conversation) => {
        try {
          // Validar se a conversa tem mensagens
          if (!conversation.messages || conversation.messages.length === 0) {
            throw new Error('Conversa sem mensagens')
          }

          const prompt = buildPrompt(conversation.messages)
          
          // Fazer chamada para IA com retry
          let result
          let attempts = 0
          const maxAttempts = 3
          
          while (attempts < maxAttempts) {
            try {
              result = await model.generateContent(prompt)
              break
            } catch (aiError) {
              attempts++
              if (attempts === maxAttempts) {
                throw new Error(`Falha na IA após ${maxAttempts} tentativas: ${aiError instanceof Error ? aiError.message : String(aiError)}`)
              }
              // Aguardar antes de tentar novamente
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
            }
          }
          
          if (!result) {
            throw new Error('Resultado da IA está vazio')
          }

          const responseText = result.response.text()
          
          if (!responseText || responseText.trim() === '') {
            throw new Error('Resposta da IA está vazia')
          }
          
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            throw new Error(`Resposta da IA inválida. Resposta recebida: ${responseText.substring(0, 200)}...`)
          }

          let analysis
          try {
            analysis = JSON.parse(jsonMatch[0])
          } catch (parseError) {
            throw new Error(`Erro ao fazer parse do JSON da IA: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
          }

          // Validar campos obrigatórios da análise
          const requiredFields = ['primaryService', 'sentiment', 'userProfile', 'frustrationLevel', 'wasResolved']
          for (const field of requiredFields) {
            if (analysis[field] === undefined || analysis[field] === null) {
              throw new Error(`Campo obrigatório ausente na análise: ${field}`)
            }
          }

          // Validar tipos
          if (typeof analysis.frustrationLevel !== 'number' || analysis.frustrationLevel < 0 || analysis.frustrationLevel > 10) {
            throw new Error('frustrationLevel deve ser um número entre 0 e 10')
          }

          if (typeof analysis.wasResolved !== 'boolean') {
            throw new Error('wasResolved deve ser um boolean')
          }

          await prisma.conversationAnalysis.create({
            data: {
              conversationId: conversation.id,
              primaryService: analysis.primaryService,
              secondaryServices: JSON.stringify(analysis.secondaryServices || []),
              sentiment: analysis.sentiment,
              userProfile: analysis.userProfile,
              frustrationLevel: analysis.frustrationLevel,
              keyPhrases: JSON.stringify(analysis.keyPhrases || []),
              userIntent: analysis.userIntent,
              wasResolved: analysis.wasResolved,
              resolutionStage: analysis.resolutionStage,
              abandonmentReason: analysis.abandonmentReason,
              opportunities: JSON.stringify(analysis.opportunities || []),
              recommendations: JSON.stringify(analysis.recommendations || []),
              funnelStage: analysis.funnelStage,
              dropoffPoint: analysis.dropoffPoint
            }
          })

          processed++
        } catch (error) {
          let errorMsg = `Erro ao analisar conversa ${conversation.id}: `
          
          if (error instanceof Error) {
            if (error.message.includes('quota')) {
              errorMsg += 'Cota da API do Gemini excedida'
            } else if (error.message.includes('rate limit')) {
              errorMsg += 'Limite de taxa da API excedido'
            } else if (error.message.includes('Invalid API key')) {
              errorMsg += 'Chave da API inválida'
            } else {
              errorMsg += error.message
            }
          } else {
            errorMsg += String(error)
          }
          
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }))

      // Delay entre batches
      if (i + BATCH_SIZE < conversations.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY))
      }
    }

    const totalPending = await prisma.conversation.count({
      where: { analysis: null }
    })

    return NextResponse.json({
      success: true,
      message: `${processed} conversas analisadas`,
      stats: {
        processed,
        errors: errors.length,
        remaining: totalPending,
        total: await prisma.conversation.count()
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      },
      { status: 500 }
    )
  }
}

// GET para verificar progresso
export async function GET() {
  try {
    const total = await prisma.conversation.count()
    const analyzed = await prisma.conversationAnalysis.count()
    const pending = total - analyzed

    return NextResponse.json({
      success: true,
      data: {
        total,
        analyzed,
        pending,
        progress: total > 0 ? Math.round((analyzed / total) * 100) : 0
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar progresso' },
      { status: 500 }
    )
  }
}