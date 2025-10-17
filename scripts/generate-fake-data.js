const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Nomes fictícios brasileiros
const firstNames = [
  'Ana', 'João', 'Maria', 'Pedro', 'Juliana', 'Carlos', 'Beatriz', 'Lucas', 'Fernanda', 'Rafael',
  'Camila', 'Bruno', 'Amanda', 'Felipe', 'Patricia', 'Gabriel', 'Mariana', 'Rodrigo', 'Larissa', 'Daniel',
  'Bianca', 'Matheus', 'Isabela', 'Thiago', 'Carolina', 'Leonardo', 'Gabriela', 'Gustavo', 'Natália', 'Diego',
  'Letícia', 'Vinicius', 'Aline', 'Marcelo', 'Priscila', 'Ricardo', 'Renata', 'André', 'Vanessa', 'Paulo',
  'Tatiana', 'Fábio', 'Cristina', 'Alexandre', 'Adriana', 'Fernando', 'Mônica', 'Sérgio', 'Claudia', 'Marcos'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa',
  'Cardoso', 'Correia', 'Dias', 'Fernandes', 'Freitas', 'Garcia', 'Henriques', 'Jesus', 'Lopes', 'Marques',
  'Miranda', 'Monteiro', 'Moreira', 'Nunes', 'Pinto', 'Ramos', 'Reis', 'Resende', 'Sá', 'Soares'
];

