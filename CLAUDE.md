# 🏛️ SEFIN Analytics - Plataforma de Curadoria e Analytics

## 📋 VISÃO GERAL DO PROJETO

Sistema de análise inteligente de conversas para a Secretaria de Finanças (SEFIN) de Vitória da Conquista - BA.

**Objetivo**: Transformar conversas desestruturadas de atendimento ao cidadão em insights acionáveis através de IA, gerando dashboards com métricas, alertas proativos e recomendações automáticas.

**Contexto**: Este é um MVP que será demonstrado para o BNB (Banco do Nordeste do Brasil) como prova de conceito da tecnologia aplicada ao setor financeiro.

---

## 🎯 PROBLEMAS QUE RESOLVEMOS

1. **Falta de visibilidade**: Gestores não sabem quais serviços são mais demandados
2. **Cidadãos frustrados**: Sistema não identifica quem está tendo dificuldades
3. **Oportunidades perdidas**: Não há detecção de padrões para melhorias
4. **Ineficiência operacional**: Sem métricas para otimizar processos
5. **Decisões sem dados**: Falta de inteligência para planejamento estratégico

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológica

```
Frontend + Backend: Next.js 14 (App Router) + TypeScript
UI: shadcn/ui + Tailwind CSS
Charts: Recharts
Database: SQLite + Prisma ORM
IA/NLP: gemini-2.5-flash
Deploy: Vercel (ou local)
```

### Fluxo de Dados

```
[JSON Conversas]
    ↓
[Script 1: Importação] → [SQLite: Conversation + Message]
    ↓
[Script 2: Análise IA] → [SQLite: ConversationAnalysis]
    ↓
[Script 3: Agregação] → [SQLite: ServiceMetrics + Alert]
    ↓
[Next.js API Routes] → [React Dashboards]
```

---

## 📊 ESTRUTURA DE DADOS

### Modelo de Dados Principal

#### Conversation
- Representa uma conversa completa entre cidadão e sistema

#### Message
- Mensagens individuais dentro de uma conversa
- Armazena a conversa bruta para análise

#### ConversationAnalysis
- Análise completa feita pela IA sobre a conversa
- Contém: classificações, sentimento, perfil, oportunidades
- Gerada pelo script de análise (Gemini API)

#### ServiceMetrics
- Métricas agregadas pré-calculadas por serviço
- Contém: totais, crescimentos, satisfação, top perguntas
- Otimiza performance dos dashboards

#### Alert
- Alertas automáticos gerados pelo sistema
- Contém: severidade, tipo, descrição, recomendação
- Classificados em: critical, urgent, monitor

## 📥 FORMATO DOS DADOS DE ENTRADA (JSON de Conversas)

### Estrutura do JSON Exportado

As conversas são exportadas do sistema de atendimento em arquivos JSON com a seguinte estrutura:

```json
{
  "messages": [
    {
      "id": "uuid",
      "messageId": "wamid ou uuid",
      "fromMe": boolean,
      "body": "string (conteúdo da mensagem)",
      "mediaType": "chat|button_reply|list_reply|image|document",
      "timestamp": "string (unix timestamp em ms)",
      "createdAt": "ISO 8601 datetime",
      "sendType": "bot|null",
      "userId": number|null,
      "contact": {
        "id": number,
        "name": "string",
        "number": "string (telefone completo com DDI+DDD)",
        "channel": "whatsapp",
        "customFields": {},
        "tags": []
      },
      "ticketId": number,
      "contactId": number,
      "read": boolean,
      "ack": number (0-3),
      "status": "received|sended"
    }
  ]
}
```

### Campos Importantes para Análise

#### 1. Identificação da Mensagem
- **`id`**: ID único interno do sistema
- **`messageId`**: ID do WhatsApp (wamid) ou UUID interno
- **`timestamp`**: Unix timestamp em milissegundos (ex: "1760364065276")
- **`createdAt`**: ISO 8601 (ex: "2025-10-13T14:01:05.758Z")

