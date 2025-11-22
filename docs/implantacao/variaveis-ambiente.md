---
title: "Variáveis de Ambiente"
sidebar_position: 2
description: "Guia completo de configuração de variáveis de ambiente para todos os ambientes"
---

# Variáveis de Ambiente

## Visão Geral

O Cidadão.AI utiliza variáveis de ambiente para configuração em diferentes ambientes (development, staging, production). Este documento detalha todas as variáveis disponíveis e suas configurações recomendadas.

## Estrutura de Configuração

### Arquivos de Ambiente

```
cidadao.ai-backend/
├── .env                    # Local development (criar a partir de .env.example)
├── .env.example            # Template com todas as variáveis
├── .env.test               # Test environment (opcional)
└── .env.production         # Production (Railway Variables, nunca commitar)
```

### Precedência de Variáveis

```mermaid
graph LR
    A[Railway Variables] --> B[.env file]
    B --> C[Default values]
    C --> D[Application]

    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
```

**Ordem de precedência** (maior para menor):
1. **Railway Variables** (produção)
2. **Arquivo .env** (development)
3. **Valores default** (código)

## Variáveis Obrigatórias

### 🔐 Segurança & Autenticação

```bash
# JWT Configuration (OBRIGATÓRIO)
JWT_SECRET_KEY=<64-char-secure-token>
SECRET_KEY=<64-char-secure-token>
API_SECRET_KEY=<64-char-secure-token>

# Como gerar:
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
# ou usar:
python scripts/generate_secrets.py
```

:::danger Segurança Crítica
**NUNCA** use valores de exemplo em produção. **NUNCA** commite secrets no Git. Use valores diferentes para cada ambiente.
:::

**Configuração de Tokens**:
```bash
# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30        # JWT access token (30min)
REFRESH_TOKEN_EXPIRE_DAYS=7          # JWT refresh token (7 dias)
```

### 🤖 LLM Provider (Obrigatório)

**Opção 1: Maritaca AI (Recomendado para PT-BR)**

```bash
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<sua-api-key>
MARITACA_MODEL=sabia-3.1              # Recomendado (latest, best quality)
# ou
MARITACA_MODEL=sabiazinho-3           # Alternativa (faster, good throughput)
```

**Opção 2: Anthropic Claude (Backup)**

```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=<sua-api-key>
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**Comparação de Providers**:

| Provider | Vantagens | Desvantagens | Uso Recomendado |
|----------|-----------|--------------|-----------------|
| **Maritaca** | Otimizado para PT-BR, contexto brasileiro, baixa latência | Menor adoção global | **Produção Brasil** ✅ |
| **Anthropic** | Excelente qualidade, documentação completa | Mais caro, menos PT-BR | Backup / Internacional |

:::tip Auto-Fallback
O sistema automaticamente usa Anthropic se Maritaca falhar. Configure ambas as API keys para máxima confiabilidade.
:::

### 🌐 Environment & Server

```bash
# Environment
APP_ENV=development                   # development, staging, production
ENVIRONMENT=development               # Alias para APP_ENV
DEBUG=true                            # false em produção

# Server
HOST=0.0.0.0                          # Bind all interfaces
PORT=8000                             # Railway injeta automaticamente em produção
```

## Variáveis Opcionais

### 📊 Database Configuration

**PostgreSQL (Produção)**:
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/cidadao_ai

# Componentes separados (opcional)
POSTGRES_USER=cidadao_ai
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=cidadao_ai
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

**Supabase (Recomendado)**:
```bash
# Get from: Supabase Dashboard > Settings > API
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>    # Backend (bypasses RLS)
SUPABASE_ANON_KEY=<anon-key>                     # Frontend only
```

**Redis (Cache & Queue)**:
```bash
REDIS_URL=redis://localhost:6379/0
# ou Railway auto-provisiona:
REDIS_URL=redis://default:password@containers-us-west-XX.railway.app:6379
```

:::info Default Behavior
Se `DATABASE_URL` não estiver configurado, o sistema usa **SQLite em memória** (desenvolvimento apenas). Para produção, PostgreSQL é **obrigatório**.
:::

### 🔑 Government APIs

**Portal da Transparência**:
```bash
TRANSPARENCY_API_KEY=<sua-api-key>

