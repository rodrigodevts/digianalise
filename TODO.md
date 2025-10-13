  	 ☐ Instalar dependências e configurar ambiente                        
     ☐ Configurar banco de dados SQLite com Prisma
     ☐ Criar script de importação de conversas (1-import-conversations.ts)
     ☐ Criar script de análise com IA (2-analyze-with-ai.ts)
     ☐ Criar script de agregação de métricas (3-aggregate-metrics.ts)
     ☐ Instalar componentes shadcn/ui necessários
     ☐ Criar API Routes para dados
     ☐ Implementar Dashboard Overview
     ☐ Implementar Dashboard de Serviços
     ☐ Implementar Dashboard de Alertas
     ☐ Implementar Dashboard de Funil
     ☐ Testar importação com dados reais

📋 Passo a Passo Sugerido para o MVP

  Fase 1: Setup Inicial (30 min)

  1. Instalar dependências
  pnpm install
  2. Configurar ambiente
  cp .env.example .env.local
  # Editar .env.local com a chave da API Gemini
  3. Configurar banco de dados
  pnpm prisma generate
  pnpm prisma db push

  Fase 2: Scripts de Processamento (2-3 horas)

  4. Criar script de importação (scripts/1-import-conversations.ts)
    - Ler JSONs da pasta data/
    - Agrupar mensagens por ticketId
    - Anonimizar telefones (LGPD)
    - Salvar no banco
  5. Criar script de análise IA (scripts/2-analyze-with-ai.ts)
    - Integrar com Gemini API
    - Analisar cada conversa
    - Extrair métricas e sentimentos
    - Salvar análises
  6. Criar script de agregação (scripts/3-aggregate-metrics.ts)
    - Calcular métricas por serviço
    - Gerar alertas automáticos
    - Pré-calcular KPIs

  Fase 3: Interface e APIs (3-4 horas)

  7. Instalar componentes UI
  pnpm dlx shadcn@latest add card button badge alert table tabs
  8. Criar API Routes
    - /api/metrics - Métricas agregadas
    - /api/alerts - Alertas ativos
    - /api/conversations - Conversas com filtros
    - /api/services - Dados por serviço
  9. Implementar Dashboards
    - Overview com KPIs principais
    - Análise por serviço (IPTU, Certidões, etc)
    - Sistema de alertas
    - Funil de conversão

  Fase 4: Testes e Ajustes (1 hora)

  10. Testar com dados reais
    - Colocar JSONs em data/
    - Rodar pnpm process:all
    - Verificar dashboards

  Ordem de Execução Recomendada:

  1. Começar pelo backend - Scripts de processamento primeiro
  2. Testar com dados pequenos - 10-20 conversas para validar
  3. Depois construir frontend - Com dados reais no banco
  4. Iterar rapidamente - MVP funcional > perfeição

  Tempo estimado total: 6-8 horas para MVP completo
