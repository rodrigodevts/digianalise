#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTickets() {
  const conversations = await prisma.conversation.findMany({
    select: {
      ticketId: true,
      messageCount: true,
    },
    orderBy: {
      ticketId: 'asc',
    },
  });

  console.log(`\n📊 Total de conversas no banco: ${conversations.length}\n`);
  console.log("TicketIDs existentes:");
  conversations.forEach(conv => {
    console.log(`  - ticketId: ${conv.ticketId} (${conv.messageCount} mensagens)`);
  });
}

checkTickets()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
