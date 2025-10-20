#!/usr/bin/env tsx
import fs from "fs/promises";
import path from "path";

// ========================================
// CONFIGURAÇÃO: Quantas conversas gerar
// ========================================
const TOTAL_CONVERSATIONS = 100;
const START_TICKET_ID = 10001;

// ========================================
// DADOS BASE PARA GERAÇÃO
// ========================================

const SERVICES = [
  { name: "IPTU", weight: 35 },
  { name: "Certidão Negativa", weight: 25 },
  { name: "Dívida Ativa", weight: 20 },
  { name: "Alvará de Funcionamento", weight: 10 },
  { name: "ISS", weight: 5 },
  { name: "ITBI", weight: 3 },
  { name: "Outros", weight: 2 },
];

const USER_PROFILES = [
  {
    type: "tranquilo",
    sentiment: "positivo",
    frustration: 0,
    messageCount: [3, 8],
    templates: [
      "Olá, bom dia!",
      "Gostaria de {acao} do {servico}",
      "Por favor, pode me ajudar?",
      "Muito obrigado!",
      "Perfeito, obrigado pelo atendimento!",
    ],
  },
  {
    type: "confuso",
    sentiment: "neutro",
    frustration: 3,
    messageCount: [8, 15],
    templates: [
      "Oi, preciso de ajuda",
      "Como faço para {acao} {servico}?",
      "Não entendi muito bem",
      "Pode explicar de novo?",
      "É complicado isso...",
      "Tem que fazer cadastro?",
      "Precisa de senha?",
      "Ah tá, deixa eu tentar",
      "Consegui! Obrigado",
    ],
  },
  {
    type: "urgente",
    sentiment: "neutro",
    frustration: 5,
    messageCount: [5, 12],
    templates: [
      "URGENTE!",
      "Preciso HOJE do {servico}",
      "É para uma licitação que vence amanhã",
      "Por favor, é urgente",
      "Tem como agilizar?",
      "Quanto tempo demora?",
      "Não pode ser mais rápido?",
      "Ok, vou aguardar",
    ],
  },
  {
    type: "revoltado",
    sentiment: "negativo",
    frustration: 8,
    messageCount: [6, 18],
    templates: [
      "Isso é um absurdo!",
      "O valor do {servico} está errado",
      "Não concordo com essa cobrança",
      "Já tentei várias vezes e não consigo",
      "Sistema de vocês não funciona",
      "Vou ter que ir pessoalmente?",
      "Que burocracia desnecessária",
      "Vocês não facilitam nada",
      "Preciso falar com um supervisor",
      "Vou registrar uma reclamação",
    ],
  },
];

const ACTIONS = {
  "IPTU": ["emitir 2ª via", "parcelar", "consultar débito", "solicitar isenção"],
  "Certidão Negativa": ["emitir certidão", "consultar status", "renovar"],
  "Dívida Ativa": ["consultar dívidas", "parcelar débito", "negociar"],
  "Alvará de Funcionamento": ["solicitar alvará", "renovar alvará", "consultar status"],
  "ISS": ["emitir nota fiscal", "consultar débito", "declarar"],
  "ITBI": ["calcular valor", "pagar guia", "consultar"],
  "Outros": ["consultar informação", "tirar dúvida"],
};

const BOT_RESPONSES = [
  "Olá! Seja bem-vindo(a) ao atendimento da SEFIN Vitória da Conquista. Como posso ajudar?",
  "Entendi! Vou te ajudar com isso.",
  "Para {acao} do {servico}, você precisa:",
  "1️⃣ Acessar o portal: https://portal.pmvc.ba.gov.br",
  "2️⃣ Fazer login com CPF e senha",
  "3️⃣ Selecionar a opção '{servico}'",
  "Você possui cadastro no sistema?",
  "Perfeito! O documento será gerado em até 24 horas.",
  "Você receberá um email com o boleto.",
  "Há mais alguma coisa em que posso ajudar?",
  "Obrigado por entrar em contato! Tenha um ótimo dia! 😊",
];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedChoice<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }

  return items[0];
}