# Nota: 78% dos endpoints retornam 403 Forbidden (limitação conhecida)
# Sistema usa 30+ APIs alternativas como fallback
```

**Dados.gov.br**:
```bash
DADOS_GOV_API_KEY=<sua-api-key>       # Opcional (maioria dos endpoints públicos)
```

**Outras APIs Federais** (públicas, sem autenticação):
- IBGE: Sem autenticação necessária
- DataSUS: Sem autenticação necessária
- INEP: Sem autenticação necessária
- PNCP: Sem autenticação necessária

### 🌐 CORS Configuration

```bash
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://cidadao-ai-frontend.vercel.app

# Production example:
ALLOWED_ORIGINS=https://cidadao.ai,https://*.vercel.app,https://cidadao-ai-frontend.vercel.app
```

:::warning CORS em Produção
**SEMPRE** configure `ALLOWED_ORIGINS` com os domínios exatos do frontend. Usar `*` em produção é **inseguro**.
:::

### 📈 Monitoring & Observability

**Prometheus Metrics**:
```bash
ENABLE_METRICS=true                   # Habilita /metrics endpoint
METRICS_PORT=9090                     # Porta para Prometheus scraping
```

**Grafana Cloud Integration**:
```bash
# Production monitoring (opcional)
GRAFANA_CLOUD_ENABLED=true
GRAFANA_CLOUD_URL=https://prometheus-prod-XX-prod-sa-east-1.grafana.net/api/prom/push
GRAFANA_CLOUD_USER=<6-digit-instance-id>
GRAFANA_CLOUD_KEY=glc_<your-api-key>

# Push settings
METRICS_PUSH_INTERVAL=60              # Segundos entre pushes (default: 60)
METRICS_PUSH_TIMEOUT=10               # Timeout para push (default: 10)
```

**Logging**:
```bash
LOG_LEVEL=INFO                        # DEBUG, INFO, WARNING, ERROR
STRUCTURED_LOGGING=true               # JSON format (recomendado para produção)
```

### 🔧 Background Tasks (Celery)

```bash
ENABLE_BACKGROUND_TASKS=true
CELERY_BROKER_URL=redis://localhost:6379/1

# Worker settings (via Procfile)
# worker: celery -A src.infrastructure.queue.celery_app worker --concurrency=4
```

**Queues**:
- `critical` - Alta prioridade (processamento imediato)
- `high` - Média-alta prioridade
- `default` - Prioridade normal
- `low` - Baixa prioridade
- `background` - Tarefas não-urgentes

### 📧 Email Configuration (Opcional)

```bash
# SMTP para notificações
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-specific-password>
```

### ☁️ File Storage (Opcional)

```bash
# Storage type
STORAGE_TYPE=local                    # local, s3, gcs

# S3 Configuration
S3_BUCKET=cidadao-ai-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# Google Cloud Storage
GCS_BUCKET=cidadao-ai-uploads
GCS_PROJECT_ID=<project-id>
GCS_CREDENTIALS_PATH=/path/to/credentials.json
```

## Configuração por Ambiente

### Development

**Arquivo**: `.env`

```bash
# Security (gerar localmente)
JWT_SECRET_KEY=dev-jwt-secret-change-this
SECRET_KEY=dev-general-secret-change-this

# LLM
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<sua-dev-key>
MARITACA_MODEL=sabiazinho-3           # Faster for development

# Database (local)
DATABASE_URL=postgresql+asyncpg://cidadao:dev123@localhost:5432/cidadao_dev

# Redis (local)
REDIS_URL=redis://localhost:6379/0

# Server
APP_ENV=development
DEBUG=true
PORT=8000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=DEBUG
```

### Staging

**Arquivo**: Railway Variables (staging environment)

```bash
# Security (secrets únicos)
JWT_SECRET_KEY=<staging-jwt-secret>
SECRET_KEY=<staging-general-secret>

# LLM
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<staging-api-key>
MARITACA_MODEL=sabia-3.1