// Tipos de serviço e conversas
const serviceTypes = {
  IPTU: {
    userMessages: [
      'Oi, preciso de uma segunda via do IPTU',
      'Bom dia, quero pagar meu IPTU',
      'Oi, como faço para parcelar o IPTU?',
      'Preciso do boleto do IPTU atualizado',
      'Oi, meu IPTU tem desconto se pagar à vista?',
      'Como consulto o valor do meu IPTU?',
      'Quero negociar minha dívida de IPTU',
      'O IPTU pode ser pago por PIX?',
      'Preciso de isenção de IPTU para idoso',
      'Como emito o boleto do IPTU?'
    ],
    botResponses: [
      'Para emitir a segunda via do IPTU, você precisa informar o número da inscrição municipal ou CPF do proprietário.',
      'Você pode pagar o IPTU através do código de barras no aplicativo do seu banco ou em casas lotéricas.',
      'O parcelamento do IPTU pode ser feito em até 10x. Informe o número da inscrição para verificar o valor.',
      'O IPTU com desconto de 10% à vista pode ser pago até o dia 31 de março.',
      'Para consultar o valor, acesse nosso portal ou informe sua inscrição municipal.',
      'Sim, aceitamos pagamento via PIX. A chave PIX está no boleto.',
      'Idosos acima de 65 anos têm direito a isenção. Você precisa apresentar documentação na secretaria.',
      'O boleto está disponível no portal da prefeitura. Você pode baixar em PDF.',
      'Para negociar dívidas, você pode parcelar em até 12 vezes com juros reduzidos.',
      'Sua inscrição municipal foi encontrada. O valor do IPTU é R$ 1.245,00.'
    ]
  },
  CERTIDAO: {
    userMessages: [
      'Preciso de uma certidão negativa urgente',
      'Oi, como solicito certidão negativa?',
      'Quanto tempo demora para sair a certidão?',
      'A certidão é grátis?',
      'Preciso de certidão negativa para pessoa jurídica',
      'Como faço para baixar a certidão?',
      'Minha certidão está vencida, preciso renovar',
      'Certidão negativa pode ser enviada por email?',
      'Tenho débitos, posso emitir certidão?',
      'Preciso da certidão para financiamento'
    ],
    botResponses: [
      'A certidão negativa é emitida em até 24 horas após a solicitação.',
      'Para solicitar, você precisa informar CPF ou CNPJ e não pode ter débitos pendentes.',
      'A certidão negativa é gratuita e tem validade de 90 dias.',
      'Para pessoa jurídica, informe o CNPJ completo.',
      'Você receberá um link por email para download da certidão em PDF.',
      'Se você tem débitos, pode regularizar e depois solicitar a certidão.',
      'A certidão será enviada por email assim que estiver pronta.',
      'Verifiquei e você possui débitos pendentes no valor de R$ 850,00.',
      'Para financiamento, a certidão deve estar dentro da validade (90 dias).',
      'Sua solicitação foi registrada com o protocolo #2024-08765.'
    ]
  },
  DIVIDA_ATIVA: {
    userMessages: [
      'Tenho dívidas em aberto, como consulto?',
      'Quero negociar minha dívida ativa',
      'Recebi notificação de dívida, o que faço?',
      'Posso parcelar dívida antiga?',
      'Quanto está minha dívida total?',
      'A dívida prescreveu?',
      'Como limpo meu nome na dívida ativa?',
      'Posso pagar com desconto?',
      'Dívida ativa pode ser protestada?',
      'Preciso de certidão com débitos'
    ],
    botResponses: [
      'Para consultar suas dívidas, informe seu CPF ou CNPJ.',
      'Você pode parcelar em até 24 vezes com entrada de 10%.',
      'A notificação refere-se a débitos de IPTU dos anos 2019, 2020 e 2021.',
      'Sim, dívidas antigas podem ser parceladas. O prazo de prescrição é de 5 anos.',
      'Sua dívida total é de R$ 3.450,00 referente a impostos municipais.',
      'Pagando à vista, você tem desconto de 20% em juros e multas.',
      'Para limpar o nome, você precisa quitar ou parcelar todos os débitos.',
      'A dívida ativa pode ser inscrita em cartório de protesto após 90 dias.',
      'Você pode emitir uma certidão positiva com efeito de negativa.',
      'Sua dívida mais antiga é de 2018 e ainda não prescreveu.'
    ]
  },
  ALVARA: {
    userMessages: [
      'Como solicito alvará de funcionamento?',
      'Preciso renovar meu alvará',
      'Quanto custa o alvará?',
      'Alvará provisório, como fazer?',
      'Meu alvará foi negado, por quê?',
      'Quanto tempo demora o alvará?',
      'Alvará para comércio, quais documentos?',
      'Posso funcionar sem alvará?',
      'Alvará sanitário é diferente?',
      'Como consulto situação do alvará?'
    ],
    botResponses: [
      'Para solicitar o alvará, você precisa apresentar: contrato social, CNPJ, comprovante de endereço e planta baixa.',
      'A renovação do alvará deve ser feita anualmente até 31 de março.',
      'O custo varia conforme o tipo de atividade e área do estabelecimento. Entre R$ 150 e R$ 800.',
      'O alvará provisório é válido por 180 dias enquanto aguarda vistoria.',
      'O alvará pode ser negado por irregularidades no imóvel ou documentação incompleta.',
      'O prazo médio de emissão é de 30 dias após vistoria.',
      'Para comércio, além dos documentos básicos, é necessário laudo de vistoria do Corpo de Bombeiros.',
      'Funcionar sem alvará pode resultar em multa e interdição do estabelecimento.',
      'O alvará sanitário é adicional e obrigatório para estabelecimentos de alimentação.',
      'Sua solicitação está em análise. Protocolo #2024-15432.'
    ]
  },
  PARCELAMENTO: {
    userMessages: [
      'Posso parcelar impostos atrasados?',
      'Quantas parcelas posso fazer?',
      'Qual o valor mínimo da parcela?',
      'Como funciona o parcelamento?',
      'Posso renegociar parcelas antigas?',
      'Perdi uma parcela, e agora?',
      'Parcelamento tem juros?',
      'Posso antecipar parcelas?',
      'Quantos parcelamentos posso ter?',
      'Como faço simulação de parcelas?'
    ],
    botResponses: [
      'Sim, você pode parcelar impostos atrasados em até 12 vezes.',
      'O valor mínimo da parcela é R$ 50,00.',
      'O parcelamento inclui juros de 1% ao mês + correção monetária.',
      'Você pode fazer até 2 parcelamentos simultâneos.',
      'Se perder uma parcela, o parcelamento é cancelado e a dívida volta integral.',
      'Sim, você pode antecipar parcelas sem penalidade.',
      'Para fazer simulação, informe o valor total da dívida.',
      'Parcelamentos antigos podem ser renegociados mediante entrada de 20%.',
      'O primeiro boleto do parcelamento vence em 30 dias.',
      'Sua simulação: 12x de R$ 287,50 (total R$ 3.450,00)'
    ]
  }
};

