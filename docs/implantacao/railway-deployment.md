---
title: "Deploy no Railway - Guia Completo"
sidebar_position: 3
description: "Guia detalhado para deploy do Cidadão.AI no Railway com arquitetura multi-serviço"
---

# 🚂 Deploy no Railway - Guia Completo

:::tip **Plataforma de Produção Atual**
O Cidadão.AI utiliza **Railway** como plataforma de produção desde outubro de 2024, alcançando **99.9% de uptime** com arquitetura multi-serviço (Web + Worker + Beat).

**🔗 Produção**: [https://cidadao-api-production.up.railway.app](https://cidadao-api-production.up.railway.app)
:::

## 🎯 Por Que Railway?

### Vantagens para o Cidadão.AI

| Característica | Railway | Alternativas |
|----------------|---------|--------------|
| **Multi-Serviço** | ✅ Procfile nativo | Limitado |
| **Celery + Beat** | ✅ Suporte completo | Difícil |
| **Auto-Deploy** | ✅ Push to deploy | Manual |
| **Managed Redis** | ✅ 1-click | Separado |
| **Zero Config** | ✅ Auto-detect | Configuração complexa |
| **Custo** | $30/mês produção | $50-100/mês |
| **Uptime SLA** | 99.9% | Variável |

### Arquitetura Final no Railway

```mermaid
graph TB
    subgraph "Railway Project: cidadao-api-production"
        subgraph "Serviço Web"
            Web[FastAPI + Uvicorn<br/>PORT dinâmico<br/>4 workers]
        end

        subgraph "Serviço Worker"
            Worker[Celery Worker<br/>4 concurrency<br/>5 queues]
        end

        subgraph "Serviço Beat"
            Beat[Celery Beat<br/>Scheduler 6h<br/>Monitoring 24/7]
        end

        subgraph "Databases"
            PG[(PostgreSQL<br/>Supabase<br/>10GB)]
            RD[(Redis<br/>Railway<br/>1GB)]
        end
    end

    subgraph "External Services"
        Portal[Portal da<br/>Transparência]
        Groq[Groq API<br/>LLM]
    end

    Internet((Internet)) --> Web
    Web --> Worker
    Beat --> Worker
    Web --> PG
    Web --> RD
    Worker --> PG
    Worker --> RD
    Worker --> Portal
    Worker --> Groq

    style Web fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style Worker fill:#2196F3,stroke:#1565C0,stroke-width:3px
    style Beat fill:#FF9800,stroke:#E65100,stroke-width:3px
    style PG fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px
    style RD fill:#F44336,stroke:#C62828,stroke-width:2px
```

## 📋 Pré-requisitos

### Conta Railway

```bash
# 1. Criar conta gratuita
https://railway.app/

# 2. Conectar GitHub
Settings → Conectar GitHub → Autorizar

# 3. Instalar Railway CLI (opcional)
npm install -g @railway/cli

# 4. Login via CLI
railway login
```

### Repositório Git

```bash
# Estrutura necessária do repositório
cidadao.ai-backend/
├── Procfile              # ✅ OBRIGATÓRIO - Define os 3 serviços
├── requirements.txt      # ✅ OBRIGATÓRIO - Dependências Python
├── runtime.txt           # ✅ OBRIGATÓRIO - python-3.10.12
├── src/
│   └── api/
│       └── app.py       # ✅ FastAPI app
└── .gitignore           # ❌ Não incluir .env, secrets
```

:::warning **Arquivos Conflitantes**
**REMOVA** estes arquivos se existirem - causam conflitos com Procfile:
- ❌ `railway.toml`
- ❌ `railway.json`
- ❌ `nixpacks.toml`

Railway usa esta ordem de prioridade:
1. **Procfile** ← Usamos este ✅
2. railway.toml / railway.json
3. nixpacks.toml
4. Dockerfile
:::

## 🚀 Setup Inicial - Passo a Passo

### 1. Criar Projeto no Railway

#### Via Dashboard (Recomendado)

```mermaid
sequenceDiagram
    participant User
    participant Railway
    participant GitHub
    participant App

    User->>Railway: 1. New Project
    Railway->>User: 2. Deploy from GitHub repo
    User->>GitHub: 3. Selecionar cidadao.ai-backend
    GitHub->>Railway: 4. Autorizar acesso
    Railway->>App: 5. Auto-detect Python + Procfile
    Railway->>User: 6. Deploy iniciado (serviço web)
    App->>Railway: 7. Build → Deploy → Healthcheck
    Railway->>User: 8. URL gerado
```

**Passos detalhados**:

1. **Dashboard → New Project**
2. **"Deploy from GitHub repo"**
3. Selecionar **`anderson-ufrj/cidadao.ai-backend`**
4. Railway detecta automaticamente:
   - Python 3.10
   - requirements.txt
   - Procfile
5. Primeiro deploy cria apenas o serviço **web**
6. Aguardar build (3-5 minutos)
7. Obter URL gerado: `https://cidadao-api-production.up.railway.app`

#### Via Railway CLI

```bash
# 1. Link ao repositório
cd cidadao.ai-backend
railway link

# 2. Criar projeto
railway init

# 3. Deploy
git push origin main
# Railway detecta push e faz deploy automático
```

### 2. Configurar Variáveis de Ambiente

:::danger **Secrets de Produção**
**NUNCA** commite secrets no Git. Configure via Railway Dashboard ou CLI.
:::

#### Via Dashboard

**Settings → Variables → Add Variable**

##### Obrigatórias

```bash
# Database (Supabase)
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security Keys (gerar com: python3 -c "import secrets; print(secrets.token_urlsafe(64))")
JWT_SECRET_KEY=ZreYJKfHts0RU3EUmG7YQKxvPq-n8wLzX9BcDfGhIjKlMnOpQr...
SECRET_KEY=gm_vrQ054CziyUEWbVXYz123456789abcdefghijklmnopqrstuvw...

# Environment
ENVIRONMENT=production
APP_ENV=production
```

##### Opcionais

```bash
# APIs Externas
TRANSPARENCY_API_KEY=e24f842355f72fb8c4d1a2b3c4d5e6f7
DADOS_GOV_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GROQ_API_KEY=gsk_abc123xyz789...

# Redis (auto-provisionado se adicionar Redis service)
REDIS_URL=redis://default:password@redis.railway.internal:6379
```

##### Auto-Provisionadas (Railway injeta automaticamente)

```bash
PORT=8000                    # Porta dinâmica (Railway gerencia)
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=abc-123
RAILWAY_SERVICE_ID=def-456
```

#### Via Railway CLI

```bash
# Adicionar variáveis via CLI
railway variables set SUPABASE_URL="https://xyzabc.supabase.co"
railway variables set JWT_SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')"

# Listar variáveis
railway variables list

# Remover variável
railway variables unset DEBUG
```

### 3. Adicionar PostgreSQL (Supabase)

Railway não oferece PostgreSQL managed próprio em preço competitivo. Use **Supabase** (gratuito até 500MB):

```bash
# 1. Criar projeto no Supabase
https://app.supabase.com/

# 2. Obter credenciais
Settings → Database → Connection String (Transaction)

# 3. Adicionar no Railway
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 4. Formato completo para SQLAlchemy
DATABASE_URL=postgresql+asyncpg://postgres:password@db.xyzabc.supabase.co:5432/postgres
```

### 4. Adicionar Redis (Railway Managed)

```bash
# Via Dashboard
# 1. New → Database → Add Redis
# 2. Railway auto-copia REDIS_URL para env vars
# 3. Verificar conectividade

# Via CLI
railway add redis

# Testar conexão
redis-cli -u $REDIS_URL ping
# Resposta esperada: PONG
```

### 5. Criar Serviços Worker e Beat

Railway inicialmente cria apenas o serviço **web**. Para adicionar **worker** e **beat**:

#### Via Dashboard

```mermaid
flowchart LR
    A[New Service] --> B[Create from GitHub]
    B --> C[Selecionar cidadao.ai-backend]
    C --> D[Settings → Deploy]
    D --> E[Procfile Process: worker]
    E --> F[Variables: Copiar do web]
    F --> G[Deploy]

    style E fill:#2196F3
```

**Passos detalhados**:

1. **Dashboard → New Service**
2. **"Create service from GitHub repo"**
3. Selecionar **`cidadao.ai-backend`**
4. **Settings → Deploy → Procfile Process**: selecionar **`worker`** (ou **`beat`**)
5. **Settings → Variables**: copiar **todas as variáveis** do serviço web
6. **Deploy**: Railway executará o comando correspondente do Procfile

#### Via Railway CLI

```bash
# Criar serviço worker
railway service create --name cidadao-worker

# Criar serviço beat
railway service create --name cidadao-beat

# Configurar variáveis (copiar do serviço web)
railway variables copy --from web --to worker
railway variables copy --from web --to beat
```

## 📝 Procfile - Configuração dos Serviços

:::tip **Regra de Ouro**
O Railway **prioriza o Procfile** sobre qualquer outro arquivo de configuração. Mantenha-o simples e limpo.
:::

### Procfile Completo

```procfile
# Main API server - FastAPI com Uvicorn
# Usa $PORT injetado pelo Railway (geralmente 8000)
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 4 --log-level info

# Celery worker para processamento assíncrono
# 5 queues por prioridade: critical, high, default, low, background
# 4 concurrency = 4 tasks simultâneas
worker: celery -A src.infrastructure.queue.celery_app worker --loglevel=info --queues=critical,high,default,low,background --concurrency=4 --max-tasks-per-child=1000

# Celery beat para tarefas agendadas
# Executa investigações automáticas a cada 6 horas
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info
```

### Detalhamento dos Comandos

#### Web Service

```bash
uvicorn src.api.app:app \
  --host 0.0.0.0 \        # Aceita conexões de qualquer origem
  --port $PORT \          # Porta dinâmica do Railway (NÃO hardcode!)
  --workers 4 \           # 4 processos worker (CPU-bound)
  --log-level info        # Logs de nível INFO
```

**Configurações de workers**:
- **Railway Hobby ($5/mês)**: `--workers 2`
- **Railway Pro ($20/mês)**: `--workers 4` (atual)
- **Cálculo recomendado**: `(2 x CPU_CORES) + 1`

#### Worker Service

```bash
celery -A src.infrastructure.queue.celery_app worker \
  --loglevel=info \                                      # Logs INFO
  --queues=critical,high,default,low,background \       # 5 queues
  --concurrency=4 \                                      # 4 tasks simultâneas
  --max-tasks-per-child=1000                            # Reciclar worker após 1000 tasks
```

**Queues por prioridade**:
1. **critical**: Alertas, falhas críticas (SLA < 1min)
2. **high**: Investigações urgentes (SLA < 5min)
3. **default**: Análises padrão (SLA < 30min)
4. **low**: Relatórios (SLA < 2h)
5. **background**: Limpeza, manutenção (SLA < 24h)

#### Beat Service

```bash
celery -A src.infrastructure.queue.celery_app beat \
  --loglevel=info        # Logs INFO
```

**Tarefas agendadas**:
- **Investigação automática**: A cada 6 horas
- **Limpeza de cache**: Diariamente às 03:00 BRT
- **Backup de métricas**: A cada 12 horas
- **Health check dos agentes**: A cada 1 hora

## ⚙️ Configuração Avançada

### Healthcheck Customizado

```yaml
# railway.toml (opcional - apenas se precisar customizar healthcheck)
[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Build Configuration

```yaml
# nixpacks.toml (opcional - apenas se precisar customizar build)
[phases.setup]
nixPkgs = ["python310", "postgresql", "gcc"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[phases.build]
cmds = ["python -m compileall src/"]

[start]
cmd = "uvicorn src.api.app:app --host 0.0.0.0 --port $PORT"
```

:::warning **Conflito com Procfile**
Se você criar `railway.toml` ou `nixpacks.toml`, eles terão **prioridade sobre o Procfile**. Use apenas se necessário e teste extensivamente.
:::

### Runtime Customizado

```txt
# runtime.txt - Especifica versão exata do Python
python-3.10.12
```

### Environment-Specific Variables

```bash
# Variáveis específicas do Railway (auto-injetadas)
RAILWAY_ENVIRONMENT       # production, staging, development
RAILWAY_PROJECT_NAME      # Nome do projeto
RAILWAY_SERVICE_NAME      # Nome do serviço (web, worker, beat)
RAILWAY_DEPLOYMENT_ID     # ID único do deploy
RAILWAY_GIT_COMMIT_SHA    # SHA do commit atual
RAILWAY_GIT_BRANCH        # Branch do Git
```

## 🔍 Monitoramento e Observabilidade

### 1. Logs em Tempo Real

#### Via Dashboard

```
Dashboard → Serviço → Logs
- Filtrar por severidade (INFO, WARNING, ERROR)
- Buscar por keyword
- Live tail (auto-scroll)
- Download logs (últimas 24h)
```

#### Via CLI

```bash
# Logs em tempo real (all services)
railway logs

# Logs de serviço específico
railway logs --service web
railway logs --service worker
railway logs --service beat

# Filtrar por severidade
railway logs --filter ERROR

# Últimas 100 linhas
railway logs --tail 100
```

### 2. Métricas Built-in

**Dashboard → Metrics** (disponível em todos os planos):

- **CPU Usage** (%)
- **Memory Usage** (MB/GB)
- **Network Bandwidth** (in/out)
- **Request Rate** (req/s)
- **Response Time** (p50, p95, p99 em ms)
- **Error Rate** (%)

### 3. Healthcheck Endpoint

```bash
# Endpoint de saúde da API
GET https://cidadao-api-production.up.railway.app/health

# Resposta esperada
{
  "status": "healthy",
  "timestamp": "2024-10-15T12:00:00Z",
  "version": "2.1.0",
  "environment": "production",
  "services": {
    "database": "ok",
    "redis": "ok",
    "agents": {
      "total": 18,
      "operational": 17,
      "failed": 1
    },
    "celery": {
      "worker": "ok",
      "beat": "ok",
      "queue_length": 5
    }
  },
  "uptime": 604800,
  "requests_processed": 1500000
}
```

### 4. Custom Metrics (Prometheus)

```python
# src/infrastructu../monitoramento/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# Agent metrics
agent_investigations_total = Counter(
    'agent_investigations_total',
    'Total investigations by agent',
    ['agent_name', 'status']
)

# Celery metrics
celery_task_duration = Histogram(
    'celery_task_duration_seconds',
    'Celery task duration',
    ['task_name']
)
```

**Endpoint de métricas**:
```bash
GET https://cidadao-api-production.up.railway.app/metrics
# Formato Prometheus (pode ser ingerido por Grafana Cloud)
```

### 5. Integração com Grafana Cloud (Opcional)

```bash
# Variáveis para exportar métricas
GRAFANA_CLOUD_PROMETHEUS_URL=https://prometheus-prod-01-eu-west-0.grafana.net/api/prom/push
GRAFANA_CLOUD_PROMETHEUS_USER=123456
GRAFANA_CLOUD_PROMETHEUS_PASSWORD=eyJrI...

# Habilitar push de métricas
ENABLE_METRICS_PUSH=true
METRICS_PUSH_INTERVAL=60  # segundos
```

## 🚨 Troubleshooting

### Problema 1: App Roda na Porta 7860 (Porta do HuggingFace)

**Sintoma**:
```bash
INFO:     Uvicorn running on http://0.0.0.0:7860  # ❌ ERRADO
```

**Causa**: Railway está executando `start_hf.py` ou `app.py` ao invés do Procfile.

**Solução**:
```bash
# 1. Verificar arquivos conflitantes
ls railway.toml railway.json nixpacks.toml

# 2. Remover TODOS exceto Procfile
rm railway.toml railway.json nixpacks.toml

# 3. Commit e push
git add .
git commit -m "fix(deploy): force Railway to use Procfile"
git push origin main

# Railway fará novo deploy usando APENAS o Procfile
```

### Problema 2: Deploy Falha com "Invalid PORT"

**Sintoma**:
```bash
Error: Invalid PORT value: undefined
```

**Causa**: Código hardcoded com porta fixa ou `$PORT` não sendo lido.

**Solução**:
```python
# ❌ ERRADO
port = 7860

# ✅ CORRETO
import os
port = int(os.getenv("PORT", 8000))
```

### Problema 3: Worker Não Inicia

**Sintoma**:
```bash
celery.exceptions.ImproperlyConfigured: Result backend must be configured
```

**Causa**: `REDIS_URL` não configurado.

**Solução**:
```bash
# Via Dashboard
New → Database → Add Redis → Railway auto-configura REDIS_URL

# Via CLI
railway add redis

# Verificar
railway variables list | grep REDIS_URL
```

### Problema 4: Healthcheck Falha

**Sintoma**:
```bash
Health check failed: Connection refused
```

**Causa**: Aplicação não iniciou corretamente.

**Soluções**:

1. **Verificar logs**:
```bash
railway logs --service web --tail 100
```

2. **Verificar variáveis obrigatórias**:
```bash
railway variables list
# Confirmar: JWT_SECRET_KEY, SECRET_KEY, SUPABASE_URL
```

3. **Testar localmente**:
```bash
# Simular ambiente Railway
export PORT=8000
uvicorn src.api.app:app --host 0.0.0.0 --port $PORT
```

### Problema 5: Celery Beat Não Agenda Tasks

**Sintoma**: Tasks agendadas não executam.

**Causa**: Beat não está persistindo schedule.

**Solução**:
```bash
# Adicionar volume persistente (via Railway Dashboard)
# Settings → Volumes → Add volume
# Mount path: /data

# Atualizar Procfile para usar schedule persistente
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info --schedule=/data/celerybeat-schedule
```

### Problema 6: Out of Memory (OOM)

**Sintoma**:
```bash
Killed (memory exhausted)
```

**Causa**: Uso excessivo de memória (comum com muitos workers).

**Solução**:

1. **Reduzir workers**:
```procfile
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 2  # era 4
worker: celery ... --concurrency=2  # era 4
```

2. **Upgrade do plano Railway**:
```
Hobby ($5/mês): 512MB RAM
Pro ($20/mês): 8GB RAM ← Recomendado para produção
```

3. **Otimizar código**:
```python
# Liberar memória após tasks pesadas
import gc
gc.collect()
```

## 💰 Custos e Otimização

### Estrutura de Custos Atual

| Item | Plano | Custo/mês | Detalhes |
|------|-------|-----------|----------|
| **Railway Project** | Pro | $20 | Execução ilimitada dos 3 serviços |
| **Redis** | Managed | $10 | 1GB, 99.9% uptime |
| **PostgreSQL** | Supabase Free | $0 | 500MB (upgrade: $25/mês para 8GB) |
| **Domínio** | Cloudflare | $0 | DNS gratuito |
| **Total** | - | **$30/mês** | Produção full-stack |

### Otimizações de Custo

1. **Usar Hobby para Development**:
```bash
# Projeto separado para staging/dev
Railway Hobby: $5/mês (500h execução)
```

2. **Reduzir workers em staging**:
```procfile
# staging/Procfile
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 1
worker: celery ... --concurrency=1
# Sem beat em staging
```

3. **Cache agressivo**:
```python
# Aumentar TTL de cache em dev
CACHE_TTL=7200  # 2h (produção: 1h)
```

## 🔄 CI/CD Automático

### Deploy Automático

Railway faz **deploy automático** em cada push para `main`:

```mermaid
sequenceDiagram
    participant Dev
    participant GitHub
    participant Railway
    participant App

    Dev->>GitHub: git push origin main
    GitHub->>Railway: Webhook: novo push
    Railway->>GitHub: Pull latest code
    Railway->>Railway: Build (pip install)
    Railway->>App: Deploy (web, worker, beat)
    Railway->>Railway: Healthcheck (/health)
    alt Healthcheck OK
        Railway->>Dev: ✅ Deploy successful
    else Healthcheck FAIL
        Railway->>Railway: Automatic rollback
        Railway->>Dev: ❌ Deploy failed, rolled back
    end
```

### GitHub Actions (Opcional)

Para CI/CD mais controlado, adicione GitHub Actions:

```yaml
# .github/workflows/deploy-railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/ -v --cov=src/
      - name: Type check
        run: mypy src/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up
```

### Rollback Manual

```bash
# Via Dashboard
Dashboard → Deployments → Selecionar deployment anterior → Redeploy

# Via CLI
railway rollback
```

## 📚 Recursos e Links Úteis

### Documentação Oficial

- 📖 [Railway Docs](https://docs.railway.app)
- 🚂 [Procfile Reference](https://docs.railway.app/deploy/deployments#procfile)
- 🔧 [Railway CLI](https://docs.railway.app/develop/cli)
- 🌐 [Environment Variables](https://docs.railway.app/develop/variables)
- 📊 [Metrics & Monitoring](https://docs.railway.app/deploy/metrics)

### Cidadão.AI

- 🎯 [Backend Repository](https://github.com/anderson-ufrj/cidadao.ai-backend)
- 📚 [Technical Docs](https://anderson-ufrj.github.io/cidadao.ai-technical-docs/)
- 🚀 [API Production](https://cidadao-api-production.up.railway.app)
- 📖 [Swagger Docs](https://cidadao-api-production.up.railway.app/docs)

### Comunidade

- 💬 [Railway Discord](https://discord.gg/railway)
- 🐛 [Railway Status](https://status.railway.app/)
- 📢 [Railway Blog](https://blog.railway.app/)

---

:::tip **Dúvidas ou Problemas?**
Consulte os logs via `railway logs` ou abra uma issue no [repositório do backend](https://github.com/anderson-ufrj/cidadao.ai-backend/issues).
:::

**Anterior:** [Guia de Deploy →](./deployment-guide.md)
**Próximo:** [Configuração Docker →](./docker-configuration.md)