# Database (Supabase staging project)
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<staging-service-key>

# Redis (Railway auto-provisioned)
REDIS_URL=redis://default:password@staging-redis.railway.app:6379

# Server
APP_ENV=staging
ENVIRONMENT=staging
DEBUG=false
PORT=$PORT                            # Railway injeta automaticamente

# CORS
ALLOWED_ORIGINS=https://staging.cidadao.ai,https://cidadao-ai-staging.vercel.app

# Monitoring
ENABLE_METRICS=true
GRAFANA_CLOUD_ENABLED=true
LOG_LEVEL=INFO
```

### Production

**Arquivo**: Railway Variables (production environment)

```bash
# Security (secrets únicos, rotação periódica)
JWT_SECRET_KEY=<production-jwt-secret-64-chars>
SECRET_KEY=<production-general-secret-64-chars>
API_SECRET_KEY=<production-api-secret-64-chars>

# LLM (configurar ambos para auto-fallback)
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<production-maritaca-key>
MARITACA_MODEL=sabia-3.1
ANTHROPIC_API_KEY=<production-claude-key>
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Database (Supabase production)
SUPABASE_URL=https://production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<production-service-key>

# Redis (Railway auto-provisioned)
REDIS_URL=redis://default:password@production-redis.railway.app:6379

# Government APIs
TRANSPARENCY_API_KEY=<production-transparency-key>

# Server
APP_ENV=production
ENVIRONMENT=production
DEBUG=false
PORT=$PORT                            # Railway injeta automaticamente

# CORS (domínios específicos)
ALLOWED_ORIGINS=https://cidadao.ai,https://www.cidadao.ai,https://cidadao-ai-frontend.vercel.app

# Token expiration (segurança aumentada)
ACCESS_TOKEN_EXPIRE_MINUTES=15        # Menor em produção
REFRESH_TOKEN_EXPIRE_DAYS=7

# Monitoring (completo)
ENABLE_METRICS=true
GRAFANA_CLOUD_ENABLED=true
GRAFANA_CLOUD_URL=https://prometheus-prod-XX.grafana.net/api/prom/push
GRAFANA_CLOUD_USER=<production-instance-id>
GRAFANA_CLOUD_KEY=<production-api-key>
METRICS_PUSH_INTERVAL=60
LOG_LEVEL=INFO
STRUCTURED_LOGGING=true

# Background tasks
ENABLE_BACKGROUND_TASKS=true
CELERY_BROKER_URL=${REDIS_URL}/1      # Usa mesmo Redis, DB diferente
```

## Gerenciamento de Secrets

### ❌ Práticas Ruins

```bash
# NUNCA faça isso:
git add .env                          # Commitar secrets
JWT_SECRET_KEY=123456                 # Secrets fracos
ALLOWED_ORIGINS=*                     # CORS aberto em produção
DEBUG=true                            # Debug em produção
```

### ✅ Práticas Recomendadas

**1. Geração Segura de Secrets**:
```bash
# Via Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Via OpenSSL
openssl rand -base64 64

# Via script do projeto
python scripts/generate_secrets.py
```

**2. Armazenamento**:
```bash
# Local: .env (no .gitignore)
echo ".env" >> .gitignore

# Production: Railway Variables (criptografadas)
railway variables set JWT_SECRET_KEY=<value>

# Team sharing: Password manager (1Password, Bitwarden)
```

**3. Rotação de Secrets**:
```bash
# A cada 90 dias em produção:
1. Gerar novo secret
2. Adicionar ao Railway Variables
3. Deploy com novo secret
4. Remover secret antigo após validação
```

## Validação de Configuração

### Script de Validação

```bash
# Verificar configuração
python scripts/validate_env.py

# Output esperado:
✅ JWT_SECRET_KEY configured
✅ SECRET_KEY configured
✅ LLM_PROVIDER configured (maritaca)
✅ MARITACA_API_KEY configured
✅ DATABASE_URL configured
⚠️  REDIS_URL not configured (using in-memory cache)
✅ CORS configured with 2 origins
```

### Checklist de Deploy

**Development**:
- [ ] `.env` criado a partir de `.env.example`
- [ ] Secrets gerados localmente
- [ ] DATABASE_URL configurado (PostgreSQL local ou Supabase)
- [ ] MARITACA_API_KEY configurado
- [ ] CORS inclui `http://localhost:3000`