#### 2. Conteúdo
- **`body`**: Texto da mensagem (PRINCIPAL para análise de IA)
- **`mediaType`**: Tipo de conteúdo
  - `chat`: Mensagem de texto comum
  - `button_reply`: Resposta a botão
  - `list_reply`: Resposta a lista
  - `image`: Imagem
  - `document`: Documento (PDF, etc)
  - `audio`: Áudio (geralmente rejeitado)

#### 3. Sender (Quem enviou)
- **`fromMe`**: 
  - `true` = Bot/Atendente enviou
  - `false` = Cidadão enviou
- **`sendType`**:
  - `"bot"` = Mensagem automática do bot
  - `null` = Mensagem do cidadão ou atendente humano
- **`userId`**:
  - `null` = Bot ou cidadão
  - `number` = ID do atendente humano

#### 4. Contato (Cidadão)
- **`contact.name`**: Nome do contato (pode conter emojis)
- **`contact.number`**: Telefone completo (ex: "557799726758")
  - Formato: DDI (55) + DDD (77) + Número (99726758)
  - **ATENÇÃO LGPD**: Anonimizar para ****-6758
- **`contact.channel`**: Sempre "whatsapp" neste caso

#### 5. Status
- **`ticketId`**: ID do atendimento (agrupa mensagens da mesma conversa)
- **`read`**: Se foi lida
- **`ack`**: Confirmação de entrega WhatsApp
  - 0: Enviado
  - 1: Entregue
  - 2: Lido
  - 3: Confirmado
- **`status`**: "received" ou "sended"

---

### Considerações Técnicas

#### Encoding
- Mensagens vêm em UTF-8
- Pode conter emojis (armazenar corretamente)
- Campos de texto podem ter quebras de linha (\n)

#### Timestamps
- `timestamp`: Unix timestamp em STRING (milissegundos)
- `createdAt`: ISO 8601 em STRING
- **Conversão**: `new Date(parseInt(timestamp))`
- **Fuso horário**: UTC (já convertido)

#### IDs Duplicados
- `messageId` pode repetir (bug do sistema)
- Usar `id` (UUID interno) como chave primária
- `ticketId` é confiável para agrupamento

#### Performance
- Arquivos podem ter 1000+ mensagens
- Processar em batches de 100
- Não carregar tudo na memória
- Usar streams se arquivo > 10MB

---

**IMPORTANTE**: Sempre testar o script de importação com um arquivo pequeno (10-20 mensagens) primeiro antes de processar o dataset completo!

---

## 🎓 DOMÍNIO: SERVIÇOS DA SEFIN

### Serviços Tributários Principais

1. **IPTU (Imposto Predial e Territorial Urbano)**
   - Boleto/segunda via
   - Parcelamento
   - Consulta de débitos
   - Isenções (idosos, pessoas com deficiência)
   - Desconto pagamento à vista

2. **Certidão Negativa de Débitos**
   - Pessoa Física
   - Pessoa Jurídica
   - Necessária para: licitações, financiamentos, alvará

3. **Dívida Ativa**
   - Consulta de débitos inscritos
   - Parcelamento
   - Renegociação
   - Prescrição (alertas importantes)

4. **Alvará de Funcionamento**
   - Solicitação
   - Renovação
   - Consulta de status
   - Documentação necessária

### Perfis de Cidadãos (Segmentação)

1. **Urgente/Desesperado** (18%)
   - Palavras-chave: "urgente", "preciso hoje", "emergência"
   - Tom: Ansioso, estressado
   - Contexto: Prazos, licitações, financiamentos
   - Ação: Priorizar atendimento

2. **Confuso/Perdido** (32%)
   - Palavras-chave: "não entendi", "como faz", "explica"
   - Tom: Inseguro, confuso
   - Contexto: Baixa familiaridade digital
   - Ação: Linguagem simples, tutoriais

