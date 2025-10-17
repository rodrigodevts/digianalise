# 🚀 Deploy Analytics IA - Guia Completo

## 📋 Pré-requisitos para Deploy

### 1. **Variáveis de Ambiente (Vercel)**
Configure as seguintes variáveis no painel da Vercel:

```bash
# Database (PostgreSQL para produção)
DATABASE_URL="postgresql://user:password@host:5432/database"

# AI API
GEMINI_API_KEY="sua_api_key_real"
GEMINI_MODEL="gemini-2.0-flash-lite"

# Application
NODE_ENV="production"

# Performance
BATCH_SIZE=200
MAX_RETRIES=5
RATE_LIMIT_DELAY=500
LOG_LEVEL="error"

# Security (Opcional)
NEXTAUTH_SECRET="gere_uma_chave_secreta_de_32_chars"
NEXTAUTH_URL="https://seu-dominio.vercel.app"

# Monitoring (Opcional)
SENTRY_DSN="https://seu-sentry-dsn"
```

### 2. **Banco de Dados PostgreSQL**
- **Sugestão**: Use [Neon](https://neon.tech) (gratuito)
- **Alternative**: [Supabase](https://supabase.com) 
- **Enterprise**: PostgreSQL próprio

### 3. **Comandos de Deploy**

```bash
# 1. Instalar dependências
pnpm install

# 2. Gerar Prisma Client
pnpm prisma:generate

# 3. Executar migrações (apenas primeira vez)
pnpm prisma:push

# 4. Build para produção
pnpm build

# 5. Iniciar aplicação
pnpm start
```

## ⚙️ Configuração da Vercel

### **vercel.json** (Opcional)
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🗂️ Estrutura de Arquivos Ignorados

### **Deploy NÃO inclui**:
- `scripts/` - Scripts de processamento
- `data/` - Dados locais 
- `.env.production` - Configurações sensíveis
- `README.md`, `TODO.md` - Documentação

## 🔧 Comandos de Manutenção

### **Reset Database** (produção):
```bash
pnpm prisma:push --force-reset
```

### **Verificar Status**:
```bash
pnpm prisma:studio
```

### **Logs da Aplicação**:
```bash
vercel logs [deployment-url]
```

## 🚨 Troubleshooting

### **Erro: "Erro interno do servidor"**
1. **Verificar health check**: `GET /api/health`
2. **Inicializar banco**: `GET /api/init` 
3. **Verificar logs**: `vercel logs [deployment-url]`

### **Erro: PrismaClient not found**
- Certifique-se que `postinstall` está configurado
- Execute `pnpm prisma:generate` manualmente

### **Erro: Database connection**
- Verifique DATABASE_URL na Vercel
- Teste conexão com banco PostgreSQL
- Confirme que IP da Vercel está liberado
- **Para PostgreSQL**: Use `/api/init` para criar tabelas

### **Erro: Build timeout**
- Aumente timeout das funções na Vercel
- Otimize queries do Prisma
- Verifique memória disponível

### **Primeiro Deploy - Passos Obrigatórios**
```bash
# 1. Após deploy, inicializar banco:
curl https://seu-app.vercel.app/api/init

# 2. Verificar saúde:
curl https://seu-app.vercel.app/api/health

# 3. Testar APIs:
curl https://seu-app.vercel.app/api/metrics
```

## 📊 Monitoramento

### **Métricas Importantes**:
- Tempo de resposta das APIs
- Uso de memória
- Conexões com banco
- Rate limit das APIs (Gemini)

### **Logs Essenciais**:
- Erros de conexão com banco
- Falhas na API do Gemini
- Timeouts de requests

## 🔒 Segurança

### **Checklist**:
- ✅ API Keys em variáveis de ambiente
- ✅ DATABASE_URL segura
- ✅ CORS configurado
- ✅ Rate limiting habilitado
- ✅ Logs não expõem credenciais

## 📈 Performance

### **Otimizações**:
- Prisma connection pooling
- Cache de queries frequentes
- Compressão de assets
- CDN para imagens estáticas

---

## 🎯 Deploy Rápido

```bash
# 1. Fork o repositório
# 2. Conecte à Vercel
# 3. Configure variáveis de ambiente
# 4. Deploy automático! 🚀
```

**URL sugerida**: `https://analytics-ia.vercel.app`