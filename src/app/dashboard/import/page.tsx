"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  FileJson,
  FileText,
  Loader2,
  MessageSquare,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ImportStatus {
  summary: {
    conversations: number;
    messages: number;
    analyses: number;
    metrics: number;
    activeAlerts: number;
  };
  progress: {
    conversations: {
      total: number;
      status: string;
      message: string;
    };
    analysis: {
      total: number;
      pending: number;
      progress: number;
      status: string;
      message: string;
    };
    metrics: {
      total: number;
      status: string;
      message: string;
    };
  };
  services: Array<{
    service: string;
    count: number;
  }>;
  lastUpdates: {
    conversation: string | null;
    analysis: string | null;
    metrics: string | null;
  };
  status: string;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "import" | "analyze" | "metrics" | "complete"
  >("upload");
  const [processing, setProcessing] = useState(false);
  const [forceNewImport, setForceNewImport] = useState(false);

  // Buscar status inicial
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/import/status");
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);

        // Determinar etapa atual baseado no status - permitir novos imports
        // Se forceNewImport está ativo, sempre começar do upload
        if (forceNewImport) {
          setCurrentStep("upload");
        } else if (data.data.status === "ready") {
          setCurrentStep("complete");
        } else if (data.data.progress.metrics.total > 0) {
          setCurrentStep("complete");
        } else if (data.data.progress.analysis.total > 0) {
          setCurrentStep("metrics");
        } else if (data.data.progress.conversations.total > 0) {
          setCurrentStep("analyze");
        } else {
          setCurrentStep("upload");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    }
  }, [forceNewImport]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Upload e processamento do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo JSON válido");
    }
  };

  const handleImportConversations = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo primeiro");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Ler arquivo
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Importar conversas
      const response = await fetch("/api/import/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: jsonData }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setCurrentStep("analyze");
        setForceNewImport(false); // Reset após import bem-sucedido
        fetchStatus();
      } else {
        setError(result.error || "Erro ao importar conversas");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar arquivo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/import/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 }), // Processar 10 por vez
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);

        // Se ainda há conversas pendentes, continuar processando
        if (result.stats?.remaining > 0) {
          setTimeout(handleAnalyze, 2000); // Chamar novamente após 2 segundos
        } else {
          setCurrentStep("metrics");
          setProcessing(false);
        }

        fetchStatus();
      } else {
        setError(result.error || "Erro ao analisar conversas");
        setProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar");
      setProcessing(false);
    }
  };

  const handleAggregateMetrics = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/import/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setCurrentStep("complete");
        fetchStatus();
      } else {
        setError(result.error || "Erro ao agregar métricas");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao agregar métricas");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Tem certeza que deseja remover todos os dados importados?"))
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/import/status", {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setSuccess("Dados removidos com sucesso");
        setCurrentStep("upload");
        setFile(null);
        fetchStatus();
      } else {
        setError(result.error || "Erro ao resetar dados");
      }
    } catch (err) {
      setError("Erro ao resetar dados");
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "upload":
        return <Upload className="h-5 w-5" />;
      case "import":
        return <FileJson className="h-5 w-5" />;
      case "analyze":
        return <Brain className="h-5 w-5" />;
      case "metrics":
        return <BarChart3 className="h-5 w-5" />;
      case "complete":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ["upload", "import", "analyze", "metrics", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0E7FC0] via-[#009DDA] to-[#32B1E4] bg-clip-text text-transparent">
          Importação de Dados
        </h1>
        <p className="text-gray-600 mt-2">
          Importe e processe conversas do WhatsApp para análise com IA
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {["upload", "import", "analyze", "metrics", "complete"].map(
              (step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${
                    getStepStatus(step) === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : getStepStatus(step) === "current"
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                  >
                    {getStepIcon(step)}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-24 h-1 mx-2 
                    ${
                      getStepStatus(step) === "completed"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs">Upload</span>
            <span className="text-xs">Importar</span>
            <span className="text-xs">Analisar</span>
            <span className="text-xs">Métricas</span>
            <span className="text-xs">Completo</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Upload de Arquivo
              </CardTitle>
              <CardDescription>
                Selecione o arquivo messages.json com as conversas do WhatsApp.
                {forceNewImport ? (
                  <span className="block mt-1 text-green-600 font-medium">
                    Execute o fluxo completo: Upload → Import → Análise →
                    Métricas
                  </span>
                ) : (status?.summary?.conversations ?? 0) > 0 ? (
                  <span className="block mt-1 text-blue-600 font-medium">
                    💡 Dados existentes serão preservados. Apenas conversas
                    novas serão importadas.
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={loading || processing}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : "Clique para selecionar arquivo JSON"}
                    </span>
                    {file && (
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    )}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {currentStep === "upload" && (
                    <Button
                      onClick={handleImportConversations}
                      disabled={!file || loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Importar Conversas
                        </>
                      )}
                    </Button>
                  )}

                  {currentStep === "analyze" && (
                    <Button
                      onClick={handleAnalyze}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Iniciar Análise com IA
                        </>
                      )}
                    </Button>
                  )}

                  {currentStep === "metrics" && (
                    <Button
                      onClick={handleAggregateMetrics}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Agregar Métricas
                        </>
                      )}
                    </Button>
                  )}

                  {currentStep === "complete" && (
                    <>
                      <Button
                        onClick={() => {
                          setForceNewImport(true);
                          setCurrentStep("upload");
                          setFile(null);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Novo Import
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (window.location.href = "/dashboard/overview")
                        }
                        className="flex-1"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Ver Dashboard
                      </Button>
                    </>
                  )}

                  {status &&
                    (status.progress?.conversations?.total ?? 0) > 0 &&
                    currentStep !== "upload" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setForceNewImport(true);
                          setCurrentStep("upload");
                          setFile(null);
                          setError(null);
                          setSuccess(null);
                        }}
                        disabled={loading || processing}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Começar do Zero
                      </Button>
                    )}

                  {process.env.NODE_ENV !== "production" &&
                    (status?.progress?.conversations?.total ?? 0) > 0 && (
                      <Button
                        variant="destructive"
                        onClick={handleReset}
                        disabled={loading || processing}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Resetar Dados
                      </Button>
                    )}
                </div>

                {/* Progress Details */}
                {(processing ||
                  status?.progress.analysis.status === "in_progress") && (
                  <Card className="bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Análise com IA</span>
                          <span className="font-medium">
                            {status?.progress.analysis.progress || 0}%
                          </span>
                        </div>
                        <Progress
                          value={status?.progress.analysis.progress || 0}
                        />
                        <p className="text-xs text-gray-600">
                          {status?.progress.analysis.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Statistics */}
          {status?.services && status.services.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição por Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {status.services?.map((service) => (
                    <div
                      key={service.service}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">{service.service}</span>
                      <Badge>{service.count} conversas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversas</span>
                  <Badge variant="outline">
                    {status?.summary.conversations || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mensagens</span>
                  <Badge variant="outline">
                    {status?.summary.messages || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Análises</span>
                  <Badge variant="outline">
                    {status?.summary.analyses || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Métricas</span>
                  <Badge variant="outline">
                    {status?.summary.metrics || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Alertas Ativos</span>
                  <Badge variant="destructive">
                    {status?.summary.activeAlerts || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updates */}
          {status?.lastUpdates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Últimas Atualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {status.lastUpdates?.conversation && (
                    <div>
                      <span className="text-gray-600">Importação: </span>
                      <span className="font-medium">
                        {new Date(
                          status.lastUpdates?.conversation
                        ).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                  {status.lastUpdates?.analysis && (
                    <div>
                      <span className="text-gray-600">Análise: </span>
                      <span className="font-medium">
                        {new Date(status.lastUpdates?.analysis).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  )}
                  {status.lastUpdates?.metrics && (
                    <div>
                      <span className="text-gray-600">Métricas: </span>
                      <span className="font-medium">
                        {new Date(status.lastUpdates?.metrics).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Instruções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-gray-600">
                <li>1. Faça upload do arquivo messages.json</li>
                <li>2. Clique em "Importar Conversas"</li>
                <li>3. Aguarde a importação completar</li>
                <li>4. Inicie a análise com IA</li>
                <li>5. Agregue as métricas</li>
                <li>6. Visualize no dashboard</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
