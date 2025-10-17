# 📊 Dados Fictícios Gerados - Analytics IA

## ✅ Resumo da Geração

**Status**: ✅ Concluído com sucesso!

### Estatísticas Gerais:
- **Total de Conversas**: 500
- **Tamanho do Arquivo**: 15.10 MB
- **Média de Mensagens/Conversa**: 16 mensagens
- **Pessoas Únicas**: 453 cidadãos diferentes
- **Telefones Únicos**: 500 números brasileiros fictícios
- **Período**: Últimos 60 dias (distribuição aleatória)
- **Range de Tickets**: #90000 até #90499

---

## 🔄 Distribuição por Serviço

Os serviços alternam automaticamente a cada 10 conversas:

### Padrão de Alternância (500 conversas):

| Conversas | Serviço | Detalhes |
|-----------|---------|----------|
| 1-10 | **IPTU** | Boletos, parcelamento, isenções |
| 11-20 | **Certidão Negativa** | Solicitações, prazos, validação |
| 21-30 | **Dívida Ativa** | Consultas, negociação, parcelamento |
| 31-40 | **Alvará** | Funcionamento, renovação, documentos |
| 41-50 | **Parcelamento** | Simulações, condições, juros |
| 51-60 | **IPTU** | (repete o ciclo) |
| ... | ... | ... |
| 491-500 | **IPTU** | Última rodada |

**Total por Serviço**:
- IPTU: ~100 conversas (20%)
- Certidão Negativa: ~100 conversas (20%)
- Dívida Ativa: ~100 conversas (20%)
- Alvará: ~100 conversas (20%)
- Parcelamento: ~100 conversas (20%)

---

## 👥 Dados de Cidadãos Fictícios

### Nomes Brasileiros Realistas
- 50 primeiros nomes diferentes (Ana, João, Maria, Pedro, etc.)
- 40 sobrenomes comuns (Silva, Santos, Oliveira, etc.)
- **Combinações únicas**: 453 nomes diferentes gerados

### Telefones
- **Formato**: 55 + DDD (2 dígitos) + Número (9 dígitos)
- **DDDs Utilizados**: 11, 21, 31, 41, 51, 61, 71, 81, 85, 91
- **Exemplo**: 5561910131540 (61 = Brasília)
- Todos os números são únicos e fictícios

---

## 💬 Tipos de Conversas

### 1. IPTU (Imposto Predial)
**Temas Abordados**:
- Segunda via de boleto
- Parcelamento (até 10x)
- Desconto para pagamento à vista (10%)
- Isenção para idosos
- Pagamento via PIX
- Consulta de valores
- Negociação de dívidas

**Exemplos de Mensagens**:
- Usuário: "Preciso de uma segunda via do IPTU"
- Bot: "Para emitir a segunda via do IPTU, você precisa informar o número da inscrição municipal..."

### 2. Certidão Negativa
**Temas Abordados**:
- Solicitação de certidão
- Prazo de emissão (24 horas)
- Validade (90 dias)
- Certidão PF e PJ
- Download por email
- Verificação de débitos

**Exemplos de Mensagens**:
- Usuário: "Preciso de uma certidão negativa urgente"
- Bot: "A certidão negativa é emitida em até 24 horas após a solicitação."

### 3. Dívida Ativa
**Temas Abordados**:
- Consulta de débitos
- Negociação e parcelamento (até 24x)
- Prescrição de dívidas (5 anos)
- Desconto à vista (20%)
- Protesto em cartório
- Certidão positiva com efeito de negativa

**Exemplos de Mensagens**:
- Usuário: "Quero negociar minha dívida ativa"
- Bot: "Você pode parcelar em até 24 vezes com entrada de 10%."

### 4. Alvará de Funcionamento
**Temas Abordados**:
- Solicitação de alvará
- Renovação anual
- Custos (R$ 150 a R$ 800)
- Documentação necessária
- Alvará provisório (180 dias)
- Vistoria e prazos
- Alvará sanitário