// Gerar nome aleatório
function generateRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Gerar telefone fictício brasileiro
function generatePhoneNumber() {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '91'][Math.floor(Math.random() * 10)];
  const number = Math.floor(900000000 + Math.random() * 100000000);
  return `55${ddd}${number}`;
}

// Gerar timestamp
function generateTimestamp(baseDate, offset) {
  return new Date(baseDate.getTime() + offset * 1000).getTime();
}

// Gerar UUID
function generateUUID() {
  return uuidv4();
}

// Criar mensagem
function createMessage(body, fromMe, ticketId, contactData, timestamp, sendType = null) {
  const messageId = fromMe ? generateUUID() : `wamid.${generateUUID().replace(/-/g, '').toUpperCase()}`;

  return {
    mediaName: null,
    mediaUrl: "",
    msgCreatedAt: null,
    id: generateUUID(),
    messageId: messageId,
    ack: fromMe ? 3 : 0,
    status: fromMe ? "sended" : "received",
    wabaMediaId: null,
    read: true,
    fromMe: fromMe,
    body: body,
    caption: null,
    originalName: null,
    size: 0,
    previousBody: null,
    mediaType: "chat",
    code: null,
    isDeleted: false,
    createdAt: new Date(timestamp).toISOString(),
    updatedAt: new Date(timestamp + 1000).toISOString(),
    quotedMsgId: null,
    ticketId: ticketId,
    contactId: contactData.id,
    timestamp: timestamp.toString(),
    userId: null,
    scheduleDate: null,
    sendType: sendType,
    tenantId: 1,
    tenantUid: fromMe ? null : generateUUID(),
    raw: fromMe ? {} : {
      app: "Municipal",
      timestamp: timestamp,
      version: 2,
      type: "message",
      payload: {
        id: messageId,
        source: contactData.number,
        type: "text",
        payload: { text: body },
        sender: {
          phone: contactData.number,
          name: contactData.name,
          country_code: "55",
          dial_code: contactData.number.substring(2)
        }
      }
    },
    note: false,
    isObjectStorage: fromMe ? false : true,
    importStatus: null,
    isTransfer: false,
    externalKey: null,
    params: null,
    templateMediaId: null,
    typeTemplate: null,
    templateId: null,
    contact: {
      id: contactData.id,
      name: contactData.name,
      number: contactData.number,
      email: "",
      profilePicUrl: "",
      pushname: contactData.name,
      observations: "",
      senderLid: null,
      identifierType: "jid",
      channel: "whatsapp",
      isUser: false,
      isWAContact: true,
      isGroup: false,
      deletedAt: null,
      negotiatedValue: null,
      leadStatusId: null,
      tenantId: 1,
      customFields: {},
      tags: [],
      firstConnection: Math.floor(Math.random() * 10) + 1,
      defaultDepartment: null,
      createdAt: new Date(timestamp - 86400000 * 30).toISOString(),
      updatedAt: new Date(timestamp - 86400000 * 30).toISOString()
    },
    quotedMsg: null,
    user: null
  };
}

