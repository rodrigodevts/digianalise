import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força rota dinâmica para produção
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verificar conexão com banco
    await prisma.$connect()
    console.log('Buscando alertas...')
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const severity = searchParams.get('severity')

    const where: any = { status }
    if (severity) {
      where.severity = severity
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [
        { severity: 'asc' }, // critical primeiro
        { detectedAt: 'desc' }
      ]
    })

    // Estatísticas dos alertas
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      urgent: alerts.filter(a => a.severity === 'urgent').length,
      monitor: alerts.filter(a => a.severity === 'monitor').length,
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        stats
      }
    })
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Marcar alerta como resolvido
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
        acknowledgedAt: status === 'acknowledged' ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}