**Exemplos de Mensagens**:
- Usuário: "Como solicito alvará de funcionamento?"
- Bot: "Para solicitar o alvará, você precisa apresentar: contrato social, CNPJ..."

### 5. Parcelamento
**Temas Abordados**:
- Parcelamento em até 12x
- Valor mínimo de parcela (R$ 50)
- Juros (1% ao mês)
- Simulação de parcelas
- Renegociação
- Antecipação de parcelas

**Exemplos de Mensagens**:
- Usuário: "Posso parcelar impostos atrasados?"
- Bot: "Sim, você pode parcelar impostos atrasados em até 12 vezes."

---

## 📈 Variações nas Conversas

### Sentimentos
As conversas incluem diferentes sentimentos:
- **Positivas** (~40%): Agradecimentos, satisfação
- **Neutras** (~35%): Interações padrão
- **Negativas** (~15%): Insatisfação leve
- **Frustradas** (~10%): Alta frustração, desistência

### Resoluções
- **Resolvidas** (~75%): Problema solucionado
- **Não Resolvidas** (~25%): Abandono ou frustração

### Duração
- **Curtas** (3-5 interações): Consultas simples
- **Médias** (5-7 interações): Processos padrão
- **Longas** (7-10 interações): Casos complexos

---

## 🗓️ Período Temporal

- **Distribuição**: Últimos 60 dias
- **Data Mais Antiga**: ~18/08/2025
- **Data Mais Recente**: ~16/10/2025
- **Padrão**: Conversas distribuídas aleatoriamente ao longo do período

---

## 🔧 Estrutura Técnica

### Campos por Mensagem:
- **IDs**: UUID v4 para todas as entidades
- **Timestamps**: Milissegundos Unix
- **Contact**: Dados completos do cidadão
- **Raw**: Payload original do WhatsApp (simulado)
- **Status**: received/sended
- **ACK**: 0 (recebida) ou 3 (entregue/lida)
- **sendType**: null (usuário) ou "bot" (sistema)

### Conformidade LGPD:
- ✅ Todos os dados são fictícios
- ✅ Nenhum dado real de cidadãos
- ✅ Telefones e nomes gerados aleatoriamente
- ✅ Sem informações sensíveis reais

---

## 📁 Arquivos Gerados

### Localização:
```
/data/messages.json
```

### Como Usar:
1. O arquivo já está pronto para importação
2. Execute o script de importação:
   ```bash
   npm run import:conversations
   ```
3. Execute a análise com IA:
   ```bash
   npm run analyze:ai
   ```
4. Agregue as métricas:
   ```bash
   npm run aggregate:metrics
   ```

Ou execute tudo de uma vez:
```bash
npm run process:all
```

---

## 🎯 Objetivo dos Dados

Estes dados fictícios foram criados para:

✅ **Demonstrações**: Apresentar a plataforma sem expor dados reais
✅ **Desenvolvimento**: Testar funcionalidades com volume realista
✅ **Treinamento**: Treinar equipes com cenários variados
✅ **Pitches**: Apresentar para clientes potenciais
✅ **Testes**: Validar performance e análise de IA

---

## ⚠️ Importante

- Todos os dados são **100% fictícios**
- Nenhuma informação real de prefeituras
- Nomes e telefones gerados aleatoriamente
- Não utilizar em produção com dados reais
- Arquivo gerado automaticamente pelo script `generate-fake-data.js`

---

## 🔄 Regenerar Dados

Se precisar regenerar os dados:

```bash
node scripts/generate-fake-data.js
```

O script irá:
1. Gerar 500 novas conversas
2. Criar novos nomes e telefones fictícios
3. Distribuir aleatoriamente nos últimos 60 dias
4. Alternar serviços a cada 10 conversas
5. Sobrescrever o arquivo `data/messages.json`

---

**Gerado em**: 16 de outubro de 2025
**Versão**: 1.0.0
**Plataforma**: Analytics IA
