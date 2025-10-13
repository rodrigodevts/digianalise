'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  HelpCircle,
  AlertOctagon,
  FileQuestion
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface ServiceDetail {
  service: string
  metrics: {
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
    funnelMetrics: {
      inicio: number
      explicacao: number
      solicitacao: number
      processamento: number
      conclusao: number
    }
    topQuestions: Array<{ question: string, count: number }>
    topProblems: Array<{ problem: string, count: number }>
    userProfiles: Record<string, number>
  }
  conversations: Array<{
    id: string
    ticketId: string
    startedAt: string
    duration: number
    status: string
    analysis?: {
      sentiment: string
      wasResolved: boolean
      frustrationLevel: number
    }
    _count: {
      messages: number
    }
  }>
  alerts: Array<{
    id: string
    title: string
    severity: string
    description: string
  }>
}

const serviceNames: Record<string, string> = {
  'IPTU': 'IPTU - Imposto Predial',
  'CERTIDAO_NEGATIVA': 'Certidão Negativa',
  'DIVIDA_ATIVA': 'Dívida Ativa',
  'ALVARA': 'Alvará de Funcionamento',
  'OUTROS': 'Outros Serviços',
  'NAO_IDENTIFICADO': 'Não Identificado'
}

const sentimentColors = {
  'positivo': 'bg-green-100 text-green-800',
  'neutro': 'bg-blue-100 text-blue-800',
  'negativo': 'bg-orange-100 text-orange-800',
  'frustrado': 'bg-red-100 text-red-800'
}

const COLORS = [
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444'  // red-500
]

