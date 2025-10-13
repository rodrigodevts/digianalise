"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  Play,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E7FC0] via-[#1978B1] to-[#009DDA] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    SEFIN Analytics v2.0
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                    Inteligência Artificial para
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#32B1E4] to-[#009DDA]">
                      Atendimento Cidadão
                    </span>
                  </h1>

                  <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
                    Transforme conversas em insights. Monitore satisfação em
                    tempo real. Otimize processos com dados inteligentes da
                    Prefeitura de Vitória da Conquista.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span className="text-blue-100 font-medium">
                      IA Avançada
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-300" />
                    <span className="text-blue-100 font-medium">
                      LGPD Compliant
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-green-300" />
                    <span className="text-blue-100 font-medium">
                      Tempo Real
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/dashboard/overview">
                    <Button
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8 py-4 text-lg"
                    >
                      Acessar Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Ver Demo (3 min)
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-8 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-full blur-2xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          95%
                        </div>
                        <div className="text-sm text-blue-100">Satisfação</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          24/7
                        </div>
                        <div className="text-sm text-blue-100">
                          Monitoramento
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          AI
                        </div>
                        <div className="text-sm text-blue-100">Análise</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          ∞
                        </div>
                        <div className="text-sm text-blue-100">
                          Escalabilidade
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Tutorial Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/overview">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    Visão Geral
                  </h3>
                  <p className="text-blue-700 text-sm">
                    KPIs, métricas e análises detalhadas em tempo real
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/services">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">
                    Serviços
                  </h3>
                  <p className="text-emerald-700 text-sm">
                    Performance detalhada por serviço da SEFIN
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/alerts">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-red-50 to-orange-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-red-600 rounded-xl group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-red-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    Alertas
                  </h3>
                  <p className="text-red-700 text-sm">
                    Sistema inteligente de alertas críticos
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Start Tutorial */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-900">Começar Agora</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Explore Dashboard
                </p>
                <p className="text-xs text-green-700">
                  Veja indicadores em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Analise Serviços
                </p>
                <p className="text-xs text-green-700">
                  Performance por departamento
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Configure Alertas
                </p>
                <p className="text-xs text-green-700">
                  Receba notificações importantes
                </p>
              </div>
            </div>

            <Link href="/dashboard/overview">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-4">
                <Clock className="h-4 w-4 mr-2" />
                Iniciar Tour
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recursos da Plataforma */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Recursos Avançados da Plataforma
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Descubra como nossa IA revoluciona o atendimento ao cidadão com
              análises inteligentes e insights em tempo real para a gestão
              pública moderna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Análise com IA
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Processamento de linguagem natural para classificar
                automaticamente conversas, detectar sentimentos e identificar
                problemas recorrentes com precisão de 95%.
              </p>
            </Card>

            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Dashboards Interativos
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Visualizações modernas e interativas que transformam dados
                complexos em insights acionáveis para gestores públicos tomarem
                decisões baseadas em dados.
              </p>
            </Card>

            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Alertas Inteligentes
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Sistema proativo de alertas que identifica problemas críticos,
                alta taxa de abandono e oportunidades de melhoria antes que se
                tornem críticos.
              </p>
            </Card>

            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Funil de Conversão
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Análise detalhada do fluxo de atendimento para identificar
                gargalos e pontos de abandono dos cidadãos em cada etapa do
                processo.
              </p>
            </Card>

            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Conformidade LGPD
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Proteção completa de dados pessoais com anonimização automática
                e conformidade total com a Lei Geral de Proteção de Dados
                brasileira.
              </p>
            </Card>

            <Card className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Tempo Real
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Monitoramento contínuo com atualizações em tempo real,
                permitindo respostas rápidas a problemas emergentes e tomada de
                decisão ágil.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#0E7FC0] to-[#009DDA] rounded-3xl p-8 lg:p-16 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6">
            Pronto para Revolucionar seu Atendimento ao Cidadão?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
            Junte-se à revolução da gestão pública inteligente. Comece a usar
            insights de IA para melhorar a experiência dos cidadãos hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/overview">
              <Button
                size="lg"
                className="bg-white text-[#0E7FC0] hover:bg-white/90 font-bold px-10 py-4 text-lg"
              >
                <TrendingUp className="mr-3 h-6 w-6" />
                Começar Análise
              </Button>
            </Link>

            <Link href="/dashboard/services">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-bold px-10 py-4 text-lg"
              >
                <Users className="mr-3 h-6 w-6" />
                Explorar Serviços
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer with Partner Logos */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center space-x-4">
            <Image
              src="/brasao_pmvc.png"
              alt="Brasão PMVC"
              width={48}
              height={48}
              className="rounded"
            />
            <div>
              <p className="font-semibold text-gray-900">
                Prefeitura Municipal
              </p>
              <p className="text-sm text-gray-600">Vitória da Conquista - BA</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <p className="text-sm text-gray-600">Desenvolvido por</p>
            <span className="text-sm font-medium text-gray-700">Digigov</span>
          </div>
        </div>
      </div>
    </div>
  );
}
