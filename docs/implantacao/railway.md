---
title: "Railway Deployment"
sidebar_position: 1
description: "Guia completo de deployment do Cidadão.AI no Railway com 99.9% de uptime"
---

# Railway Deployment

## Visão Geral

O Cidadão.AI está em produção no **Railway** desde **7 de outubro de 2025**, alcançando **99.9% de uptime** com 3 serviços independentes.

### Status de Produção

- **URL**: https://cidadao-api-production.up.railway.app
- **Docs**: https://cidadao-api-production.up.railway.app/docs
- **Uptime**: 99.9% desde outubro/2025
- **Serviços**: 3 (web, worker, beat)
- **Performance**: p50 80ms, p95 145ms

## Arquitetura de Deploy

### 3 Serviços Railway

O sistema utiliza múltiplos serviços para separação de responsabilidades:

```mermaid
graph TB
    Client[Client/Frontend] --> LB[Railway Load Balancer]
    LB --> Web[Web Service<br/>Port $PORT]
    Web --> DB[(PostgreSQL<br/>Supabase)]
    Web --> Cache[(Redis<br/>Railway)]
    Web --> Queue[Celery Queue<br/>Redis]

    Worker[Worker Service<br/>4 concurrent workers] --> Queue
    Worker --> DB
    Worker --> Cache

    Beat[Beat Service<br/>Scheduler 24/7] --> Queue
    Beat --> DB

    style Web fill:#4CAF50
    style Worker fill:#2196F3
    style Beat fill:#FF9800
```

### Procfile - Configuração dos Serviços

**Location**: `cidadao.ai-backend/Procfile`

```procfile
# Web Service - API principal usando $PORT do Railway
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT

# Worker Service - Processa tasks em background (4 workers concorrentes)
worker: celery -A src.infrastructure.queue.celery_app worker \
        --loglevel=info \
        --queues=critical,high,default,low,background \
        --concurrency=4

# Beat Service - Scheduler para investigações 24/7
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info
```

### Ordem de Prioridade do Railway

O Railway detecta como executar a aplicação seguindo esta ordem:

1. ✅ **Procfile** ← **USAMOS ESTE**
2. railway.toml / railway.json
3. nixpacks.toml
4. Dockerfile
5. Auto-detecção Python

:::warning Conflito de Configuração
Se existirem múltiplos arquivos de configuração (railway.toml, railway.json, nixpacks.toml), o Railway pode escolher errado e iniciar na porta incorreta (7860 do HuggingFace ao invés de $PORT).

**Solução**: Remover TODOS os arquivos exceto o Procfile.
:::

## Variáveis de Ambiente

### Obrigatórias

Configure no Railway Dashboard (Settings → Variables):

```bash
# Core Security (gerar via scripts/generate_secrets.py)
JWT_SECRET_KEY=<64-char-secure-token>
SECRET_KEY=<64-char-secure-token>

# Environment
ENVIRONMENT=production
APP_ENV=production

# Database (Supabase)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# LLM Provider (Maritaca recomendado para PT-BR)
LLM_PROVIDER=maritaca
MARITACA_API_KEY=<key>
MARITACA_MODEL=sabia-3.1

# OU provider backup
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=<key>
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### Opcionais

```bash
# Government APIs
TRANSPARENCY_API_KEY=<key>          # Portal da Transparência (22% success)
DADOS_GOV_API_KEY=<key>             # Dados.gov.br

# Cache (Railway auto-provisiona se adicionar Redis)
REDIS_URL=redis://default:password@host:port
```

### Auto-Provisionadas pelo Railway

```bash
PORT=8000                           # Injetada automaticamente
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=<id>
RAILWAY_SERVICE_ID=<id>
```

## Setup do Deployment

### 1. Criar Projeto no Railway

```bash
# Via Dashboard
1. railway.app → New Project
2. Deploy from GitHub repo
3. Selecione: anderson-ufrj/cidadao.ai-backend
4. Branch: main
5. Root directory: /
```

### 2. Configurar Serviço Web

```bash
# Railway detecta automaticamente via Procfile
# Build Command: (auto-detectado)
# Start Command: web (do Procfile)
# Port: $PORT (auto-injetado)
```

### 3. Adicionar Redis

```bash
# Via Dashboard
1. New Service → Database → Redis
2. Railway cria REDIS_URL automaticamente
3. Variável é injetada em todos os serviços
```

### 4. Configurar Workers

```bash
# Via Dashboard - Worker Service
1. New Service → "Create from same repo"
2. Process type: worker
3. Mesmas variáveis de ambiente do web
4. Start command: worker (do Procfile)

# Via Dashboard - Beat Service
1. New Service → "Create from same repo"
2. Process type: beat
3. Mesmas variáveis de ambiente
4. Start command: beat (do Procfile)
```

### 5. Via CLI (Alternativa)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link projeto existente
railway link

# Deploy
railway up

# Criar serviços adicionais
railway service create --name cidadao-ai-worker --process worker
railway service create --name cidadao-ai-beat --process beat
```

## Verificação de Deploy

### Logs Esperados

