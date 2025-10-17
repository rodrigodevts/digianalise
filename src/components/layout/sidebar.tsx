"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Edit3,
  Home,
  MessageSquare,
  PieChart,
  Target,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Visão Geral",
    href: "/dashboard/overview",
    icon: BarChart3,
  },
  {
    name: "Por Serviços",
    href: "/dashboard/services",
    icon: PieChart,
  },
  {
    name: "Alertas",
    href: "/dashboard/alerts",
    icon: AlertTriangle,
  },
  {
    name: "Funil de Conversão",
    href: "/dashboard/funnel",
    icon: Target,
  },
  {
    name: "Conversas",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    name: "Assistente IA",
    href: "/dashboard/assistant",
    icon: Bot,
  },
  {
    name: "Curadoria Chatbot",
    href: "/dashboard/curadoria",
    icon: Edit3,
  },
  {
    name: "Importar Dados",
    href: "/dashboard/import",
    icon: Upload,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo / Header */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center space-y-5 w-full">
          {/* Application Title - Centralizado */}
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#0E7FC0] via-[#009DDA] to-[#32B1E4] bg-clip-text text-transparent">
              Analytics IA
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Atendimento Inteligente
            </p>
          </div>

          {/* Prefecture Info - Card Melhorado */}
          <div className="bg-white rounded-xl p-4 w-full border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="text-center flex-1">
                <p className="text-sm font-semibold text-gray-800">Prefeitura Municipal</p>
                <p className="text-xs text-gray-600">Secretaria de Finanças</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-700">Analytics IA</p>
            <p>Versão 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
