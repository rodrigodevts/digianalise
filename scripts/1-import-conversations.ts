#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface RawMessage {
  id: string;
  messageId?: string;
  fromMe: boolean;
  body: string;
  mediaType: string;
  timestamp: string;
  createdAt: string;
  sendType?: string;
  userId?: number;
  contact?: {
    id: number;
    name: string;
    number: string;
    channel: string;
  };
  ticketId: number;
  contactId?: number;
  read: boolean;
  ack: number;
  status: string;
}

interface ConversationData {
  messages: RawMessage[];
}

type FileData = ConversationData[];

function anonymizePhone(phone?: string): string {
  if (!phone || phone.length < 4) return "****";
  return `****-${phone.slice(-4)}`;
}

function determineSender(message: RawMessage): string {
  if (!message.fromMe) {
    return "user";
  }

  if (message.sendType === "bot") {
    return "bot";
  }

  if (message.userId && message.userId > 0) {
    return "agent";
  }

  return "bot";
}

async function processConversation(ticketId: string, messages: RawMessage[]) {
  if (messages.length === 0) return;

  const sortedMessages = messages.sort(
    (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
  );

  const firstMessage = sortedMessages[0];
  const lastMessage = sortedMessages[sortedMessages.length - 1];

  // Buscar o número de telefone na primeira mensagem que tenha contact
  const messageWithContact = sortedMessages.find((m) => m.contact?.number);
  const phoneNumber = messageWithContact
    ? anonymizePhone(messageWithContact?.contact?.number)
    : "****-0000";

  const startedAt = new Date(parseInt(firstMessage.timestamp));
  const endedAt = new Date(parseInt(lastMessage.timestamp));
  const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

  try {
    const conversation = await prisma.conversation.create({
      data: {
        ticketId: ticketId.toString(),
        phoneNumber,
        startedAt,
        endedAt,
        duration,
        messageCount: messages.length,
        status: "completed",
        messages: {
          create: sortedMessages.map((msg) => ({
            externalId: msg.id,
            messageId: msg.messageId,
            sender: determineSender(msg),
            content: msg.body,
            mediaType: msg.mediaType,
            timestamp: new Date(parseInt(msg.timestamp)),
            fromMe: msg.fromMe,
            sendType: msg.sendType || null,
            userId: msg.userId || null,
          })),
        },
      },
      include: {
        messages: true,
      },
    });

    return conversation;
  } catch (error) {
    console.error(`Erro ao processar conversa ${ticketId}:`, error);
    throw error;
  }
}

async function importConversations() {
  console.log("🚀 Iniciando importação de conversas...\n");

  const dataDir = path.join(process.cwd(), "data");

  try {
    await fs.access(dataDir);
  } catch {
    console.log("📁 Criando diretório data/");
    await fs.mkdir(dataDir, { recursive: true });
    console.log(
      "⚠️  Por favor, adicione os arquivos JSON de conversas na pasta data/"
    );
    return;
  }

  const files = await fs.readdir(dataDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log("⚠️  Nenhum arquivo JSON encontrado na pasta data/");
    console.log("    Por favor, adicione os arquivos de conversas exportados");
    return;
  }

  console.log(`📂 Encontrados ${jsonFiles.length} arquivo(s) JSON\n`);

  let totalConversations = 0;
  let totalMessages = 0;

  for (const file of jsonFiles) {
    console.log(`📄 Processando ${file}...`);

    const filePath = path.join(dataDir, file);
    const content = await fs.readFile(filePath, "utf-8");

    let data: FileData;
    try {
      data = JSON.parse(content);
    } catch (error) {
      console.error(`❌ Erro ao fazer parse de ${file}:`, error);
      continue;
    }

    if (!Array.isArray(data)) {
      console.error(`❌ Arquivo ${file} não é um array`);
      continue;
    }

    // Coletar todas as mensagens de todos os objetos no array
    const allMessages: RawMessage[] = [];
    for (const conversationObj of data) {
      if (conversationObj.messages && Array.isArray(conversationObj.messages)) {
        allMessages.push(...conversationObj.messages);
      }
    }

    if (allMessages.length === 0) {
      console.error(`❌ Nenhuma mensagem encontrada em ${file}`);
      continue;
    }

    const messagesByTicket = allMessages.reduce((acc, msg) => {
      const ticketId = msg.ticketId?.toString() || "unknown";
      if (!acc[ticketId]) {
        acc[ticketId] = [];
      }
      acc[ticketId].push(msg);
      return acc;
    }, {} as Record<string, RawMessage[]>);

    console.log(
      `   Encontradas ${Object.keys(messagesByTicket).length} conversas`
    );

    for (const [ticketId, messages] of Object.entries(messagesByTicket)) {
      try {
        const existing = await prisma.conversation.findUnique({
          where: { ticketId },
        });

        if (existing) {
          console.log(`   ⏭️  Conversa ${ticketId} já existe, pulando...`);
          continue;
        }

        await processConversation(ticketId, messages);
        totalConversations++;
        totalMessages += messages.length;

        if (totalConversations % 10 === 0) {
          console.log(`   ✅ ${totalConversations} conversas importadas...`);
        }
      } catch (error) {
        console.error(`   ❌ Erro ao processar conversa ${ticketId}:`, error);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ Importação concluída!");
  console.log("=".repeat(50));
  console.log(`📊 Total de conversas importadas: ${totalConversations}`);
  console.log(`💬 Total de mensagens importadas: ${totalMessages}`);

  const avgMessagesPerConversation =
    totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
  console.log(
    `📈 Média de mensagens por conversa: ${avgMessagesPerConversation}`
  );

  const dbStats = await prisma.conversation.aggregate({
    _count: true,
    _avg: {
      messageCount: true,
      duration: true,
    },
  });

  console.log("\n📊 Estatísticas do Banco:");
  console.log(`   Total de conversas: ${dbStats._count}`);
  console.log(
    `   Média de mensagens: ${Math.round(dbStats._avg.messageCount || 0)}`
  );
  console.log(
    `   Duração média: ${Math.round((dbStats._avg.duration || 0) / 60)} minutos`
  );
}

importConversations()
  .then(() => {
    console.log("\n✅ Script finalizado com sucesso!");
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
