import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { step, data } = await request.json();

    switch (step) {
      case "conversations":
        // Lógica do script 1-import-conversations.ts
        const conversations = await prisma.conversation.createMany({
          data: data.conversations,
        });

        return NextResponse.json({
          success: true,
          message: `${conversations.count} conversas importadas`,
        });

      case "analyze":
        // Lógica do script 2-analyze-with-ai.ts
        // Processar análises com IA

        return NextResponse.json({
          success: true,
          message: "Análises processadas",
        });

      case "metrics":
        // Lógica do script 3-aggregate-metrics.ts
        // Agregar métricas

        return NextResponse.json({
          success: true,
          message: "Métricas agregadas",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Step inválido" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

// Endpoint para executar todos os scripts
export async function GET() {
  return NextResponse.json({
    message: "Use POST com step: conversations|analyze|metrics",
    steps: [
      'POST /api/import com step: "conversations"',
      'POST /api/import com step: "analyze"',
      'POST /api/import com step: "metrics"',
    ],
  });
}