**Staging**:
- [ ] Railway Variables configuradas
- [ ] Secrets únicos (diferentes de dev)
- [ ] Supabase staging project configurado
- [ ] Redis auto-provisionado
- [ ] CORS inclui domínio staging

**Production**:
- [ ] Railway Variables configuradas
- [ ] Secrets fortes (64 caracteres)
- [ ] Ambos LLM providers configurados (Maritaca + Anthropic)
- [ ] Supabase production project configurado
- [ ] CORS com domínios específicos (sem `*`)
- [ ] DEBUG=false
- [ ] Grafana Cloud configurado
- [ ] Alertas configurados

## Troubleshooting

### Problema 1: Secrets Inválidos

**Sintoma**:
```log
ValidationError: Field required: JWT_SECRET_KEY
```

**Solução**:
```bash
# Verificar se variável existe
echo $JWT_SECRET_KEY

# Gerar novo secret
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Adicionar ao .env ou Railway
railway variables set JWT_SECRET_KEY=<novo-valor>
```

### Problema 2: Database Connection Failed

**Sintoma**:
```log
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solução**:
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão manualmente
psql $DATABASE_URL

# Ou usar SQLite temporário (development)
unset DATABASE_URL  # Sistema usa SQLite em memória
```

### Problema 3: LLM Provider Error

**Sintoma**:
```log
LLMProviderError: MARITACA_API_KEY is required when LLM_PROVIDER=maritaca
```

**Solução**:
```bash
# Verificar provider e key
echo $LLM_PROVIDER
echo $MARITACA_API_KEY

# Testar API key
curl -H "Authorization: Bearer $MARITACA_API_KEY" \
     https://chat.maritaca.ai/api/chat/completions

# Ou usar provider alternativo
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=<sua-key>
```

### Problema 4: CORS Error

**Sintoma** (frontend):
```log
Access to fetch at 'https://api.cidadao.ai' from origin 'https://app.cidadao.ai'
has been blocked by CORS policy
```

**Solução**:
```bash
# Adicionar origin ao ALLOWED_ORIGINS
railway variables set ALLOWED_ORIGINS="https://app.cidadao.ai,https://www.cidadao.ai"

# Verificar middleware CORS em src/api/app.py
```

## Referências

### Documentação Relacionada
- [Railway Deployment](./railway.md) - Como configurar no Railway
- [Docker Configuration](./docker.md) - Configuração Docker
- [Security Best Practices](../architecture/security.md) - Segurança

### Recursos Externos
- [Pydantic Settings](https://docs.pydantic.dev/latest/usage/settings/) - Validação de configuração
- [Railway Variables](https://docs.railway.app/develop/variables) - Como configurar no Railway
- [12-Factor App Config](https://12factor.net/config) - Best practices

---

## Resumo - Quick Reference

### Variáveis Críticas (Obrigatórias)

```bash
# Security
JWT_SECRET_KEY=<64-char-token>
SECRET_KEY=<64-char-token>

# LLM
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<key>

# Environment
APP_ENV=production
DEBUG=false
```

### Variáveis Recomendadas (Production)

```bash
# Database
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>

# Cache
REDIS_URL=<redis-url>

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Monitoring
ENABLE_METRICS=true
GRAFANA_CLOUD_ENABLED=true
```

### Comandos Úteis

```bash
# Gerar secrets
python scripts/generate_secrets.py

# Validar configuração
python scripts/validate_env.py

# Railway: Set variable
railway variables set KEY=value

# Railway: List variables
railway variables

# Railway: Delete variable
railway variables delete KEY
```

---

**🇧🇷 Made with ❤️ in Minas Gerais, Brasil**

**Última Atualização**: 2025-11-22
**Autor**: Anderson Henrique da Silva
**Projeto**: Cidadão.AI - Transparência Governamental via IA
