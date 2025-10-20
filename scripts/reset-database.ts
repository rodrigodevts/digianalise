#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🗑️  Iniciando limpeza do banco de dados...\n");

  try {
    // Ordem importante: deletar relacionamentos primeiro
    console.log("1️⃣  Deletando alertas...");
    const alertsDeleted = await prisma.alert.deleteMany({});
    console.log(`   ✅ ${alertsDeleted.count} alertas deletados`);

    console.log("2️⃣  Deletando métricas de serviço...");
    const metricsDeleted = await prisma.serviceMetrics.deleteMany({});
    console.log(`   ✅ ${metricsDeleted.count} métricas deletadas`);

    console.log("3️⃣  Deletando análises de conversas...");
    const analysesDeleted = await prisma.conversationAnalysis.deleteMany({});
    console.log(`   ✅ ${analysesDeleted.count} análises deletadas`);

    console.log("4️⃣  Deletando mensagens...");
    const messagesDeleted = await prisma.message.deleteMany({});
    console.log(`   ✅ ${messagesDeleted.count} mensagens deletadas`);

    console.log("5️⃣  Deletando conversas...");
    const conversationsDeleted = await prisma.conversation.deleteMany({});
    console.log(`   ✅ ${conversationsDeleted.count} conversas deletadas`);

    console.log("6️⃣  Deletando logs de importação...");
    const logsDeleted = await prisma.importLog.deleteMany({});
    console.log(`   ✅ ${logsDeleted.count} logs deletados`);

    console.log("\n" + "=".repeat(50));
    console.log("✨ Banco de dados limpo com sucesso!");
    console.log("=".repeat(50));
    console.log("\n💡 Próximo passo: rode o script de importação:");
    console.log("   npx tsx scripts/1-import-conversations.ts");
  } catch (error) {
    console.error("\n❌ Erro ao limpar banco:", error);
    throw error;
  }
}

resetDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