3. **Revoltado/Contestador** (12%)
   - Palavras-chave: "absurdo", "injusto", "não concordo"
   - Tom: Irritado, confrontacional
   - Contexto: Valor do IPTU, multas inesperadas
   - Ação: Escalação humana, empatia

4. **Tranquilo/Informacional** (38%)
   - Palavras-chave: "gostaria", "por favor", "obrigado"
   - Tom: Neutro, educado
   - Contexto: Consulta simples
   - Ação: Bot resolve perfeitamente

---

## 🚨 SISTEMA DE ALERTAS

### Severidades

1. **CRITICAL** 🔴 - Ação imediata (< 1 hora)
   - Cidadão com 5+ tentativas frustradas
   - Mencionou "vou na ouvidoria"
   - Sentimento: extremamente negativo
   - Risco de perda de arrecadação alta

2. **URGENT** 🟠 - Ação em 24 horas
   - 3-4 tentativas sem sucesso
   - Dívida crescente sem contato
   - Sentimento muito negativo

3. **MONITOR** 🟡 - Acompanhamento (3-5 dias)
   - Frustração pontual
   - Primeira tentativa sem sucesso
   - Aguardando sistema

### Tipos de Alertas

- `frustration`: Cidadão frustrado com sistema
- `churn_risk`: Risco de inadimplência/abandono
- `system_error`: Erro técnico recorrente
- `high_abandonment`: Serviço com muitos abandonos
- `opportunity`: Oportunidade de cross-sell/upsell

---

## 📐 MÉTRICAS E CÁLCULOS

### KPIs Principais

1. **Taxa de Resolução**
   ```
   = (Conversas Resolvidas / Total Conversas) × 100
   Meta: ≥ 75%
   ```

2. **Satisfação (CSAT)**
   ```
   = (Sentimentos Positivos / Total) × 5
   Escala: 0-5
   Meta: ≥ 4.2
   ```

3. **Economia Operacional**
   ```
   = (Atendimentos Bot × Custo Diferença)
   Custo Presencial: R$ 12,50
   Custo Bot: R$ 0,35
   Diferença: R$ 12,15
   ```

4. **Taxa de Abandono por Etapa**
   ```
   = (Abandonos Etapa N / Chegaram Etapa N) × 100
   ```

### Análise de Funil

Para cada serviço, mapear:
1. Etapa 1: Inicia conversa
2. Etapa 2: Bot explica
3. Etapa 3: Cidadão solicita ação
4. Etapa 4: Sistema processa
5. Etapa 5: Conclusão

Identificar gargalos onde dropoff > 20%

---

## 🔒 REGRAS DE NEGÓCIO CRÍTICAS

### 1. LGPD e Anonimização

**SEMPRE anonimizar dados pessoais:**

```typescript
// ✅ CORRETO
const anonPhone = phone.replace(/\d(?=\d{4})/g, '*'); // ****-4321

// ❌ ERRADO
const fullPhone = conversation.phone; // Expõe dados
```

**Princípios:**
- Telefone: mostrar apenas últimos 4 dígitos
- CPF/CNPJ: mostrar apenas dígitos do meio
- Nome: NUNCA armazenar ou exibir
- Endereço completo: NUNCA armazenar
- Bairro: OK (dado não-identificável)

### 2. Precisão de Análise

**A IA DEVE retornar JSON válido sempre:**

```typescript
// Usar Zod para validação
const AnalysisSchema = z.object({
  primaryService: z.enum([...]),
  sentiment: z.enum([...]),
  // ... todos os campos obrigatórios
});

// Validar resposta da IA
const validated = AnalysisSchema.parse(rawResponse);
```

### 3. Performance

**Dashboards devem carregar em < 2 segundos:**

- Usar métricas pré-agregadas (ServiceMetrics)
- Evitar cálculos pesados no frontend
- Cachear queries complexas
- Paginar listas longas

### 4. Integridade de Dados

**Toda conversa DEVE ter análise:**

