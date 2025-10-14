# Dashboard PMVC - Sistema de Análise de Conversas SEFIN

Sistema de análise inteligente de conversas para a Secretaria de Finanças de Vitória da Conquista - BA.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- SQLite

### Instalação

1. Clone o repositório
```bash
git clone [repository-url]
cd dashboard-pmvc
```

2. Instale as dependências
```bash
npm install
```

3. Configure o ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. Configure o banco de dados
```bash
npx prisma generate
npx prisma db push
```

5. Execute o projeto
```bash
npm run dev
```

Acesse http://localhost:3000

## 📊 Processamento de Dados

### Importar e processar conversas

1. Coloque os arquivos JSON de conversas na pasta `data/`

2. Execute os scripts em sequência:
```bash
# Importar conversas do JSON
npm run import:conversations

# Analisar com IA
npm run analyze:ai

# Agregar métricas
npm run aggregate:metrics

# Ou execute tudo de uma vez
npm run process:all
```

## 📁 Estrutura do Projeto

```
dashboard-pmvc/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API Routes
│   │   └── dashboard/   # Páginas do dashboard
│   ├── components/      # Componentes React
│   │   ├── ui/         # shadcn/ui components
│   │   ├── charts/     # Componentes de gráficos
│   │   └── layout/     # Layout components
│   ├── lib/            # Utilitários e bibliotecas
│   │   ├── db/        # Configuração Prisma
│   │   ├── utils/     # Funções utilitárias
│   │   └── ai/        # Integração com Gemini
│   ├── scripts/        # Scripts de processamento
│   └── types/          # TypeScript types
├── prisma/
│   └── schema.prisma   # Schema do banco de dados
├── data/               # Arquivos JSON de entrada
└── public/            # Assets estáticos
```

## 🛠 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa linter |
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run prisma:studio` | Abre Prisma Studio |
| `npm run import:conversations` | Importa conversas do JSON |
| `npm run analyze:ai` | Analisa conversas com IA |
| `npm run aggregate:metrics` | Agrega métricas |

## 🔑 Variáveis de Ambiente

```env
# Database
DATABASE_URL="file:./dev.db"

# Gemini AI API
GEMINI_API_KEY="your-api-key"
GEMINI_MODEL="gemini-2.0-flash-exp"

# Application
NODE_ENV="development"
```

## 📈 Funcionalidades

- **Dashboard Overview**: Métricas gerais e KPIs
- **Análise por Serviço**: Detalhamento por tipo de serviço (IPTU, Certidões, etc.)
- **Alertas Inteligentes**: Detecção automática de problemas e oportunidades
- **Análise de Sentimento**: Classificação do humor e perfil dos cidadãos
- **Funil de Conversão**: Visualização do fluxo de atendimento
- **ROI Calculado**: Economia operacional automaticamente calculada

## 🔒 Segurança e LGPD

- Dados pessoais são anonimizados automaticamente
- Telefones mostram apenas últimos 4 dígitos
- Não armazena nomes ou CPFs completos
- Conformidade com LGPD

## 📚 Tecnologias

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: SQLite + Prisma ORM
- **Charts**: Recharts
- **AI**: Google Gemini 2.0 Flash
- **Deploy**: Vercel-ready

## 🤝 Contribuindo

Para mais detalhes sobre a arquitetura e regras de negócio, consulte o arquivo `claude.md`.

## 📝 Licença

Propriedade de SEFIN Vitória da Conquista / BNB