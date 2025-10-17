'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp, Users, MessageSquare, DollarSign, ArrowRight } from 'lucide-react'

interface ServiceMetric {
  service: string
  totalConversations: number
  resolvedConversations: number
  abandonedConversations: number
  averageSatisfaction: number
  economicImpact: number
  growthRate: number
  positiveCount: number
  neutralCount: number
  negativeCount: number
  frustratedCount: number
}

interface MetricsData {
  metrics: ServiceMetric[]
}

const serviceNames: Record<string, string> = {
  'IPTU': 'IPTU - Imposto Predial',
  'CERTIDAO_NEGATIVA': 'Certidão Negativa',
  'DIVIDA_ATIVA': 'Dívida Ativa',
  'ALVARA': 'Alvará de Funcionamento',
  'OUTROS': 'Outros Serviços',
  'NAO_IDENTIFICADO': 'Não Identificado'
}

export default function ServicesPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics')
        const data = await response.json()

        if (data.success) {
          setMetricsData(data.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados dos serviços...</p>
        </div>
      </div>
    )
  }

  if (!metricsData || !metricsData.metrics.length) {
    return (
      <div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum dado de serviços encontrado. Execute os scripts de processamento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getSentimentColor = (positive: number, neutral: number, negative: number, frustrated: number) => {
    const total = positive + neutral + negative + frustrated
    const positiveRate = total > 0 ? (positive / total) * 100 : 0
    
    if (positiveRate >= 70) return 'text-green-600'
    if (positiveRate >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análise por Serviços</h1>
        <p className="text-gray-600 mt-2">
          Desempenho detalhado de cada serviço prestado
        </p>
      </div>

      {/* Grid de Serviços */}
      <div className="grid gap-6">
        {metricsData.metrics.map((service) => {
          const resolutionRate = service.totalConversations > 0 
            ? (service.resolvedConversations / service.totalConversations) * 100 
            : 0
          
          const abandonmentRate = service.totalConversations > 0 
            ? (service.abandonedConversations / service.totalConversations) * 100 
            : 0

          const totalSentiments = service.positiveCount + service.neutralCount + service.negativeCount + service.frustratedCount
          const sentimentColor = getSentimentColor(
            service.positiveCount, 
            service.neutralCount, 
            service.negativeCount, 
            service.frustratedCount
          )

          return (
            <Card key={service.service} className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {serviceNames[service.service] || service.service}
                  </h3>
                  <p className="text-gray-600">
                    {service.totalConversations} conversas analisadas
                  </p>
                </div>
                <Link href={`/dashboard/services/${service.service}`}>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Taxa de Resolução */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Taxa de Resolução</span>
                    <span className="text-sm font-bold">{resolutionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={resolutionRate} className="h-2" />
                </div>

                {/* Satisfação */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Satisfação</span>
                    <span className={`text-sm font-bold ${sentimentColor}`}>
                      {service.averageSatisfaction.toFixed(1)}/5
                    </span>
                  </div>
                  <Progress 
                    value={(service.averageSatisfaction / 5) * 100} 
                    className="h-2" 
                  />
                </div>

                {/* Crescimento */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Crescimento</span>
                    <span className={`text-sm font-bold ${
                      service.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {service.growthRate >= 0 ? '+' : ''}{service.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Economia */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Economia</span>
                    <span className="text-sm font-bold text-green-600">
                      R$ {service.economicImpact.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribuição de Sentimentos */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Sentimentos</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{service.positiveCount}</div>
                    <div className="text-xs text-gray-500">Positivos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{service.neutralCount}</div>
                    <div className="text-xs text-gray-500">Neutros</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{service.negativeCount}</div>
                    <div className="text-xs text-gray-500">Negativos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{service.frustratedCount}</div>
                    <div className="text-xs text-gray-500">Frustrados</div>
                  </div>
                </div>
              </div>

              {/* Alertas se taxa de abandono alta */}
              {abandonmentRate > 30 && (
                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Taxa de abandono alta:</strong> {abandonmentRate.toFixed(1)}% das conversas são abandonadas
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          )
        })}
      </div>

      {/* Resumo Geral */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Resumo Geral dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metricsData.metrics.length}
              </div>
              <div className="text-sm text-gray-500">Serviços Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metricsData.metrics.reduce((sum, s) => sum + s.totalConversations, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total de Conversas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metricsData.metrics.length > 0 
                  ? (metricsData.metrics.reduce((sum, s) => 
                      sum + (s.totalConversations > 0 ? (s.resolvedConversations / s.totalConversations) * 100 : 0)
                    , 0) / metricsData.metrics.length).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-500">Taxa Média de Resolução</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {metricsData.metrics.reduce((sum, s) => sum + s.economicImpact, 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </div>
              <div className="text-sm text-gray-500">Economia Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}