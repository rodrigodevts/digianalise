import { prisma } from "@/lib/db";
import { ImportLogger, extractRequestInfo } from "@/lib/import-logger";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Timeout de 60 segundos

interface RawMessage {
  id: string;
  messageId?: string;
  status?: string;
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
}

interface ConversationData {
  messages: RawMessage[];
}

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

  if (message.userId) {
    return "agent";
  }

  return "bot";
}

function parseTimestamp(timestamp: string): Date {
  // Tenta diferentes formatos de timestamp
  let date: Date;
  
  // Se é um número (timestamp Unix em milissegundos)
  if (/^\d+$/.test(timestamp)) {
    const ts = parseInt(timestamp);
    // Se parece ser em segundos (menor que ano 2100), converte para ms
    date = new Date(ts < 4000000000 ? ts * 1000 : ts);
  } else {
    // Tenta parsing direto da string
    date = new Date(timestamp);
  }
  
  // Se a data é inválida, usa timestamp atual
  if (isNaN(date.getTime())) {
    console.warn(`Timestamp inválido encontrado: ${timestamp}, usando timestamp atual`);
    date = new Date();
  }
  
  return date;
}

export async function POST(request: NextRequest) {
  const requestInfo = extractRequestInfo(request);
  let logger: ImportLogger | null = null;

  try {
    // Validar content-type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type deve ser application/json" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "JSON inválido no body da requisição" },
        { status: 400 }
      );
    }

    // Suporta tanto upload direto quanto arquivo base64
    let jsonData: ConversationData[];

    if (body.data) {
      // Dados enviados diretamente
      if (!Array.isArray(body.data)) {
        return NextResponse.json(
          { success: false, error: "Campo data deve ser um array" },
          { status: 400 }
        );
      }
      jsonData = body.data;
    } else if (body.base64) {
      // Arquivo em base64
      if (typeof body.base64 !== "string") {
        return NextResponse.json(
          { success: false, error: "Campo base64 deve ser uma string" },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(body.base64, "base64");
        jsonData = JSON.parse(buffer.toString("utf-8"));
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Arquivo base64 inválido ou JSON malformado",
          },
          { status: 400 }
        );
      }
    } else if (body.url) {
      // URL para baixar o arquivo
      if (typeof body.url !== "string") {
        return NextResponse.json(
          { success: false, error: "Campo url deve ser uma string" },
          { status: 400 }
        );
      }

      try {
        const response = await fetch(body.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        jsonData = await response.json();
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Erro ao baixar arquivo: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos. Envie data, base64 ou url.",
        },
        { status: 400 }
      );
    }

    // Validar estrutura dos dados
    if (!Array.isArray(jsonData)) {
      return NextResponse.json(
        { success: false, error: "Dados devem ser um array de conversas" },
        { status: 400 }
      );
    }

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array de conversas está vazio" },
        { status: 400 }
      );
    }

    // Validar estrutura básica das conversas
    for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
      const item = jsonData[i];
      if (!item.messages || !Array.isArray(item.messages)) {
        return NextResponse.json(
          {
            success: false,
            error: `Item ${i + 1}: campo messages deve ser um array`,
          },
          { status: 400 }
        );
      }
      if (item.messages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Item ${i + 1}: array de messages está vazio`,
          },
          { status: 400 }
        );
      }
    }

    // Iniciar logging - temporariamente desabilitado até collections existirem
    // logger = await ImportLogger.start({
    //   operation: 'conversations',
    //   fileName: body.fileName || 'manual_upload.json',
    //   fileSize: JSON.stringify(jsonData).length,
    //   ...requestInfo
    // })

    // Processar conversas
    const conversationMap = new Map<number, any>();
    const messagesMap = new Map<number, any[]>();

    for (const item of jsonData) {
      if (!item.messages || item.messages.length === 0) continue;

      const firstMessage = item.messages[0];
      const lastMessage = item.messages[item.messages.length - 1];
      const ticketId = firstMessage.ticketId;

      if (!conversationMap.has(ticketId)) {
        const phoneNumber = anonymizePhone(firstMessage.contact?.number);

        const startDate = parseTimestamp(firstMessage.timestamp);
        const endDate = parseTimestamp(lastMessage.timestamp);
        
        conversationMap.set(ticketId, {
          ticketId: `ticket_${ticketId}`,
          phoneNumber,
          startedAt: startDate,
          endedAt: endDate,
          duration: Math.floor((endDate.getTime() - startDate.getTime()) / 1000),
          messageCount: 0,
          status: lastMessage.status || "closed",
        });

        messagesMap.set(ticketId, []);
      }

      const conversation = conversationMap.get(ticketId)!;
      const messages = messagesMap.get(ticketId)!;

      conversation.messageCount += item.messages.length;

      for (const msg of item.messages) {
        messages.push({
          externalId: `msg_${msg.id}`,
          messageId: msg.messageId || null,
          sender: determineSender(msg),
          content: msg.body || "",
          mediaType: msg.mediaType || "chat",
          timestamp: parseTimestamp(msg.timestamp),
          fromMe: msg.fromMe,
          sendType: msg.sendType || null,
          userId: msg.userId || null,
        });
      }
    }

    // Atualizar log com totais - desabilitado
    // if (logger) {
    //   await logger.update({
    //     totalItems: conversationMap.size,
    //     processedItems: 0,
    //     errorCount: 0
    //   })
    // }

    // Salvar no banco
    let savedConversations = 0;
    let savedMessages = 0;
    const errors: string[] = [];

    for (const [ticketId, conversation] of Array.from(
      conversationMap.entries()
    )) {
      try {
        // Verificar se conversa já existe (apenas se collection existir)
        let existingConversation = null;
        try {
          existingConversation = await prisma.conversation.findFirst({
            where: { ticketId: conversation.ticketId },
          });
        } catch (error) {
          // Collection não existe ainda, continuar com inserção
          console.log("Collection Conversation não existe ainda, criando...");
        }

        if (existingConversation) {
          console.log(
            `Conversa ${conversation.ticketId} já existe, pulando...`
          );
          continue; // Apenas pula, sem adicionar aos erros (comportamento normal)
        }

        // Criar conversa
        const savedConversation = await prisma.conversation.create({
          data: conversation,
        });

        // Criar mensagens
        const messages = messagesMap.get(ticketId)!;
        if (messages.length > 0) {
          try {
            await prisma.message.createMany({
              data: messages.map((msg) => ({
                ...msg,
                conversationId: savedConversation.id,
              })),
            });
            savedMessages += messages.length;
          } catch (messageError) {
            // Se falhar ao criar mensagens, remover a conversa criada
            await prisma.conversation.delete({
              where: { id: savedConversation.id },
            });
            throw messageError;
          }
        }

        savedConversations++;

        // Atualizar progresso a cada 10 conversas processadas - desabilitado
        // if (logger && savedConversations % 10 === 0) {
        //   await logger.update({
        //     processedItems: savedConversations,
        //     errorCount: errors.length
        //   })
        // }
      } catch (error) {
        let errorMsg = `Erro ao salvar ticket ${ticketId}: `;

        if (error instanceof Error) {
          // Log completo do erro para debug
          console.error("Full error details:", error);

          // Tratar diferentes tipos de erro do Prisma
          if (error.message.includes("Unique constraint")) {
            errorMsg += "Registro duplicado encontrado";
          } else if (error.message.includes("Foreign key constraint")) {
            errorMsg += "Erro de referência de dados";
          } else if (error.message.includes("Invalid value for argument")) {
            errorMsg += "Dados com formato inválido (verifique timestamps/datas)";
          } else if (error.message.includes("Invalid")) {
            errorMsg += `Dados inválidos: ${error.message}`;
          } else {
            errorMsg += error.message;
          }
        } else {
          errorMsg += String(error);
        }

        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Estatísticas finais
    const stats = {
      totalConversations: conversationMap.size,
      savedConversations,
      totalMessages: Array.from(messagesMap.values()).reduce(
        (acc, msgs) => acc + msgs.length,
        0
      ),
      savedMessages,
      errors: errors.length,
    };

    // Finalizar log - desabilitado
    // if (logger) {
    //   await logger.complete(true, {
    //     totalItems: conversationMap.size,
    //     processedItems: savedConversations,
    //     errorCount: errors.length,
    //     errors: errors.length > 0 ? errors : undefined
    //   })
    // }

    const skippedConversations =
      conversationMap.size - savedConversations - errors.length;

    let message = `${savedConversations} conversas importadas com ${savedMessages} mensagens`;
    if (skippedConversations > 0) {
      message += ` (${skippedConversations} conversas já existiam e foram ignoradas)`;
    }

    return NextResponse.json({
      success: true,
      message,
      stats: {
        ...stats,
        skippedConversations,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    // Log do erro se o logger foi criado - desabilitado
    // if (logger) {
    //   await logger.complete(false, {
    //     errorCount: 1,
    //     errors: [error instanceof Error ? error.message : 'Erro interno']
    //   })
    // }

    console.error("Erro na importação:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

// GET para verificar status
export async function GET() {
  try {
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    const totalAnalyses = await prisma.conversationAnalysis.count();

    return NextResponse.json({
      success: true,
      data: {
        conversations: totalConversations,
        messages: totalMessages,
        analyses: totalAnalyses,
        status: totalConversations > 0 ? "ready" : "empty",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erro ao buscar status" },
      { status: 500 }
    );
  }
}