**Web Service**:
```log
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000  # ✅ Porta $PORT
```

**Worker Service**:
```log
[INFO/MainProcess] Connected to redis://...
[INFO/MainProcess] celery@worker ready.
[INFO/MainProcess] Task src.tasks.investigate[...] received
```

**Beat Service**:
```log
[INFO/Beat] Scheduler: Sending due task investigate-contracts-24h
[INFO/Beat] Scheduler: Sending due task cleanup-old-data
```

### Health Checks

```bash
# Health endpoint
curl https://cidadao-api-production.up.railway.app/health

# Resposta esperada
{
  "status": "healthy",
  "version": "2025-11-22",
  "timestamp": "2025-11-22T10:15:30Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "agents": "17/17 operational"
  }
}

# API docs (OpenAPI)
curl https://cidadao-api-production.up.railway.app/docs
# Retorna HTML do Swagger UI

# Prometheus metrics
curl https://cidadao-api-production.up.railway.app/metrics
# Retorna métricas formato Prometheus
```

## Troubleshooting

### Problema 1: Porta Errada (7860 ao invés de $PORT)

**Sintoma**:
```log
🚀 Starting Cidadão.AI Full API
🌐 Running on 0.0.0.0:7860  # ❌ ERRADO - porta do HuggingFace
```

**Causa**: Railway executando `start_hf.py` ou `app.py` devido a arquivos de configuração conflitantes.

**Solução**:
```bash
# Remover arquivos conflitantes
git rm railway.toml railway.json nixpacks.toml
git commit -m "fix(deploy): force Railway to use Procfile"
git push origin main

# Railway automaticamente re-deploya com Procfile
```

### Problema 2: Deploy Falha com "Invalid PORT"

**Sintoma**:
```log
Error: Application failed to respond
Port binding timeout
```

**Causa**: Aplicação não está usando `$PORT` do Railway.

**Solução**: Verificar que `Procfile` usa `--port $PORT`:
```procfile
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT
```

### Problema 3: Variáveis de Ambiente Faltando

**Sintoma**:
```log
ValidationError: Field required: JWT_SECRET_KEY
```

**Solução**:
```bash
# Via Dashboard
Settings → Variables → Add Variable

# Via CLI
railway variables set JWT_SECRET_KEY=<value>
railway variables set SECRET_KEY=<value>
```

### Problema 4: Worker Não Inicia

**Sintoma**:
```log
[ERROR/MainProcess] consumer: Cannot connect to redis://...
```

**Solução**:
```bash
# Via Dashboard
Add Redis service → Automatic REDIS_URL injection

# Via CLI
railway add redis
```

### Problema 5: Health Check Falha

**Sintoma**: Railway marca serviço como unhealthy

**Solução**:
```bash
# 1. Verificar logs
railway logs --service web

# 2. Testar endpoint manualmente
curl https://seu-app.railway.app/health

# 3. Verificar variáveis críticas
railway variables
```

## Monitoramento

### Metrics no Railway Dashboard

**Location**: Dashboard → Metrics

**Métricas disponíveis**:
- **CPU Usage**: Uso de processador (target: &lt;70%)
- **Memory Usage**: Uso de memória (target: &lt;80%)
- **Network**: Tráfego entrada/saída
- **Request Rate**: Requests por segundo
- **Response Time**: Latência (p50, p95, p99)

### Logs em Tempo Real

```bash
# Via CLI
railway logs                        # Todos os serviços
railway logs --service web          # Apenas web
railway logs --service worker       # Apenas worker
railway logs --tail 100             # Últimas 100 linhas

# Via Dashboard
Dashboard → Logs → Live logs
```

### Prometheus Metrics (Externo)

```bash
# Configurar Grafana Cloud (opcional)
PROMETHEUS_PUSHGATEWAY_URL=https://prometheus-pushgateway.grafana.net
GRAFANA_CLOUD_API_KEY=<key>

# Métricas exportadas em /metrics:
# - http_requests_total
# - http_request_duration_seconds
# - agent_processing_duration_seconds
# - cache_hit_rate
# - investigation_status_total
```

## CI/CD Automático

### Git Push → Deploy

Railway faz deploy automaticamente ao push na branch `main`:

```bash
# Fluxo completo
git add .
git commit -m "feat(agents): add new fraud detection"
git push origin main

# Railway automaticamente:
# 1. Detecta push (webhook)
# 2. Clona repositório
# 3. Instala dependências (pip install)
# 4. Executa build (se configurado)
# 5. Inicia serviço (Procfile)
# 6. Health check (GET /health)
# 7. Switch traffic (zero downtime)
```

### Build Logs

```bash
# Via CLI
railway logs --deployment <deployment-id>

# Via Dashboard
Deployments → Select deployment → View logs
```

### Rollback

```bash
# Via Dashboard
Deployments → Select previous deployment → Redeploy

# Via CLI
railway redeploy <deployment-id>
```

## Performance Otimização

### 1. Worker Concurrency

**Default**: 4 concurrent workers

