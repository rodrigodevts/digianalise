'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingDown,
  Users,
  Zap,
  Target
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AlertItem {
  id: string
  severity: 'critical' | 'urgent' | 'monitor'
  type: string
  title: string
  description: string
  recommendation: string
  service?: string
  affectedCount: number
  impactScore: number
  detectedAt: string
  status: string
}

interface AlertsData {
  alerts: AlertItem[]
  stats: {
    total: number
    critical: number
    urgent: number
    monitor: number
    byType: Record<string, number>
  }
}

const severityConfig = {
  critical: {
    label: 'Crítico',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle
  },
  urgent: {
    label: 'Urgente', 
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Clock
  },
  monitor: {
    label: 'Monitorar',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Target
  }
}

const typeNames: Record<string, { name: string, icon: any }> = {
  'frustration': { name: 'Frustração do Cidadão', icon: Users },
  'churn_risk': { name: 'Risco de Abandono', icon: TrendingDown },
  'system_error': { name: 'Erro do Sistema', icon: AlertTriangle },
  'high_abandonment': { name: 'Alto Abandono', icon: TrendingDown },
  'opportunity': { name: 'Oportunidade', icon: Zap }
}

export default function AlertsPage() {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/alerts')
        const data = await response.json()

        if (data.success) {
          setAlertsData(data.data)
        }
      } catch (error) {
        console.error('Erro ao carregar alertas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleResolveAlert = async (alertId: string, status: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: alertId, status }),
      })

      if (response.ok) {
        // Recarregar dados
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    )
  }

  if (!alertsData) {
    return (
      <div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar alertas. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Alertas</h1>
        <p className="text-gray-600 mt-2">
          Monitoramento em tempo real de problemas e oportunidades
        </p>
      </div>

      {/* Estatísticas dos Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsData.stats.total}</div>
            <p className="text-xs text-muted-foreground">Alertas ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertsData.stats.critical}</div>
            <p className="text-xs text-muted-foreground">Ação imediata</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertsData.stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Ação em 24h</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoramento</CardTitle>
            <Target className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alertsData.stats.monitor}</div>
            <p className="text-xs text-muted-foreground">Acompanhar</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      {alertsData.alerts.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Alertas Ativos</h2>
          
          {alertsData.alerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const typeInfo = typeNames[alert.type] || { name: alert.type, icon: AlertTriangle }
            const TypeIcon = typeInfo.icon

            return (
              <Card 
                key={alert.id} 
                className={`bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow border-l-4 ${config.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <TypeIcon className={`h-5 w-5 ${config.textColor}`} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`${config.color} text-white`}
                          >
                            {config.label}
                          </Badge>
                          {alert.service && (
                            <Badge variant="outline">
                              {alert.service}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700">{alert.description}</p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Recomendação:</p>
                              <p className="text-sm text-blue-800">{alert.recommendation}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Impacto: {alert.impactScore}/10</span>
                          <span>Afetados: {alert.affectedCount}</span>
                          <span>Detectado: {new Date(alert.detectedAt).toLocaleString('pt-BR')}</span>
                          <span className="uppercase font-medium">{typeInfo.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id, 'acknowledged')}
                      >
                        Reconhecer
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id, 'resolved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum alerta ativo
              </h3>
              <p className="text-gray-600">
                Todos os sistemas estão funcionando normalmente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualizações dos Alertas */}
      {Object.keys(alertsData.stats.byType).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">Distribuição por Severidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Críticos', value: alertsData.stats.critical, fill: '#ef4444' },
                      { name: 'Urgentes', value: alertsData.stats.urgent, fill: '#f59e0b' },
                      { name: 'Monitorar', value: alertsData.stats.monitor, fill: '#84cc16' }
                    ]}
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
                    {[
                      { fill: '#ef4444' },
                      { fill: '#f59e0b' },
                      { fill: '#84cc16' }
                    ].map((entry, index) => (
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

          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">Alertas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(alertsData.stats.byType).map(([type, count]) => ({
                  name: typeNames[type]?.name || type,
                  value: count
                }))}>
                  <defs>
                    <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="name" 
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
                    formatter={(value) => [`${value} alertas`, 'Quantidade']}
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
                    fill="url(#alertGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}