function generatePhoneNumber(): string {
  const ddd = randomChoice(["77", "73", "71", "75", "85"]);
  const prefix = randomChoice(["9", "8", "7"]);
  const number = String(randomInt(10000000, 99999999));
  return `55${ddd}${prefix}${number}`;
}

function generateTimestamp(baseTime: number, offsetMinutes: number): string {
  return String(baseTime + offsetMinutes * 60 * 1000);
}

function generateISOTime(baseTime: number, offsetMinutes: number): string {
  return new Date(baseTime + offsetMinutes * 60 * 1000).toISOString();
}

// ========================================
// GERAÇÃO DE CONVERSAS
// ========================================

function generateConversation(ticketId: number): any {
  const service = weightedChoice(SERVICES).name;
  const profile = randomChoice(USER_PROFILES);
  const actions = ACTIONS[service as keyof typeof ACTIONS] || ACTIONS["Outros"];
  const selectedAction = randomChoice(actions);

  const messageCount = randomInt(profile.messageCount[0], profile.messageCount[1]);
  const phoneNumber = generatePhoneNumber();
  const contactId = randomInt(1000, 9999);

  // Timestamp base (últimos 30 dias)
  const daysAgo = randomInt(0, 30);
  const baseTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

  const messages: any[] = [];
  let currentTime = 0; // minutos desde início
  let messageId = 0;

  // Mensagem 1: Usuário inicia
  const userGreeting = randomChoice([
    "Oi",
    "Olá",
    "Bom dia",
    "Boa tarde",
    "Preciso de ajuda",
  ]);

  messages.push({
    id: `msg_${ticketId}_${messageId++}`,
    messageId: `wamid.fake_${ticketId}_${messageId}`,
    fromMe: false,
    body: userGreeting,
    mediaType: "chat",
    timestamp: generateTimestamp(baseTime, currentTime),
    createdAt: generateISOTime(baseTime, currentTime),
    sendType: null,
    userId: null,
    contact: {
      id: contactId,
      name: `Cidadão ${contactId}`,
      number: phoneNumber,
      channel: "whatsapp",
      customFields: {},
      tags: [],
    },
    ticketId: ticketId,
    contactId: contactId,
    read: true,
    ack: 2,
    status: "received",
  });
  currentTime += randomInt(1, 3);

  // Mensagem 2: Bot responde
  messages.push({
    id: `msg_${ticketId}_${messageId++}`,
    messageId: `wamid.fake_${ticketId}_${messageId}`,
    fromMe: true,
    body: BOT_RESPONSES[0],
    mediaType: "chat",
    timestamp: generateTimestamp(baseTime, currentTime),
    createdAt: generateISOTime(baseTime, currentTime),
    sendType: "bot",
    userId: null,
    contact: {
      id: contactId,
      name: `Cidadão ${contactId}`,
      number: phoneNumber,
      channel: "whatsapp",
      customFields: {},
      tags: [],
    },
    ticketId: ticketId,
    contactId: contactId,
    read: true,
    ack: 2,
    status: "sended",
  });
  currentTime += randomInt(1, 2);

  // Mensagem 3: Usuário pede serviço
  const userRequest = profile.templates[1]
    .replace("{acao}", selectedAction)
    .replace("{servico}", service);

  messages.push({
    id: `msg_${ticketId}_${messageId++}`,
    messageId: `wamid.fake_${ticketId}_${messageId}`,
    fromMe: false,
    body: userRequest,
    mediaType: "chat",
    timestamp: generateTimestamp(baseTime, currentTime),
    createdAt: generateISOTime(baseTime, currentTime),
    sendType: null,
    userId: null,
    contact: {
      id: contactId,
      name: `Cidadão ${contactId}`,
      number: phoneNumber,
      channel: "whatsapp",
      customFields: {},
      tags: [],
    },
    ticketId: ticketId,
    contactId: contactId,
    read: true,
    ack: 2,
    status: "received",
  });
  currentTime += randomInt(2, 5);

  // Resto da conversa
  let botTurn = true;
  let templateIndex = 2;

  while (messages.length < messageCount) {
    if (botTurn) {
      const botMessage = randomChoice(BOT_RESPONSES)
        .replace("{acao}", selectedAction)
        .replace("{servico}", service);

      messages.push({
        id: `msg_${ticketId}_${messageId++}`,
        messageId: `wamid.fake_${ticketId}_${messageId}`,
        fromMe: true,
        body: botMessage,
        mediaType: "chat",
        timestamp: generateTimestamp(baseTime, currentTime),
        createdAt: generateISOTime(baseTime, currentTime),
        sendType: "bot",
        userId: null,
        contact: {
          id: contactId,
          name: `Cidadão ${contactId}`,
          number: phoneNumber,
          channel: "whatsapp",
          customFields: {},
          tags: [],
        },
        ticketId: ticketId,
        contactId: contactId,
        read: true,
        ack: 2,
        status: "sended",
      });
      currentTime += randomInt(1, 2);
    } else {
      const userMessage =
        templateIndex < profile.templates.length
          ? profile.templates[templateIndex++]
          : randomChoice(profile.templates.slice(2));

      messages.push({
        id: `msg_${ticketId}_${messageId++}`,
        messageId: `wamid.fake_${ticketId}_${messageId}`,
        fromMe: false,
        body: userMessage,
        mediaType: "chat",
        timestamp: generateTimestamp(baseTime, currentTime),
        createdAt: generateISOTime(baseTime, currentTime),
        sendType: null,
        userId: null,
        contact: {
          id: contactId,
          name: `Cidadão ${contactId}`,
          number: phoneNumber,
          channel: "whatsapp",
          customFields: {},
          tags: [],
        },
        ticketId: ticketId,
        contactId: contactId,
        read: true,
        ack: 2,
        status: "received",
      });
      currentTime += randomInt(2, 10);
    }

    botTurn = !botTurn;
  }

  return { messages };
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.log("🎭 Iniciando geração de conversas fake...\n");
  console.log(`📊 Configuração:`);
  console.log(`   - Total de conversas: ${TOTAL_CONVERSATIONS}`);
  console.log(`   - Ticket inicial: ${START_TICKET_ID}`);
  console.log(`   - Ticket final: ${START_TICKET_ID + TOTAL_CONVERSATIONS - 1}\n`);

  const conversations: any[] = [];

  for (let i = 0; i < TOTAL_CONVERSATIONS; i++) {
    const ticketId = START_TICKET_ID + i;
    const conversation = generateConversation(ticketId);
    conversations.push(conversation);

    if ((i + 1) % 10 === 0) {
      console.log(`   ✅ ${i + 1}/${TOTAL_CONVERSATIONS} conversas geradas...`);
    }
  }

  // Salvar arquivo
  const outputPath = path.join(process.cwd(), "data", "fake-conversations.json");
  await fs.writeFile(outputPath, JSON.stringify(conversations, null, 2), "utf-8");

  console.log("\n" + "=".repeat(60));
  console.log("✨ Conversas geradas com sucesso!");
  console.log("=".repeat(60));
  console.log(`📁 Arquivo salvo em: ${outputPath}`);
  console.log(`📊 Total de conversas: ${conversations.length}`);

  const totalMessages = conversations.reduce(
    (sum, conv) => sum + conv.messages.length,
    0
  );
  console.log(`💬 Total de mensagens: ${totalMessages}`);
  console.log(`📈 Média de mensagens: ${Math.round(totalMessages / conversations.length)}`);

  console.log("\n💡 Próximo passo:");
  console.log("   npx tsx scripts/1-import-conversations.ts");
}

main().catch(console.error);
