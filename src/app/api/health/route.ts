import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Força rota dinâmica para produção
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verificar conexão com banco
    const start = Date.now();
    await prisma.$connect();

    // Teste simples de conexão (MongoDB não precisa de $queryRaw)
    const dbTime = Date.now() - start;

    // Verificar se coleções existem (usando contagem simples)
    let collectionCount = 0;
    try {
      // Tentar contar registros das coleções principais
      await prisma.conversation.count();
      await prisma.serviceMetrics.count();
      collectionCount = 2; // Se chegou até aqui, pelo menos 2 coleções existem
    } catch (collectionError) {
      console.log("Coleções ainda não existem:", collectionError);
      collectionCount = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        database: {
          connected: true,
          responseTime: `${dbTime}ms`,
          collections: collectionCount,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          databaseUrl: "MongoDB",
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health check falhou:", error);

    return NextResponse.json(
      {
        success: false,
        data: {
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Erro desconhecido",
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            databaseUrl: process.env.DATABASE_URL?.includes("mongodb")
              ? "MongoDB"
              : "SQLite",
          },
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
