'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Database
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'

interface MetricsData {
  totals: {
    conversations: number
    resolved: number
    abandoned: number
    economicImpact: number
  }
  averages: {
    resolutionRate: number
    satisfaction: number
  }
  serviceDistribution: Array<{
    service: string
    total: number
    percentage: number
  }>
  totalGrowth: number
  metrics: Array<any>
}

interface AlertsData {
  alerts: Array<{
    id: string
    severity: string
    type: string
    title: string
    description: string
    detectedAt: string
  }>
  stats: {
    total: number
    critical: number
    urgent: number
    monitor: number
  }
}

export default function OverviewPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, alertsRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/alerts')
        ])

        const metrics = await metricsRes.json()
        const alerts = await alertsRes.json()

        if (metrics.success) setMetricsData(metrics.data)
        if (alerts.success) setAlertsData(alerts.data)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!metricsData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados. Verifique se os scripts de processamento foram executados.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'urgent': return 'default'
      case 'monitor': return 'secondary'
      default: return 'default'
    }
  }

  // Cores modernas e elegantes para gráficos
  const COLORS = [
    '#6366f1', // indigo-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16'  // lime-500
  ]

  // Preparar dados para gráficos
  const serviceChartData = metricsData?.serviceDistribution.map((service, index) => ({
    name: service.service,
    value: service.total,
    percentage: service.percentage,
    fill: COLORS[index % COLORS.length]
  })) || []

  const satisfactionData = metricsData?.metrics.map(metric => ({
    service: metric.service,
    satisfacao: metric.averageSatisfaction,
    conversas: metric.totalConversations
  })) || []

  const economicData = metricsData?.metrics.map(metric => ({
    service: metric.service,
    economia: metric.economicImpact,
    crescimento: metric.growthRate
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
            <p className="text-gray-600 mt-2">
              Análise inteligente de conversas com cidadãos da SEFIN
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Atualizado agora</span>
          </div>
        </div>
        
        {/* Alertas Críticos */}
        {alertsData && alertsData.stats.critical > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{alertsData.stats.critical} alertas críticos</strong> requerem atenção imediata!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* KPIs Principais */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Indicadores de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-600 text-white">+{metricsData.totalGrowth.toFixed(1)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Total de Conversas</p>
                <div className="text-3xl font-bold text-blue-900">{metricsData.totals.conversations.toLocaleString()}</div>
                <p className="text-xs text-blue-600">
                  {metricsData.totalGrowth >= 0 ? 'Crescimento' : 'Redução'} vs. período anterior
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-emerald-600 text-white">Excelente</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700">Taxa de Resolução</p>
                <div className="text-3xl font-bold text-emerald-900">{metricsData.averages.resolutionRate.toFixed(1)}%</div>
                <Progress value={metricsData.averages.resolutionRate} className="h-2 bg-emerald-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-amber-600 text-white">{((metricsData.averages.satisfaction / 5) * 100).toFixed(0)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700">Satisfação Média</p>
                <div className="text-3xl font-bold text-amber-900">{metricsData.averages.satisfaction.toFixed(1)}/5</div>
                <Progress value={(metricsData.averages.satisfaction / 5) * 100} className="h-2 bg-amber-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-600 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-600 text-white">Economia</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Economia Estimada</p>
                <div className="text-3xl font-bold text-green-900">
                  R$ {metricsData.totals.economicImpact.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}
                </div>
                <p className="text-xs text-green-600">
                  Economia operacional com automação
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs com diferentes visões */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Análises Detalhadas</h2>
          <div className="text-sm text-gray-500">Explore diferentes perspectivas dos dados</div>
        </div>
        
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="economics">Economia</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas 
              {alertsData && alertsData.stats.total > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{alertsData.stats.total}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Distribuição por Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                      <Pie
                        data={serviceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage.toFixed(1)}%`}
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {serviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} conversas`, 'Conversas']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      Nenhum dado de serviços
                    </h3>
                    <p className="text-xs text-gray-500">
                      Os dados aparecerão quando as conversas forem processadas
                    </p>
                  </div>
                )}
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Volume por Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceChartData}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="name"
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
                        formatter={(value) => [`${value} conversas`, 'Conversas']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#volumeGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Satisfação vs Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={satisfactionData}>
                      <defs>
                        <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="service"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 5]}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="conversas" fill="#6366f1" name="Conversas" radius={[2, 2, 0, 0]} />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="satisfacao" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        name="Satisfação"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {metricsData.averages.resolutionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Taxa Média de Resolução</div>
                      <Progress value={metricsData.averages.resolutionRate} className="h-3" />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {metricsData.averages.satisfaction.toFixed(1)}/5
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Satisfação Média</div>
                      <Progress value={(metricsData.averages.satisfaction / 5) * 100} className="h-3" />
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {((metricsData.totals.conversations - metricsData.totals.abandoned) / metricsData.totals.conversations * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Taxa de Retenção</div>
                      <Progress value={(metricsData.totals.conversations - metricsData.totals.abandoned) / metricsData.totals.conversations * 100} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="economics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Economia por Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={economicData}>
                      <defs>
                        <linearGradient id="economiaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="service" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
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
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Economia']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="economia" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="url(#economiaGradient)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-700">Taxa de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={economicData}>
                      <defs>
                        <linearGradient id="positiveGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="negativeGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="service" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
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
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Crescimento']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Bar 
                        dataKey="crescimento" 
                        radius={[4, 4, 0, 0]}
                      >
                        {economicData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.crescimento >= 0 ? "url(#positiveGrowth)" : "url(#negativeGrowth)"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alertsData && alertsData.alerts.length > 0 ? (
              <div className="space-y-4">
                {alertsData.alerts.slice(0, 10).map((alert) => (
                  <Alert key={alert.id} className={`border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500' :
                    alert.severity === 'urgent' ? 'border-l-orange-500' :
                    'border-l-yellow-500'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <div className="ml-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.detectedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum alerta ativo no momento</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}