"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit3,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle,
  BookOpen,
  Zap
} from "lucide-react";

interface MessageIssue {
  id: string;
  message: string;
  issue: string;
  severity: "high" | "medium" | "low";
  occurrences: number;
  abandonmentRate: number;
  suggestion?: string;
}

interface FlowIssue {
  id: string;
  service: string;
  step: string;
  dropoffRate: number;
  avgTimeStuck: number;
  recommendation: string;
}

export default function CuradoriaPage() {
  const [messageIssues, setMessageIssues] = useState<MessageIssue[]>([
    {
      id: "1",
      message: "Para consultar seu protocolo de débito, informe o CPF",
      issue: "Termo técnico confuso",
      severity: "high",
      occurrences: 234,
      abandonmentRate: 78,
      suggestion: "Para consultar seus débitos, por favor informe seu CPF"
    },
    {
      id: "2",
      message: "Validação do contribuinte em processamento",
      issue: "Mensagem vaga",
      severity: "medium",
      occurrences: 156,
      abandonmentRate: 45,
      suggestion: "Estamos verificando seus dados. Isso leva apenas alguns segundos..."
    },
    {
      id: "3",
      message: "Erro: CNM inválido",
      issue: "Sigla não explicada",
      severity: "high",
      occurrences: 189,
      abandonmentRate: 82,
      suggestion: "O código do município informado não foi encontrado. Verifique e tente novamente."
    }
  ]);

  const [flowIssues, setFlowIssues] = useState<FlowIssue[]>([
    {
      id: "1",
      service: "IPTU",
      step: "Validação CPF",
      dropoffRate: 65,
      avgTimeStuck: 45,
      recommendation: "Simplificar validação e adicionar máscara automática"
    },
    {
      id: "2",
      service: "Certidão Negativa",
      step: "Upload de documentos",
      dropoffRate: 71,
      avgTimeStuck: 120,
      recommendation: "Remover necessidade de upload para casos simples"
    }
  ]);

  const [curatorStats] = useState({
    totalMessages: 1247,
    problematicMessages: 89,
    avgResolutionRate: 8.33,
    potentialImprovement: 45.7,
    lastCuration: "2 dias atrás"
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
          <Edit3 className="h-8 w-8 text-purple-600" />
          Curadoria do Chatbot
        </h1>
        <p className="text-gray-600 mt-2">
          Analise, otimize e aprimore as respostas e fluxos do seu chatbot
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Mensagens Analisadas</p>
                <p className="text-2xl font-bold">{curatorStats.totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Problemas Detectados</p>
                <p className="text-2xl font-bold text-orange-600">{curatorStats.problematicMessages}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa de Resolução</p>
                <p className="text-2xl font-bold text-red-600">{curatorStats.avgResolutionRate}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Melhoria Potencial</p>
                <p className="text-2xl font-bold text-green-600">+{curatorStats.potentialImprovement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Mensagens Problemáticas</TabsTrigger>
          <TabsTrigger value="flows">Fluxos com Atrito</TabsTrigger>
          <TabsTrigger value="templates">Biblioteca de Templates</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
        </TabsList>

        {/* Mensagens Problemáticas */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Mensagens que Precisam de Curadoria
                </span>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reanalisar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={issue.severity === "high" ? "destructive" : issue.severity === "medium" ? "secondary" : "outline"}>
                            {issue.severity === "high" ? "Alta Prioridade" : issue.severity === "medium" ? "Média" : "Baixa"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {issue.occurrences} ocorrências • {issue.abandonmentRate}% abandono
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-sm font-medium text-red-800 mb-1">Mensagem Atual:</p>
                            <p className="text-sm text-gray-700">"{issue.message}"</p>
                            <p className="text-xs text-red-600 mt-1">⚠️ {issue.issue}</p>
                          </div>
                          
                          {issue.suggestion && (
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800 mb-1">Sugestão de Melhoria:</p>
                              <p className="text-sm text-gray-700">"{issue.suggestion}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        <Button size="sm" className="w-full">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluxos com Atrito */}
        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Pontos de Atrito nos Fluxos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flowIssues.map((flow) => (
                  <div key={flow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-semibold text-lg">{flow.service}</span>
                        <Badge className="ml-2" variant="secondary">{flow.step}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Taxa de Abandono</p>
                        <p className="text-2xl font-bold text-red-600">{flow.dropoffRate}%</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">💡 Recomendação:</p>
                      <p className="text-sm text-gray-700">{flow.recommendation}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Visualizar Fluxo
                      </Button>
                      <Button size="sm">
                        Implementar Melhoria
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biblioteca de Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Biblioteca de Respostas Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Saudação", "Solicitação CPF", "Erro de Validação", "Confirmação", "Encerramento"].map((template) => (
                  <div key={template} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{template}</h4>
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <p className="text-xs text-gray-500 mb-1">Versão Atual:</p>
                        <p>Exemplo de mensagem do template...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">Editar</Button>
                        <Button size="sm" variant="outline" className="flex-1">Histórico</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulador */}
        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Conversas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Teste Novos Fluxos</h3>
                <p className="text-gray-600 mb-4">
                  Simule conversas com as melhorias sugeridas antes de implementá-las
                </p>
                <Button>
                  Iniciar Simulação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}