```typescript
// Verificar antes de exibir
const conversations = await prisma.conversation.findMany({
  where: { analysis: { isNot: null } }
});
```

---

## 🎨 CONVENÇÕES DE CÓDIGO

### TypeScript

```typescript
// ✅ Sempre tipar
interface MetricData {
  service: string;
  count: number;
  growth: number;
}

// ✅ Usar enums para valores fixos
enum Sentiment {
  POSITIVE = 'positivo',
  NEUTRAL = 'neutro',
  NEGATIVE = 'negativo',
  FRUSTRATED = 'frustrado'
}

// ✅ Funções puras quando possível
function calculateGrowth(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}
```

### Nomenclatura

```typescript
// Componentes: PascalCase
export function DashboardOverview() {}

// Hooks: camelCase com 'use'
function useServiceMetrics() {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = '/api';

// Funções utilitárias: camelCase
function formatCurrency(value: number) {}

// Tipos/Interfaces: PascalCase
interface ServiceMetric {}
type AlertSeverity = 'critical' | 'urgent' | 'monitor';
```

### Estrutura de Componentes

```typescript
// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/card';

// 2. Types
interface Props {
  data: MetricData[];
}

// 3. Component
export function MetricCard({ data }: Props) {
  // 3.1 Hooks
  const [selected, setSelected] = useState(null);
  
  // 3.2 Handlers
  const handleClick = () => {};
  
  // 3.3 Render
  return <Card>...</Card>;
}
```

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Prisma
npx prisma studio          # UI para ver DB
npx prisma migrate dev     # Criar migration
npx prisma generate        # Gerar client
npx prisma db push         # Push schema (dev)
```

### Scripts de Processamento

```bash
# 1. Importar conversas
npx tsx scripts/1-import-conversations.ts

# 2. Analisar com IA
npx tsx scripts/2-analyze-with-ai.ts

# 3. Agregar métricas
npx tsx scripts/3-aggregate-metrics.ts

# Rodar tudo em sequência
npm run process-all
```

## 📚 REFERÊNCIAS

### Documentação Oficial

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com
- Gemini: https://ai.google.dev/
- Recharts: https://recharts.org

### Contexto do Projeto

- Vitória da Conquista: 3ª maior cidade da Bahia
- População: ~340 mil habitantes
- SEFIN: Secretaria de Finanças municipal
- BNB: Banco do Nordeste do Brasil (cliente potencial)

---

## ⚠️ IMPORTANTE: O QUE NÃO FAZER

❌ **NUNCA expor dados pessoais** (nome, CPF completo, telefone completo)
❌ **NUNCA fazer queries sem WHERE** em tabelas grandes
❌ **NUNCA commitar .env** ou chaves de API
❌ **NUNCA pular validação de dados da IA** (sempre usar Zod)
❌ **NUNCA fazer loop de requests à API** sem rate limiting
❌ **NUNCA assumir que a IA retornou JSON válido** (sempre try/catch)

---

## 🎯 CRITÉRIOS DE SUCESSO DO MVP

### Funcional
- ✅ Importar e processar 1000+ conversas
- ✅ 4 dashboards funcionais
- ✅ Análise de IA com 90%+ de precisão
- ✅ Alertas automáticos gerados
- ✅ Performance < 2s de carregamento

### Demonstração
- ✅ Dados reais (não mockados)
- ✅ UI profissional (shadcn/ui)
- ✅ Insights acionáveis visíveis
- ✅ ROI calculado automaticamente
- ✅ Comparação antes/depois (métricas)

### Técnico
- ✅ TypeScript sem erros
- ✅ Código limpo e organizado
- ✅ Sem hardcoding (usar constantes)
- ✅ Tratamento de erros robusto
- ✅ LGPD compliance

---

**Última atualização**: 2024-10-13
**Versão**: 1.0.0 (MVP)
**Desenvolvedor**: [Seu Nome]
**Prazo**: 2 dias (DIA 1-2)