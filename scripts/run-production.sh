#!/bin/bash

echo "🚀 Executando scripts em PRODUÇÃO"
echo "⚠️  Isso vai afetar o banco MongoDB Atlas!"
read -p "Continuar? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 Executando scripts..."
    
    # Usar .env.production.local
    export NODE_ENV=production
    
    echo "1️⃣ Importando conversas..."
    npx tsx scripts/1-import-conversations.ts
    
    echo "2️⃣ Analisando com IA..."
    npx tsx scripts/2-analyze-with-ai.ts
    
    echo "3️⃣ Agregando métricas..."
    npx tsx scripts/3-aggregate-metrics.ts
    
    echo "✅ Scripts executados!"
else
    echo "❌ Cancelado"
fi