**Ajustar conforme carga**:
```procfile
# Baixa carga (development)
worker: celery -A src.infrastructure.queue.celery_app worker --concurrency=2

# Alta carga (production)
worker: celery -A src.infrastructure.queue.celery_app worker --concurrency=8
```

### 2. Redis Connection Pooling

**Config**: `src/infrastructure/cache.py`

```python
# Max connections por worker
REDIS_MAX_CONNECTIONS = 50

# Connection pool settings
redis_pool = redis.ConnectionPool(
    max_connections=REDIS_MAX_CONNECTIONS,
    decode_responses=True
)
```

### 3. Database Connection Pooling

**Config**: `src/infrastructure/database.py`

```python
# PostgreSQL async pool
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,           # Connections no pool
    max_overflow=20,        # Connections adicionais sob carga
    pool_pre_ping=True      # Validar conexões antes de usar
)
```

### 4. Uvicorn Workers

**Production**: Usar múltiplos workers Uvicorn

```procfile
# Single worker (development)
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT

# Multiple workers (production - Railway Hobby Plan: 2-4)
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 4
```

:::warning Memory Usage
Cada worker Uvicorn consome ~200-300MB. Railway Hobby Plan tem limite de 512MB-1GB, então ajuste `--workers` conforme plano.
:::

## Custos

### Railway Hobby Plan (Desenvolvimento)

**Preço**: $5/mês
- 500h de execução incluídas
- $5 em créditos
- Redis gratuito (100MB)
- **Total estimado**: $5-10/mês

### Railway Pro Plan (Produção)

**Preço**: $20/mês
- Execução ilimitada
- Redis: $10/mês (1GB)
- PostgreSQL: Use Supabase (gratuito até 500MB)
- **Total estimado**: $30-40/mês

### Otimizar Custos

```bash
# 1. Usar Supabase Free Tier para PostgreSQL
SUPABASE_URL=https://seu-projeto.supabase.co

# 2. Reduzir workers em horários de baixa carga
# Configurar no Railway Dashboard:
# Settings → Cron Jobs → Scale down at night

# 3. Monitorar uso
railway usage
```

## Segurança

### 1. Variáveis Secretas

```bash
# NUNCA commitar secrets
.env                    # No .gitignore
railway.toml            # No .gitignore

# Usar Railway Variables (criptografadas)
railway variables set SECRET_KEY=<value>
```

### 2. IP Whitelist (Opcional)

**Production only**: `src/api/app.py` (linhas 351-357)

```python
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        IPWhitelistMiddleware,
        allowed_ips=["203.0.113.0/24"]  # Range de IPs permitidos
    )
```

### 3. Rate Limiting

**Configuração**: `src/api/middleware/rate_limit.py`

| Tier | Requests/Hour | Burst | Concurrent |
|------|---------------|-------|------------|
| Anonymous | 100 | 10 | 2 |
| Authenticated | 1,000 | 100 | 10 |
| Premium | 10,000 | 1,000 | 50 |

### 4. CORS

**Configuração**: `src/api/app.py` (linhas 329-347)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cidadao-ai-frontend.vercel.app",  # Production
        "http://localhost:3000"                     # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

## Integração com Frontend

### CORS Configuration

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
```

**Backend (app.py)**:
```python
# Adicionar URL do frontend em allow_origins
allow_origins=["https://seu-frontend.vercel.app"]
```

### WebSocket/SSE

**SSE Streaming**:
```bash
# Endpoint
POST /api/v1/chat/stream

# Cliente JavaScript
const eventSource = new EventSource(
    'https://cidadao-api-production.up.railway.app/api/v1/chat/stream'
);
```

## Recursos Adicionais

### Railway Docs
- [Railway Documentation](https://docs.railway.app)
- [Procfile Reference](https://docs.railway.app/deploy/deployments#procfile)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Multiple Services](https://docs.railway.app/deploy/monorepo)

### Cidadão.AI Docs
- [Backend Architecture](../architecture/overview.md)
- [Multi-Agent System](../architecture/multi-agent-system.md)
- [API Overview](../api/overview.md)
- [Environment Variables](./variaveis-ambiente.md)

---

## Resumo - Checklist de Deploy

**Antes do Deploy**:
- [ ] Configurar variáveis de ambiente (JWT_SECRET_KEY, SECRET_KEY, MARITACA_API_KEY)
- [ ] Remover arquivos conflitantes (railway.toml, railway.json, nixpacks.toml)
- [ ] Verificar Procfile correto (`--port $PORT`)
- [ ] Configurar CORS com URL do frontend

**Durante Deploy**:
- [ ] Criar projeto Railway
- [ ] Adicionar Redis service
- [ ] Configurar 3 serviços (web, worker, beat)
- [ ] Verificar logs de startup

**Após Deploy**:
- [ ] Testar health endpoint
- [ ] Verificar API docs (/docs)
- [ ] Monitorar metrics (CPU, Memory)
- [ ] Configurar alertas (opcional)

---

**🇧🇷 Made with ❤️ in Minas Gerais, Brasil**

**Última Atualização**: 2025-11-22
**Autor**: Anderson Henrique da Silva
**Status de Produção**: ✅ 99.9% uptime desde outubro/2025
