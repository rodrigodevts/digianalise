import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const service = searchParams.get('service')
    const sentiment = searchParams.get('sentiment')
    const resolved = searchParams.get('resolved')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (service || sentiment || resolved !== null) {
      where.analysis = {}
      
      if (service) {
        where.analysis.primaryService = service
      }
      
      if (sentiment) {
        where.analysis.sentiment = sentiment
      }
      
      if (resolved !== null) {
        where.analysis.wasResolved = resolved === 'true'
      }
    }

    // Buscar conversas com paginação
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          analysis: true,
          _count: {
            select: { messages: true }
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}