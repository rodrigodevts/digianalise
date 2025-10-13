'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Conversation {
  id: string
  ticketId: string
  phoneNumber: string
  startedAt: string
  endedAt: string
  duration: number
  messageCount: number
  status: string
  analysis?: {
    primaryService: string
    sentiment: string
    userProfile: string
    frustrationLevel: number
    wasResolved: boolean
    keyPhrases: string
  }
  _count: {
    messages: number
  }
}

interface ConversationsData {
  conversations: Conversation[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const serviceNames: Record<string, string> = {
  'IPTU': 'IPTU',
  'CERTIDAO_NEGATIVA': 'Certidão Negativa',
  'DIVIDA_ATIVA': 'Dívida Ativa', 
  'ALVARA': 'Alvará',
  'OUTROS': 'Outros',
  'NAO_IDENTIFICADO': 'Não Identificado'
}

const sentimentColors = {
  'positivo': 'bg-green-100 text-green-800',
  'neutro': 'bg-blue-100 text-blue-800',
  'negativo': 'bg-orange-100 text-orange-800',
  'frustrado': 'bg-red-100 text-red-800'
}

const profileColors = {
  'tranquilo': 'bg-green-100 text-green-800',
  'confuso': 'bg-yellow-100 text-yellow-800',
  'urgente': 'bg-orange-100 text-orange-800',
  'revoltado': 'bg-red-100 text-red-800'
}

export default function ConversationsPage() {
  const [data, setData] = useState<ConversationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    service: '',
    sentiment: '',
    resolved: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  const fetchConversations = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.service && { service: filters.service }),
        ...(filters.sentiment && { sentiment: filters.sentiment }),
        ...(filters.resolved && { resolved: filters.resolved })
      })

      const response = await fetch(`/api/conversations?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations(1)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatKeyPhrases = (keyPhrasesJson: string) => {
    try {
      const phrases = JSON.parse(keyPhrasesJson)
      return Array.isArray(phrases) ? phrases.slice(0, 3) : []
    } catch {
      return []
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversas</h1>
        <p className="text-gray-600 mt-2">
          Histórico detalhado de conversas com cidadãos
        </p>
      </div>

      {/* Filtros */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Serviço</label>
              <Select value={filters.service || "all"} onValueChange={(value) => handleFilterChange('service', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {Object.entries(serviceNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sentimento</label>
              <Select value={filters.sentiment || "all"} onValueChange={(value) => handleFilterChange('sentiment', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os sentimentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os sentimentos</SelectItem>
                  <SelectItem value="positivo">Positivo</SelectItem>
                  <SelectItem value="neutro">Neutro</SelectItem>
                  <SelectItem value="negativo">Negativo</SelectItem>
                  <SelectItem value="frustrado">Frustrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filters.resolved || "all"} onValueChange={(value) => handleFilterChange('resolved', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="true">Resolvidas</SelectItem>
                  <SelectItem value="false">Não Resolvidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ service: '', sentiment: '', resolved: '' })
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conversas */}
      {data && data.conversations.length > 0 ? (
        <div className="space-y-4">
          {data.conversations.map((conversation) => (
            <Card key={conversation.id} className="bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl transition-shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">
                        Conversa #{conversation.ticketId}
                      </h3>
                      {conversation.analysis && (
                        <>
                          <Badge variant="outline">
                            {serviceNames[conversation.analysis.primaryService] || conversation.analysis.primaryService}
                          </Badge>
                          <Badge className={sentimentColors[conversation.analysis.sentiment as keyof typeof sentimentColors]}>
                            {conversation.analysis.sentiment}
                          </Badge>
                          <Badge className={profileColors[conversation.analysis.userProfile as keyof typeof profileColors]}>
                            {conversation.analysis.userProfile}
                          </Badge>
                        </>
                      )}
                      <div className="flex items-center space-x-1">
                        {conversation.analysis?.wasResolved ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          {conversation.analysis?.wasResolved ? 'Resolvida' : 'Não Resolvida'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{conversation.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{conversation._count.messages} mensagens</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(conversation.duration)}</span>
                      </div>
                      <div>
                        <span>{new Date(conversation.startedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {conversation.analysis && (
                      <div className="space-y-2">
                        {conversation.analysis.frustrationLevel > 5 && (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                              Alto nível de frustração: {conversation.analysis.frustrationLevel}/10
                            </AlertDescription>
                          </Alert>
                        )}

                        {conversation.analysis.keyPhrases && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Frases-chave: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formatKeyPhrases(conversation.analysis.keyPhrases).map((phrase, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  "{phrase}"
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Paginação */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} a{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de{' '}
              {data.pagination.total} conversas
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConversations(currentPage - 1)}
                disabled={!data.pagination.hasPrev || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {data.pagination.page} de {data.pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConversations(currentPage + 1)}
                disabled={!data.pagination.hasNext || loading}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma conversa encontrada
              </h3>
              <p className="text-gray-600">
                {Object.values(filters).some(f => f) 
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Execute os scripts de processamento para carregar conversas'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}