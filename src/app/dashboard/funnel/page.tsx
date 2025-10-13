'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingDown, Users, ArrowDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell, LabelList } from 'recharts'

interface FunnelData {
  service: string
  metrics: {
    inicio: number
    explicacao: number
    solicitacao: number
    processamento: number
    conclusao: number
  }
  totalConversations: number
}

interface MetricsData {
  metrics: Array<{
    service: string
    totalConversations: number
    funnelMetrics: string
  }>
}

const stageNames = {
  inicio: 'Início da Conversa',
  explicacao: 'Explicação do Serviço', 
  solicitacao: 'Solicitação Específica',
  processamento: 'Processamento',
  conclusao: 'Conclusão'
}

const serviceNames: Record<string, string> = {
  'IPTU': 'IPTU - Imposto Predial',
  'CERTIDAO_NEGATIVA': 'Certidão Negativa', 
  'DIVIDA_ATIVA': 'Dívida Ativa',
  'ALVARA': 'Alvará de Funcionamento',
  'OUTROS': 'Outros Serviços',
  'NAO_IDENTIFICADO': 'Não Identificado'
}

export default function FunnelPage() {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics')
        const data = await response.json()

        if (data.success) {
          const processedData = data.data.metrics.map((metric: any) => {
            let funnelMetrics
            try {
              funnelMetrics = JSON.parse(metric.funnelMetrics || '{}')
            } catch {
              funnelMetrics = {
                inicio: 0,
                explicacao: 0, 
                solicitacao: 0,
                processamento: 0,
                conclusao: 0
              }
            }

            return {
              service: metric.service,
              metrics: funnelMetrics,
              totalConversations: metric.totalConversations
            }
          })

          setFunnelData(processedData)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do funil:', error)
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
          <p className="mt-2 text-gray-600">Carregando dados do funil...</p>
        </div>
      </div>
    )
  }

  if (!funnelData.length) {
    return (
      <div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum dado de funil encontrado. Execute os scripts de processamento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calcular funil geral (soma de todos os serviços)
  const generalFunnel = funnelData.reduce((acc, service) => {
    acc.inicio += service.metrics.inicio || 0
    acc.explicacao += service.metrics.explicacao || 0
    acc.solicitacao += service.metrics.solicitacao || 0
    acc.processamento += service.metrics.processamento || 0
    acc.conclusao += service.metrics.conclusao || 0
    return acc
  }, {
    inicio: 0,
    explicacao: 0,
    solicitacao: 0,
    processamento: 0,
    conclusao: 0
  })

  const calculateDropoff = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((previous - current) / previous) * 100
  }

  // Preparar dados para gráfico de funil
  const funnelChartData = [
    { name: 'Início', value: generalFunnel.inicio, fill: '#3b82f6' },
    { name: 'Explicação', value: generalFunnel.explicacao, fill: '#10b981' },
    { name: 'Solicitação', value: generalFunnel.solicitacao, fill: '#f59e0b' },
    { name: 'Processamento', value: generalFunnel.processamento, fill: '#ef4444' },
    { name: 'Conclusão', value: generalFunnel.conclusao, fill: '#8b5cf6' }
  ]

  // Dados para gráfico de dropoff
  const dropoffData = [
    { 
      etapa: 'Início → Explicação', 
      dropoff: calculateDropoff(generalFunnel.explicacao, generalFunnel.inicio),
      count: generalFunnel.inicio - generalFunnel.explicacao
    },
    { 
      etapa: 'Explicação → Solicitação', 
      dropoff: calculateDropoff(generalFunnel.solicitacao, generalFunnel.explicacao),
      count: generalFunnel.explicacao - generalFunnel.solicitacao
    },
    { 
      etapa: 'Solicitação → Processamento', 
      dropoff: calculateDropoff(generalFunnel.processamento, generalFunnel.solicitacao),
      count: generalFunnel.solicitacao - generalFunnel.processamento
    },
    { 
      etapa: 'Processamento → Conclusão', 
      dropoff: calculateDropoff(generalFunnel.conclusao, generalFunnel.processamento),
      count: generalFunnel.processamento - generalFunnel.conclusao
    }
  ]

  const FunnelStage = ({ 
    stage, 
    count, 
    previousCount, 
    isLast = false 
  }: { 
    stage: string
    count: number
    previousCount?: number
    isLast?: boolean 
  }) => {
    const percentage = generalFunnel.inicio > 0 ? (count / generalFunnel.inicio) * 100 : 0
    const dropoff = previousCount ? calculateDropoff(count, previousCount) : 0
    
    return (
      <div className="text-center">
        <div className="relative">
          <div className="bg-blue-100 rounded-lg p-6 mb-2">
            <div className="text-2xl font-bold text-blue-900">{count.toLocaleString()}</div>
            <div className="text-sm font-medium text-blue-700">{stageNames[stage as keyof typeof stageNames]}</div>
            <div className="text-xs text-blue-600 mt-1">{percentage.toFixed(1)}% do total</div>
            
            {previousCount && dropoff > 0 && (
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  -{dropoff.toFixed(1)}% dropoff
                </Badge>
              </div>
            )}
          </div>
          
          {!isLast && (
            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Funil de Conversão</h1>
        <p className="text-gray-600 mt-2">
          Análise do fluxo de atendimento e pontos de abandono
        </p>
      </div>

      {/* Visualizações do Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Funil de Conversão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={funnelChartData} layout="horizontal">
                <defs>
                  <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} pessoas`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${index})`}
                    />
                  ))}
                  <defs>
                    {funnelChartData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={entry.fill} stopOpacity={0.4}/>
                      </linearGradient>
                    ))}
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Análise de Dropoff</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dropoffData}>
                <defs>
                  <linearGradient id="dropoffGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="etapa" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'dropoff' ? `${Number(value).toFixed(1)}%` : `${value} pessoas`,
                    name === 'dropoff' ? 'Taxa de Dropoff' : 'Pessoas Perdidas'
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar 
                  dataKey="dropoff" 
                  fill="url(#dropoffGradient)" 
                  name="dropoff"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas do Funil Geral */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">Métricas Gerais do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">
                {generalFunnel.inicio > 0 ? ((generalFunnel.conclusao / generalFunnel.inicio) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-emerald-600 font-medium">Taxa de Conversão Geral</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {generalFunnel.inicio > 0 ? (((generalFunnel.inicio - generalFunnel.conclusao) / generalFunnel.inicio) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-red-600 font-medium">Taxa de Abandono</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">
                {Math.max(...dropoffData.map(d => d.dropoff)).toFixed(1)}%
              </div>
              <div className="text-sm text-amber-600 font-medium">Maior Dropoff</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">
                {Object.values(generalFunnel).reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 font-medium">Total de Interações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funil por Serviço */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Funil por Serviço</h2>
        
        {funnelData.map((service) => {
          const conversionRate = service.metrics.inicio > 0 
            ? (service.metrics.conclusao / service.metrics.inicio) * 100 
            : 0
          
          const abandonmentRate = service.metrics.inicio > 0 
            ? ((service.metrics.inicio - service.metrics.conclusao) / service.metrics.inicio) * 100 
            : 0

          // Encontrar maior dropoff
          const dropoffs = [
            calculateDropoff(service.metrics.explicacao, service.metrics.inicio),
            calculateDropoff(service.metrics.solicitacao, service.metrics.explicacao),
            calculateDropoff(service.metrics.processamento, service.metrics.solicitacao),
            calculateDropoff(service.metrics.conclusao, service.metrics.processamento)
          ]
          const maxDropoff = Math.max(...dropoffs)

          return (
            <Card key={service.service} className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-slate-700">
                    {serviceNames[service.service] || service.service}
                  </CardTitle>
                  <div className="text-sm text-slate-500 font-medium">
                    {service.totalConversations} conversas totais
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(service.metrics).map(([stage, count], index) => {
                    const previousStage = Object.entries(service.metrics)[index - 1]
                    const previousCount = previousStage ? previousStage[1] : undefined
                    const percentage = service.metrics.inicio > 0 ? (count / service.metrics.inicio) * 100 : 0
                    
                    return (
                      <div key={stage} className="text-center">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 mb-1 shadow-sm">
                          <div className="font-bold text-blue-900 text-lg">{count}</div>
                          <div className="text-xs text-blue-700 font-medium">{stageNames[stage as keyof typeof stageNames]}</div>
                          <div className="text-xs text-blue-600">{percentage.toFixed(0)}%</div>
                        </div>
                        {index < Object.entries(service.metrics).length - 1 && (
                          <ArrowDown className="h-4 w-4 text-slate-400 mx-auto" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${conversionRate >= 70 ? 'text-green-600' : conversionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Taxa de Conversão</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${abandonmentRate <= 30 ? 'text-green-600' : abandonmentRate <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {abandonmentRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Taxa de Abandono</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${maxDropoff <= 20 ? 'text-green-600' : maxDropoff <= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {maxDropoff.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Maior Dropoff</div>
                  </div>
                </div>

                {/* Alertas por serviço */}
                {abandonmentRate > 50 && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Taxa de abandono crítica:</strong> {abandonmentRate.toFixed(1)}% dos cidadãos abandonam este serviço
                    </AlertDescription>
                  </Alert>
                )}

                {maxDropoff > 40 && (
                  <Alert className="mt-4 border-orange-200 bg-orange-50">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Dropoff alto detectado:</strong> {maxDropoff.toFixed(1)}% de perda em uma etapa específica
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Insights e Recomendações */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generalFunnel.inicio > 0 && ((generalFunnel.conclusao / generalFunnel.inicio) * 100) < 60 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Taxa de conversão baixa:</strong> Apenas {((generalFunnel.conclusao / generalFunnel.inicio) * 100).toFixed(1)}% das conversas chegam à conclusão. 
                  Considere melhorar a experiência do usuário nas etapas intermediárias.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Pontos Fortes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {generalFunnel.inicio.toLocaleString()} cidadãos iniciaram conversas</li>
                  <li>• {generalFunnel.conclusao.toLocaleString()} conversas concluídas com sucesso</li>
                  <li>• Sistema processa {generalFunnel.processamento.toLocaleString()} solicitações</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Áreas de Melhoria</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Reduzir abandono na etapa de explicação</li>
                  <li>• Simplificar processo de solicitação</li>
                  <li>• Melhorar feedback durante processamento</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}