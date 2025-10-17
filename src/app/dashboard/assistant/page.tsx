"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  insights?: string[];
}

const SUGGESTED_QUESTIONS = [
  "Qual o maior problema nos atendimentos hoje?",
  "Como posso melhorar a taxa de abandono?",
  "Quais serviços precisam de mais atenção?",
  "O que está causando frustração nos usuários?",
  "Onde devo investir para melhorar a satisfação?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize with welcome message only on client
    if (!isInitialized) {
      setMessages([
        {
          id: "1",
          type: "assistant",
          content:
            "Olá! Sou seu assistente para análise de dados. Posso ajudar você a entender suas métricas e sugerir melhorias. O que gostaria de saber?",
          timestamp: new Date(),
          insights: [
            "💡 Faça perguntas sobre seus dados atuais",
            "📊 Peça explicações sobre métricas específicas",
            "🎯 Solicite sugestões para melhorar processos",
          ],
        },
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend || isLoading) return;

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Chamar API do assistente
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result.response,
          timestamp: new Date(),
          insights: result.insights,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || "Erro ao processar pergunta");
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Bot className="h-12 w-12 text-[#0E7FC0] animate-pulse" />
            <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0E7FC0] via-[#009DDA] to-[#32B1E4] bg-clip-text text-transparent mb-3">
          Assistente IA para Tomada de Decisão
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Analise seus dados em tempo real e receba insights inteligentes para
          otimizar o atendimento
        </p>
      </div>

      {/* Sugestões de Perguntas */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Perguntas Sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
                className="text-left justify-start h-auto p-3 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
              >
                <span className="text-sm leading-relaxed">{question}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Container */}
      <Card className="h-[700px] flex flex-col shadow-xl border-0 bg-gradient-to-b from-white to-gray-50">
        <CardHeader className="pb-3 bg-gradient-to-r from-[#0E7FC0] to-[#32B1E4] text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            Conversa com IA
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto space-y-6 p-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              } animate-in slide-in-from-bottom-2 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.type === "user"
                    ? "bg-gradient-to-br from-[#0E7FC0] to-[#32B1E4] text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === "assistant" ? (
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                      <Bot className="h-4 w-4 text-[#0E7FC0]" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {message.type === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-1">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}

                    {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-medium text-blue-700 mb-2">
                          💡 Insights Rápidos:
                        </div>
                        <div className="grid gap-2">
                          {message.insights.map((insight, index) => (
                            <div
                              key={index}
                              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200 animate-in fade-in-50 duration-300"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString("pt-BR")}
                      </span>
                      {message.type === "assistant" && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          IA Ativa
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-[85%] shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                    <Bot className="h-4 w-4 text-[#0E7FC0]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      Analisando dados...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre os dados..."
                disabled={isLoading}
                className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-[#0E7FC0] transition-colors bg-white shadow-sm"
              />
              {inputValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 px-6 bg-gradient-to-r from-[#0E7FC0] to-[#32B1E4] hover:from-[#0a6ba3] hover:to-[#2a9bc7] transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Pressione Enter para enviar
          </p>
        </div>
      </Card>
    </div>
  );
}
