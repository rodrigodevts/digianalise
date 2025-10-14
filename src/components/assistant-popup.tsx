"use client";

import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AssistantPopupProps {
  className?: string;
}

export function AssistantPopup({ className }: AssistantPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup with animation after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  if (isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-[420px] max-w-sm animate-in slide-in-from-bottom-6 duration-500 transform backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-[#0E7FC0] to-[#32B1E4] rounded-2xl shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">
                  Assistente IA
                </h3>
                <p className="text-xs text-gray-500">Sempre online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800 font-medium">
                Análise em tempo real dos seus dados
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">
                Insights personalizados e acionáveis
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-purple-800 font-medium">
                Recomendações para melhoria
              </span>
            </div>
          </div>

          {/* Main CTA */}
          <div className="mb-5">
            <Link href="/dashboard/assistant" className="block">
              <Button className="w-full text-white bg-gradient-to-r from-[#0E7FC0] via-[#1a8dd4] to-[#32B1E4] hover:from-[#0a6ba3] hover:via-[#1670a8] hover:to-[#2a9bc7] transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl h-14 rounded-2xl text-base font-semibold">
                <MessageSquare className="h-5 w-5 mr-3" />
                Abrir Chat com IA
                <Sparkles className="h-4 w-4 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      } ${className}`}
      style={{ zIndex: 9999 }}
    >
      {/* Floating button group */}
      <div className="relative group">
        <button
          onClick={handleClick}
          className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0E7FC0] via-[#1a8dd4] to-[#32B1E4] hover:from-[#0a6ba3] hover:via-[#1670a8] hover:to-[#2a9bc7] shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl border-4 border-white cursor-pointer flex items-center justify-center"
          style={{ zIndex: 10000 }}
        >
          <Bot className="h-8 w-8 text-white drop-shadow-lg" />
        </button>

        {/* Subtle pulse ring */}
        <div className="absolute inset-0 rounded-full bg-[#0E7FC0] animate-pulse opacity-25 scale-110 pointer-events-none"></div>

        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold shadow-lg pointer-events-none">
          IA
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-24 right-0 bg-gray-900 text-white text-sm py-3 px-4 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl border border-gray-700 transform group-hover:translate-y-0 translate-y-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <div>
              <div className="font-semibold">Assistente IA</div>
              <div className="text-xs opacity-80">Clique para abrir</div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
