#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🎯 Configure aqui quais tickets você quer deletar
const TICKETS_TO_DELETE = [
  "ticket_1001",
  "ticket_1002",
  "ticket_9999",
  // Adicione mais ticketIds aqui se necessário
];

async function deleteSpecificTickets() {
  console.log("🗑️  Deletando tickets específicos...\n");
  console.log(`📋 Tickets a serem deletados: ${TICKETS_TO_DELETE.join(", ")}\n`);

  let deletedCount = 0;

  for (const ticketId of TICKETS_TO_DELETE) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { ticketId },
        include: {
          messages: true,
          analysis: true,
        },
      });

      if (!conversation) {
        console.log(`   ⏭️  Ticket ${ticketId} não encontrado, pulando...`);
        continue;
      }

      // Deletar análise se existir
      if (conversation.analysis) {
        await prisma.conversationAnalysis.delete({
          where: { id: conversation.analysis.id },
        });
      }

      // Deletar mensagens
      await prisma.message.deleteMany({
        where: { conversationId: conversation.id },
      });

      // Deletar a conversa
      await prisma.conversation.delete({
        where: { id: conversation.id },
      });

      deletedCount++;
      console.log(`   ✅ Ticket ${ticketId} deletado (${conversation.messageCount} mensagens)`);
    } catch (error) {
      console.error(`   ❌ Erro ao deletar ticket ${ticketId}:`, error);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✨ ${deletedCount} tickets deletados com sucesso!`);
  console.log("=".repeat(50));

  // Mostrar o que sobrou
  const remaining = await prisma.conversation.count();
  console.log(`\n📊 Conversas restantes no banco: ${remaining}`);
}

deleteSpecificTickets()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