export default function ServiceDetailPage() {
  const params = useParams()
  const service = params.service as string
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const response = await fetch(`/api/services/${service}`)
        const data = await response.json()

        if (data.success) {
          setServiceDetail(data.data)
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do serviço:', error)
      } finally {
        setLoading(false)
      }
    }

    if (service) {
      fetchServiceDetail()
    }
  }, [service])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando detalhes do serviço...</p>
        </div>
      </div>
    )
  }

  if (!serviceDetail) {
    return (
      <div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Serviço não encontrado ou erro ao carregar dados.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const resolutionRate = serviceDetail.metrics.totalConversations > 0 
    ? (serviceDetail.metrics.resolvedConversations / serviceDetail.metrics.totalConversations) * 100 
    : 0

  const abandonmentRate = serviceDetail.metrics.totalConversations > 0 
    ? (serviceDetail.metrics.abandonedConversations / serviceDetail.metrics.totalConversations) * 100 
    : 0

  // Dados para gráfico de sentimentos
  const sentimentData = [
    { name: 'Positivos', value: serviceDetail.metrics.positiveCount, fill: '#10b981' },
    { name: 'Neutros', value: serviceDetail.metrics.neutralCount, fill: '#6366f1' },
    { name: 'Negativos', value: serviceDetail.metrics.negativeCount, fill: '#f59e0b' },
    { name: 'Frustrados', value: serviceDetail.metrics.frustratedCount, fill: '#ef4444' }
  ].filter(item => item.value > 0)

  // Dados para gráfico de funil
  const funnelData = [
    { name: 'Início', value: serviceDetail.metrics.funnelMetrics.inicio },
    { name: 'Explicação', value: serviceDetail.metrics.funnelMetrics.explicacao },
    { name: 'Solicitação', value: serviceDetail.metrics.funnelMetrics.solicitacao },
    { name: 'Processamento', value: serviceDetail.metrics.funnelMetrics.processamento },
    { name: 'Conclusão', value: serviceDetail.metrics.funnelMetrics.conclusao }
  ]

  // Dados para gráfico de perfis de usuário
  const userProfileData = Object.entries(serviceDetail.metrics.userProfiles).map(([profile, count]) => ({
    name: profile,
    value: count,
    fill: COLORS[Object.keys(serviceDetail.metrics.userProfiles).indexOf(profile) % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/services">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {serviceNames[service] || service}
        </h1>
        <p className="text-gray-600 mt-2">
          Análise detalhada do serviço com {serviceDetail.metrics.totalConversations} conversas analisadas
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceDetail.metrics.totalConversations}</div>
            <p className="text-xs text-muted-foreground">Conversas analisadas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolutionRate.toFixed(1)}%</div>
            <Progress value={resolutionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{serviceDetail.metrics.averageSatisfaction.toFixed(1)}/5</div>
            <Progress value={(serviceDetail.metrics.averageSatisfaction / 5) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Gerada</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {serviceDetail.metrics.economicImpact.toLocaleString('pt-BR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Crescimento: 
              <span className={`ml-1 ${
                serviceDetail.metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {serviceDetail.metrics.growthRate >= 0 ? '+' : ''}{serviceDetail.metrics.growthRate.toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(abandonmentRate > 30 || serviceDetail.metrics.averageSatisfaction < 3) && (
        <div className="space-y-4">
          {abandonmentRate > 30 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Taxa de abandono alta:</strong> {abandonmentRate.toFixed(1)}% das conversas são abandonadas. 
                Considere melhorar a experiência do usuário.
              </AlertDescription>
            </Alert>
          )}
          
          {serviceDetail.metrics.averageSatisfaction < 3 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Satisfação baixa:</strong> Nota média de {serviceDetail.metrics.averageSatisfaction.toFixed(1)}/5. 
                Revise os processos de atendimento.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Alertas Ativos */}
      {serviceDetail.alerts && serviceDetail.alerts.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceDetail.alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                    alert.severity === 'urgent' ? 'border-l-orange-500 bg-orange-50' :
                    'border-l-yellow-500 bg-yellow-50'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'urgent' ? 'secondary' : 
                        'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights e Principais Questões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Principais Perguntas */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Principais Perguntas</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceDetail.metrics.topQuestions && serviceDetail.metrics.topQuestions.length > 0 ? (
              <div className="space-y-3">
                {serviceDetail.metrics.topQuestions.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 flex-1">{item.question}</span>
                    <Badge variant="secondary" className="ml-2">{item.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Nenhuma pergunta encontrada
                </h3>
                <p className="text-xs text-gray-500">
                  Os dados serão exibidos conforme novas conversas forem processadas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Principais Problemas */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Principais Problemas</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceDetail.metrics.topProblems && serviceDetail.metrics.topProblems.length > 0 ? (
              <div className="space-y-3">
                {serviceDetail.metrics.topProblems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-sm text-red-800 flex-1">{item.problem}</span>
                    <Badge variant="destructive" className="ml-2">{item.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertOctagon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Nenhum problema detectado
                </h3>
                <p className="text-xs text-gray-500">
                  Ótimo! Nenhum problema recorrente foi identificado neste serviço
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Sentimentos */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Distribuição de Sentimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funil de Conversão */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
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
                  width={80}
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
                <Bar dataKey="value" fill="url(#funnelGradient)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Perfis de Usuário */}
      {userProfileData.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">Perfis de Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userProfileData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {userProfileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Conversas Recentes */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">Conversas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceDetail.conversations && serviceDetail.conversations.length > 0 ? (
            <div className="space-y-4">
              {serviceDetail.conversations.slice(0, 10).map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">#{conversation.ticketId}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(conversation.startedAt).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {conversation._count.messages} mensagens
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.floor(conversation.duration / 60)}min
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conversation.analysis && (
                      <>
                        <Badge className={sentimentColors[conversation.analysis.sentiment as keyof typeof sentimentColors]}>
                          {conversation.analysis.sentiment}
                        </Badge>
                        {conversation.analysis.wasResolved ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        {conversation.analysis.frustrationLevel > 7 && (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Nenhuma conversa recente
              </h3>
              <p className="text-xs text-gray-500">
                As conversas aparecerão aqui quando forem processadas pelo sistema
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Pontos Fortes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {serviceDetail.metrics.resolvedConversations} conversas resolvidas com sucesso</li>
                <li>• Taxa de resolução de {resolutionRate.toFixed(1)}%</li>
                <li>• Economia total de R$ {serviceDetail.metrics.economicImpact.toLocaleString('pt-BR')}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Oportunidades de Melhoria</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                {abandonmentRate > 20 && (
                  <li>• Reduzir taxa de abandono ({abandonmentRate.toFixed(1)}%)</li>
                )}
                {serviceDetail.metrics.averageSatisfaction < 4 && (
                  <li>• Melhorar satisfação do cidadão</li>
                )}
                {serviceDetail.metrics.frustratedCount > serviceDetail.metrics.positiveCount && (
                  <li>• Reduzir frustração dos usuários</li>
                )}
                <li>• Otimizar processo de atendimento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}