// Criar conversa completa
function createConversation(ticketId, serviceType, conversationIndex) {
  const contactName = generateRandomName();
  const contactPhone = generatePhoneNumber();
  const contactId = 10000 + ticketId;

  const contactData = {
    id: contactId,
    name: contactName,
    number: contactPhone
  };

  // Data base (últimos 60 dias)
  const daysAgo = Math.floor(Math.random() * 60);
  const baseDate = new Date(Date.now() - daysAgo * 86400000);

  const messages = [];
  let currentTimestamp = baseDate.getTime();

  // Saudação do usuário
  const greetings = ['Oi', 'Olá', 'Bom dia', 'Boa tarde', 'Boa noite'];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  messages.push(createMessage(greeting, false, ticketId, contactData, currentTimestamp));
  currentTimestamp += Math.floor(Math.random() * 3000) + 2000;

  // Mensagem de boas-vindas do bot
  const welcomeMsg = `*Olá! Eu sou a Assistente Virtual* 😀\nSua assistente da *SECRETARIA DE FINANÇAS*.\n\n🚫_Aviso: Não aceitamos áudio!_`;
  messages.push(createMessage(welcomeMsg, true, ticketId, contactData, currentTimestamp, 'bot'));
  currentTimestamp += Math.floor(Math.random() * 2000) + 1000;

  // Menu principal
  const menuMsg = `*Para que eu possa te ajudar, selecione uma das opções abaixo:*\n\n*1* - 🏠 Boleto de IPTU\n*2* - 📄 Certidão Negativa\n*3* - 📑 Parcelamento\n*4* - 📜 Serviços de alvará\n*5* - ❓ Tenho Dúvidas\n*6* - ✖️ Sair`;
  messages.push(createMessage(menuMsg, true, ticketId, contactData, currentTimestamp, 'bot'));
  currentTimestamp += Math.floor(Math.random() * 5000) + 3000;

  // Número da opção baseado no serviço
  const serviceOptions = {
    'IPTU': '1',
    'CERTIDAO': '2',
    'PARCELAMENTO': '3',
    'ALVARA': '4',
    'DIVIDA_ATIVA': '3'
  };

  const option = serviceOptions[serviceType] || '1';
  messages.push(createMessage(option, false, ticketId, contactData, currentTimestamp));
  currentTimestamp += Math.floor(Math.random() * 2000) + 1000;

  // Obter dados do serviço
  const serviceData = serviceTypes[serviceType];
  const numInteractions = Math.floor(Math.random() * 5) + 3; // 3-7 interações

  for (let i = 0; i < numInteractions; i++) {
    // Mensagem do usuário
    const userMsg = serviceData.userMessages[i % serviceData.userMessages.length];
    messages.push(createMessage(userMsg, false, ticketId, contactData, currentTimestamp));
    currentTimestamp += Math.floor(Math.random() * 3000) + 2000;

    // Resposta do bot
    const botMsg = serviceData.botResponses[i % serviceData.botResponses.length];
    messages.push(createMessage(botMsg, true, ticketId, contactData, currentTimestamp, 'bot'));
    currentTimestamp += Math.floor(Math.random() * 4000) + 2000;
  }

  // Mensagens finais (variadas)
  const shouldResolve = Math.random() > 0.25; // 75% de resolução

  if (shouldResolve) {
    const thanksMessages = ['Obrigado!', 'Muito obrigado pela ajuda!', 'Perfeito, obrigado!', 'Ok, obrigado!', 'Entendi, obrigado!'];
    const thanksMsg = thanksMessages[Math.floor(Math.random() * thanksMessages.length)];
    messages.push(createMessage(thanksMsg, false, ticketId, contactData, currentTimestamp));
    currentTimestamp += Math.floor(Math.random() * 2000) + 1000;

    const closingMsg = `Por nada! 😊\n\nFico feliz em ajudar!\n\nSe precisar de mais alguma coisa, é só chamar.`;
    messages.push(createMessage(closingMsg, true, ticketId, contactData, currentTimestamp, 'bot'));
  } else {
    // Alguns sem resolução (abandono ou frustração)
    if (Math.random() > 0.5) {
      const frustrationMessages = [
        'Não entendi muito bem',
        'Isso é muito complicado',
        'Não consegui resolver',
        'Preciso de ajuda presencial',
        'Vou ver isso depois'
      ];
      const frustMsg = frustrationMessages[Math.floor(Math.random() * frustrationMessages.length)];
      messages.push(createMessage(frustMsg, false, ticketId, contactData, currentTimestamp));
    }
  }

  return { messages };
}

// Gerar todas as conversas
function generateAllConversations(numConversations = 500) {
  const conversations = [];
  const services = ['IPTU', 'CERTIDAO', 'DIVIDA_ATIVA', 'ALVARA', 'PARCELAMENTO'];

  for (let i = 0; i < numConversations; i++) {
    const ticketId = 90000 + i;

    // Alternar serviço a cada 10 conversas
    const serviceIndex = Math.floor(i / 10) % services.length;
    const serviceType = services[serviceIndex];

    const conversation = createConversation(ticketId, serviceType, i);
    conversations.push(conversation);

    if ((i + 1) % 50 === 0) {
      console.log(`Geradas ${i + 1} conversas...`);
    }
  }

  return conversations;
}

// Executar
console.log('Iniciando geração de dados fictícios...');
const conversations = generateAllConversations(500);

const outputPath = './data/messages.json';
fs.writeFileSync(outputPath, JSON.stringify(conversations, null, '\t'));

console.log(`✅ ${conversations.length} conversas fictícias geradas com sucesso!`);
console.log(`Arquivo salvo em: ${outputPath}`);
console.log(`Tamanho do arquivo: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
