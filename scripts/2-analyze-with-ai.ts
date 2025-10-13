#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' })

const AnalysisSchema = z.object({
  primaryService: z.enum([
    'IPTU',
    'CERTIDAO_NEGATIVA',
    'DIVIDA_ATIVA',
    'ALVARA',
    'OUTROS',
    'NAO_IDENTIFICADO'
  ]),
  secondaryServices: z.array(z.string()),
  sentiment: z.enum(['positivo', 'neutro', 'negativo', 'frustrado']),
  userProfile: z.enum(['urgente', 'confuso', 'revoltado', 'tranquilo']),
  frustrationLevel: z.number().min(0).max(10),
  keyPhrases: z.array(z.string()),
  userIntent: z.enum(['informacao', 'acao', 'reclamacao', 'duvida', 'outros']),
  wasResolved: z.boolean(),
  resolutionStage: z.string().nullable(),
  abandonmentReason: z.string().nullable(),
  opportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
  funnelStage: z.enum(['inicio', 'explicacao', 'solicitacao', 'processamento', 'conclusao']),
  dropoffPoint: z.string().nullable()
})

type AnalysisResult = z.infer<typeof AnalysisSchema>

function buildPrompt(messages: any[]): string {
  const conversationText = messages
    .map(m => `[${m.sender === 'user' ? 'CIDADÃO' : 'SISTEMA'}]: ${m.content}`)
    .join('\n')

  return `Analise esta conversa entre um cidadão e o sistema de atendimento da SEFIN (Secretaria de Finanças) de Vitória da Conquista.

CONVERSA:
${conversationText}

CONTEXTO:
- IPTU: Imposto Predial, boletos, parcelamento, isenções
- Certidão Negativa: Documento para licitações, financiamentos
- Dívida Ativa: Débitos inscritos, renegociação
- Alvará: Funcionamento de empresas

ANALISE E RETORNE UM JSON COM:

1. primaryService: Serviço principal (IPTU, CERTIDAO_NEGATIVA, DIVIDA_ATIVA, ALVARA, OUTROS, NAO_IDENTIFICADO)

2. secondaryServices: Array de outros serviços mencionados

3. sentiment: Sentimento geral (positivo, neutro, negativo, frustrado)

4. userProfile: Perfil do cidadão (RETORNE APENAS UMA STRING)
   - "urgente": Menciona urgência, prazo, "preciso hoje"
   - "confuso": Não entende, pede explicação repetida
   - "revoltado": Reclama, contesta valores, injustiça
   - "tranquilo": Educado, sem pressa

5. frustrationLevel: 0-10 (0=sem frustração, 10=extremamente frustrado)

6. keyPhrases: Array das 3-5 frases mais importantes do cidadão

7. userIntent: Intenção principal (informacao, acao, reclamacao, duvida, outros)

8. wasResolved: Se o problema foi resolvido (true/false)

9. resolutionStage: Em que momento foi resolvido (ou null)

10. abandonmentReason: Motivo do abandono se não resolvido (ou null)

11. opportunities: Array de oportunidades identificadas (ex: "Cidadão pode se beneficiar de parcelamento")

12. recommendations: Array de recomendações para melhorar o atendimento

13. funnelStage: Até onde chegou (inicio, explicacao, solicitacao, processamento, conclusao)

14. dropoffPoint: Onde abandonou se não concluiu (ou null)

IMPORTANTE: 
- Retorne APENAS um objeto JSON válido
- NÃO retorne um array, retorne um OBJETO
- NÃO inclua explicações, markdown ou qualquer outro texto
- O JSON deve começar com { e terminar com }

EXEMPLO DO FORMATO EXATO ESPERADO:
{
  "primaryService": "IPTU",
  "secondaryServices": ["CERTIDAO_NEGATIVA"],
  "sentiment": "positivo",
  "userProfile": "tranquilo",
  "frustrationLevel": 2,
  "keyPhrases": ["segunda via", "boleto"],
  "userIntent": "acao",
  "wasResolved": true,
  "resolutionStage": "conclusao",
  "abandonmentReason": null,
  "opportunities": [],
  "recommendations": ["Melhorar processo"],
  "funnelStage": "conclusao",
  "dropoffPoint": null
}`
}

async function analyzeConversation(conversation: any): Promise<AnalysisResult | null> {
  try {
    const prompt = buildPrompt(conversation.messages)
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })

    const response = await result.response
    const text = response.text()
    
    let parsed = JSON.parse(text)
    
    // Fallback: se ainda retornar array, pegar o primeiro elemento
    if (Array.isArray(parsed)) {
      console.log('   ⚠️  IA retornou array, extraindo primeiro elemento')
      parsed = parsed[0]
    }
    
    // Verificar se é um objeto válido
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('IA não retornou um objeto JSON válido')
    }
    
    const validated = AnalysisSchema.parse(parsed)
    
    return validated
  } catch (error) {
    console.error('Erro na análise:', error)
    if (error instanceof z.ZodError) {
      console.error('Erro de validação:', error.errors)
    }
    return null
  }
}

async function analyzeAllConversations() {
  console.log('🤖 Iniciando análise com IA...\n')
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não configurada no .env.local')
    process.exit(1)
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      analysis: null
    },
    include: {
      messages: {
        orderBy: {
          timestamp: 'asc'
        }
      }
    }
  })

  if (conversations.length === 0) {
    console.log('ℹ️  Nenhuma conversa para analisar')
    console.log('    Todas as conversas já foram analisadas ou não há conversas no banco')
    return
  }

  console.log(`📊 ${conversations.length} conversas para analisar\n`)

  let analyzed = 0
  let errors = 0
  const batchSize = parseInt(process.env.BATCH_SIZE || '10')
  const rateLimit = parseInt(process.env.RATE_LIMIT_DELAY || '1000')

  for (let i = 0; i < conversations.length; i += batchSize) {
    const batch = conversations.slice(i, i + batchSize)
    
    console.log(`\n📦 Processando batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(conversations.length/batchSize)}`)
    
    for (const conversation of batch) {
      try {
        console.log(`   🔍 Analisando conversa ${conversation.ticketId}...`)
        
        const analysis = await analyzeConversation(conversation)
        
        if (analysis) {
          await prisma.conversationAnalysis.create({
            data: {
              conversationId: conversation.id,
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
          
          analyzed++
          console.log(`   ✅ Análise concluída (${analyzed}/${conversations.length})`)
        } else {
          errors++
          console.log(`   ⚠️  Falha na análise`)
        }
        
        await new Promise(resolve => setTimeout(resolve, rateLimit))
        
      } catch (error) {
        errors++
        console.error(`   ❌ Erro ao analisar conversa ${conversation.ticketId}:`, error)
      }
    }
    
    if (i + batchSize < conversations.length) {
      console.log(`\n⏳ Aguardando antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, rateLimit * 2))
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✨ Análise concluída!')
  console.log('='.repeat(50))
  console.log(`✅ Conversas analisadas: ${analyzed}`)
  console.log(`❌ Erros: ${errors}`)

  const stats = await prisma.conversationAnalysis.groupBy({
    by: ['primaryService'],
    _count: true
  })

  console.log('\n📊 Distribuição por Serviço:')
  stats.forEach(s => {
    console.log(`   ${s.primaryService}: ${s._count}`)
  })

  const sentimentStats = await prisma.conversationAnalysis.groupBy({
    by: ['sentiment'],
    _count: true
  })

  console.log('\n😊 Distribuição de Sentimento:')
  sentimentStats.forEach(s => {
    console.log(`   ${s.sentiment}: ${s._count}`)
  })
}

analyzeAllConversations()
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