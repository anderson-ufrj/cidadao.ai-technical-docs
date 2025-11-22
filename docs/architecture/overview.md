---
title: "Visão Geral da Arquitetura"
sidebar_position: 1
description: "Arquitetura completa do sistema Cidadão.AI - multi-agente, deployment e infraestrutura de produção"
---

# 🏛️ Visão Geral da Arquitetura

**Última Atualização**: 22 de Janeiro de 2025
**Versão do Sistema**: 1.0.0
**Status**: ✅ **PRODUÇÃO ESTÁVEL** (99.9% uptime desde 07/10/2025)

---

## 📊 Resumo Executivo

O **Cidadão.AI** é um sistema enterprise de inteligência artificial multi-agente para análise automatizada de transparência governamental brasileira. Implementa uma arquitetura distribuída com **17 agentes especializados** (16 operacionais + 1 base framework) baseados em identidades culturais brasileiras, processando dados públicos via **323 endpoints REST** em produção no Railway Platform.

### Métricas de Produção (Atual)

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| **Uptime (Railway)** | 99.9% | 99.9% | ✅ Excellent |
| **Latência p50** | 80ms | &lt;100ms | ✅ Exceeds |
| **Latência p95** | 145ms | &lt;200ms | ✅ Excellent |
| **Throughput** | 1,000 req/s | 1,000 req/s | ✅ Target Met |
| **Agent Import Time** | 3.81ms | &lt;100ms | ✅ 367x faster (lazy loading) |
| **Agentes Operacionais** | 16/17 (94.1%) | 100% | 🟡 Near Complete |
| **Test Coverage** | 76.29% | 80% | 🟡 Near Target |
| **Tests Passing** | 97.4% (1,474/1,514) | &gt;95% | ✅ Excellent |
| **API Endpoints** | 323 | - | ✅ Production |

### Stack Tecnológica

**Backend Core**:
- **API Framework**: FastAPI 0.109.1 + Uvicorn (Python 3.11+)
- **Multi-Agent**: LangChain + Custom ReflectiveAgent Pattern
- **LLM Provider**: Maritaca AI (primary - optimized for Brazilian Portuguese) + Anthropic Claude (backup with auto-failover)

**Databases & Cache**:
- **PostgreSQL**: Primary database (production or in-memory SQLite for dev)
- **Redis**: Multi-layer caching (L1: memory 5min, L2: Redis 1h, L3: PostgreSQL 24h)

**Infrastructure**:
- **Deployment**: Railway Platform (3 services: web, worker, beat)
- **Async Tasks**: Celery + Celery Beat (24/7 monitoring with 5 queues)
- **Monitoring**: Prometheus + Grafana (8 dashboards operacionais)

**Frontend Ecosystem**:
- **Web App**: Next.js 15 PWA (Vercel)
- **Landing**: Hub site (GitHub Pages)
- **Docs**: Docusaurus v3.6.3 (este site)

---

## 🎯 Definição e Escopo do Sistema

O Cidadão.AI é formalmente definido como um **Sistema de Inteligência Multi-Agente (SIMA)** para análise automatizada de transparência pública, implementando ensemble de algoritmos de detecção de anomalias, processamento de linguagem natural e análise estatística avançada sobre datasets governamentais brasileiros.

### Marco Legal

O sistema opera em conformidade com:
- **Lei de Acesso à Informação (LAI)** - Lei 12.527/2011
- **Lei Geral de Proteção de Dados (LGPD)** - Lei 13.709/2018
- **Nova Lei de Licitações** - Lei 14.133/2021

Garantindo compliance legal e ética em todas as operações de análise de dados públicos.

---

## 🏗️ Arquitetura do Ecossistema Completo

### Visão de Alto Nível

```mermaid
graph TB
    subgraph "👤 Usuário"
        U[Cidadão<br/>Analista<br/>Jornalista<br/>Pesquisador]
    end

    subgraph "🌐 Frontend Layer"
        HUB[🏛️ Hub<br/>Landing Page<br/>Marketing]
        APP[⚛️ Frontend<br/>Next.js 15 PWA<br/>Vercel Deploy]
        DOCS[📚 Technical Docs<br/>Docusaurus<br/>Você está aqui]
    end

    subgraph "🚂 Railway Platform - Backend Services"
        subgraph "Web Service (4 workers)"
            API[🔌 API Gateway<br/>FastAPI<br/>323 endpoints]
        end

        subgraph "Worker Service (4 concurrency)"
            WORKER[⚙️ Celery Worker<br/>5 queues<br/>Async processing]
        end

        subgraph "Beat Service (1 instance)"
            BEAT[⏰ Celery Beat<br/>Scheduler<br/>24/7 monitoring]
        end
    end

    subgraph "🤖 Multi-Agent System - 17 Agentes"
        ROUTER[🎯 Senna<br/>Agent Router<br/>Intent Detection]
        MASTER[👑 Abaporu<br/>Master Orchestrator<br/>Investigation Coordinator]

        subgraph "🔍 Investigação"
            ZUMBI[⚔️ Zumbi<br/>Anomaly Detective<br/>FFT Analysis]
            OXOSSI[🏹 Oxóssi<br/>Data Hunter<br/>Fraud Detection]
            OBALUAIE[🕵️ Obaluaiê<br/>Corruption Detector<br/>Benford's Law]
        end

        subgraph "📊 Análise"
            ANITA[📊 Anita<br/>Data Analyst<br/>Statistics]
            LAMPIAO[🗺️ Lampião<br/>Regional Analyst<br/>Geography]
            CEUCI[🔮 Ceuci<br/>Predictive AI<br/>ML Pipeline]
            BONIFACIO[⚖️ Bonifácio<br/>Legal Expert<br/>Lei 14.133/21]
        end

        subgraph "📝 Processamento"
            MACHADO[✍️ Machado<br/>Narrative Analyst<br/>NLP]
            DANDARA[⚖️ Dandara<br/>Social Equity<br/>Gini Analysis]
            MARIA[🛡️ Maria Quitéria<br/>Security<br/>LGPD Compliance]
        end

        subgraph "📢 Comunicação"
            TIRADENTES[📝 Tiradentes<br/>Report Generator<br/>PDF/HTML/MD]
            DRUMMOND[📢 Drummond<br/>Communicator<br/>NLG Multi-channel]
            NIEMEYER[🎨 Niemeyer<br/>Data Visualizer<br/>Charts & Graphs]
        end

        subgraph "🧠 Suporte"
            NANA[🧠 Nanã<br/>Memory Manager<br/>Context & History]
            DEODORO[🏗️ Deodoro<br/>Base Framework<br/>ReflectiveAgent]
        end
    end

    subgraph "💾 Data Layer"
        PG[(PostgreSQL<br/>Primary DB<br/>Relational)]
        REDIS[(Redis<br/>Cache Layer<br/>477 integrations)]
    end

    subgraph "🌐 External APIs (30+)"
        PORTAL[Portal da<br/>Transparência]
        IBGE[IBGE<br/>Demografia]
        DATASUS[DataSUS<br/>Saúde]
        INEP[INEP<br/>Educação]
        PNCP[PNCP<br/>Compras]
    end

    subgraph "🤖 LLM Providers"
        MARITACA[Maritaca AI<br/>Primary<br/>Brazilian Portuguese]
        ANTHROPIC[Anthropic Claude<br/>Backup<br/>Auto-failover]
    end

    subgraph "📊 Monitoring"
        PROM[📊 Prometheus<br/>Metrics]
        GRAF[📈 Grafana<br/>8 Dashboards]
    end

    %% User interactions
    U --> APP
    U --> HUB
    U --> DOCS

    %% Frontend to Backend
    HUB --> API
    APP --> API

    %% API routing
    API --> ROUTER
    API --> WORKER
    BEAT --> WORKER

    %% Agent orchestration
    ROUTER --> MASTER
    ROUTER --> ZUMBI
    ROUTER --> ANITA

    MASTER --> ZUMBI
    MASTER --> ANITA
    MASTER --> OXOSSI
    MASTER --> LAMPIAO
    MASTER --> TIRADENTES

    %% Agent collaboration
    ZUMBI --> OXOSSI
    ANITA --> LAMPIAO
    ANITA --> CEUCI
    OXOSSI --> OBALUAIE
    TIRADENTES --> DRUMMOND
    TIRADENTES --> NIEMEYER

    %% Support
    NANA --> MASTER
    DEODORO -.-> ZUMBI
    DEODORO -.-> ANITA

    %% Security
    MARIA -.-> MASTER
    BONIFACIO -.-> TIRADENTES
    DANDARA -.-> ANITA

    %% Data access
    API --> PG
    API --> REDIS
    WORKER --> PG
    WORKER --> REDIS
    MASTER --> PG
    NANA --> PG

    %% External integrations
    WORKER --> PORTAL
    WORKER --> IBGE
    WORKER --> DATASUS
    WORKER --> INEP
    WORKER --> PNCP

    %% LLM integration
    MASTER --> MARITACA
    MASTER --> ANTHROPIC
    DRUMMOND --> MARITACA
    DRUMMOND --> ANTHROPIC

    %% Monitoring
    API --> PROM
    WORKER --> PROM
    MASTER --> PROM
    PROM --> GRAF

    %% Styling
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#4CAF50,stroke:#333,stroke-width:3px,color:#fff
    classDef agent fill:#ffd93d,stroke:#333,stroke-width:2px,color:#000
    classDef data fill:#457b9d,stroke:#333,stroke-width:2px,color:#fff
    classDef external fill:#a8dadc,stroke:#333,stroke-width:2px,color:#000
    classDef monitor fill:#e76f51,stroke:#333,stroke-width:2px,color:#fff

    class HUB,APP,DOCS frontend
    class API,WORKER,BEAT backend
    class ROUTER,MASTER,ZUMBI,ANITA,OXOSSI,LAMPIAO,CEUCI,OBALUAIE,DRUMMOND,TIRADENTES,NIEMEYER,MARIA,BONIFACIO,DANDARA,MACHADO,NANA,DEODORO agent
    class PG,REDIS data
    class PORTAL,IBGE,DATASUS,INEP,PNCP,MARITACA,ANTHROPIC external
    class PROM,GRAF monitor
```

---

## 🤖 Sistema Multi-Agente (17 Agentes)

### Hierarquia e Organização

O sistema implementa **17 agentes especializados** com identidades culturais brasileiras, organizados em 6 camadas funcionais:

#### 🎯 Camada de Coordenação (2 agentes)

- **👑 Abaporu** (Master Orchestrator) - Coordenação central de investigações complexas multi-agente
- **🎯 Senna** (Router) - Roteamento semântico, detecção de intenção e load balancing

#### 🔍 Camada de Investigação (3 agentes)

- **⚔️ Zumbi dos Palmares** - Detecção de anomalias (FFT Spectral Analysis, Statistical Outliers)
- **🏹 Oxóssi** - Data hunter e detecção de fraudes em licitações
- **🕵️ Obaluaiê** - Detecção de corrupção (Lei de Benford, Cartel Detection)

#### 📊 Camada de Análise (4 agentes)

- **📊 Anita Garibaldi** - Análise estatística de dados (pandas + numpy integrados)
- **🗺️ Lampião** - Análise regional e geográfica
- **⚖️ José Bonifácio** - Expert legal (Lei 8.666/93, Lei 14.133/21)
- **🔮 Céuci** - IA Preditiva (ARIMA/LSTM/Prophet time series)

#### 📝 Camada de Processamento (3 agentes)

- **✍️ Machado de Assis** - Análise narrativa e textual
- **⚖️ Dandara** - Justiça social e análise de equidade (Gini Coefficient)
- **🛡️ Maria Quitéria** - Segurança e LGPD compliance

#### 📢 Camada de Comunicação (3 agentes)

- **📝 Tiradentes** - Geração de relatórios executivos (PDF/HTML/MD com ReportLab)
- **📢 Carlos Drummond de Andrade** - Comunicação multi-canal (NLG em português)
- **🎨 Oscar Niemeyer** - Visualização de dados (matplotlib/D3.js)

#### 🧠 Camada de Suporte (2 agentes)

- **🧠 Nanã** - Gerenciamento de memória e contexto histórico
- **🏗️ Deodoro da Fonseca** - Arquitetura base (BaseAgent + ReflectiveAgent framework)

### Pattern: ReflectiveAgent

Todos os 16 agentes operacionais implementam **self-reflection** herdando de `ReflectiveAgent` (definido em `deodoro.py`):

```python
class ReflectiveAgent(BaseAgent):
    """
    Base para agentes com capacidade de auto-reflexão.

    Quality Threshold: 0.8 (80% confidence minimum)
    Max Iterations: 3 (até 3 tentativas de melhoria)
    """

    async def reflect(self, result: AgentResponse) -> ReflectionResult:
        """
        Mecanismo de auto-avaliação.
        Se qualidade < 0.8 e retry_count < 3, tenta melhorar.
        """
        quality_score = await self.evaluate_quality(result)

        if quality_score < 0.8 and self.retry_count < 3:
            improvement_plan = await self.identify_improvements(result)
            return await self.retry_with_improvements(improvement_plan)

        return result
```

**Estados dos Agentes**:
```python
class AgentState(Enum):
    IDLE = "idle"          # Pronto para receber tarefas
    THINKING = "thinking"  # Processando requisição
    ACTING = "acting"      # Executando ação
    WAITING = "waiting"    # Aguardando resposta externa
    ERROR = "error"        # Erro durante execução
    COMPLETED = "completed"  # Tarefa concluída
```

### Performance: Lazy Loading

**Otimização Crítica** implementada em `src/agents/__init__lazy.py`:

- **Antes**: 1460.41ms para importar módulo de agentes
- **Depois**: 3.81ms para importar (melhoria de **367x**)
- **Overhead por agente**: apenas 0.17ms quando acessado pela primeira vez
- **Padrão**: `__getattr__` magic method com lazy initialization

Todos os 16 agentes são registrados em `src/agents/__init__.py` para lazy loading automático.

---

## 🚂 Arquitetura de Deployment (Railway)

### Multi-Service Architecture

O Railway executa **3 serviços simultâneos** definidos no `Procfile`:

```procfile
# Web Service - FastAPI + Uvicorn (4 workers)
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 4

# Worker Service - Celery Worker (4 concurrency, 5 queues)
worker: celery -A src.infrastructure.queue.celery_app worker \
        --loglevel=info \
        --queues=critical,high,default,low,background \
        --concurrency=4

# Beat Service - Celery Beat Scheduler (24/7 monitoring)
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info
```

### Especificações de Produção

| Componente | Especificação |
|------------|---------------|
| **Platform** | Railway Pro |
| **Services** | 3 (web, worker, beat) |
| **Database** | PostgreSQL (production) ou SQLite in-memory (dev) |
| **Cache** | Redis (477 integrations ativas) |
| **Monitoring** | Prometheus + Grafana (8 dashboards) |
| **CI/CD** | Automatic deployment on push to main |
| **Cost** | ~$30/mês |
| **Uptime SLA** | 99.9% (verificado desde 07/10/2025) |
| **URL Production** | [cidadao-api-production.up.railway.app](https://cidadao-api-production.up.railway.app) |

### Recursos por Serviço

**Web Service**:
- 2 vCPU, 4GB RAM
- 4 Uvicorn workers
- Auto-restart com exponential backoff

**Worker Service**:
- 2 vCPU, 4GB RAM
- 4 Celery workers (concurrency)
- 5 filas priorizadas (critical → background)

**Beat Service**:
- 1 vCPU, 2GB RAM
- 1 scheduler instance
- Agendamento a cada 6 horas

### Escalabilidade

**Limites do Railway Pro**:
- Até 32GB RAM por serviço
- Até 32 vCPU por serviço
- Zero-downtime rolling deployments
- Auto-scaling baseado em métricas

---

## 📊 Fluxo de Dados End-to-End

### Pipeline de Investigação Completo

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Cidadão
    participant App as ⚛️ Frontend (Next.js)
    participant API as 🔌 API Gateway
    participant Senna as 🎯 Senna (Router)
    participant Abaporu as 👑 Abaporu (Master)
    participant Zumbi as ⚔️ Zumbi (Anomaly)
    participant Anita as 📊 Anita (Analyst)
    participant Tiradentes as 📝 Tiradentes (Reporter)
    participant DB as 🗄️ PostgreSQL
    participant Redis as ⚡ Redis Cache

    User->>App: "Investigar contratos de saúde > R$ 1M"
    App->>API: POST /api/v1/chat (SSE streaming)

    API->>Senna: route_intent(query)
    Note over Senna: Intent Detection:<br/>- Type: INVESTIGATE<br/>- Confidence: 0.95<br/>- Agent: Abaporu

    Senna->>Abaporu: delegate_investigation()
    Note over Abaporu: Cria Investigation:<br/>INV-2025-001<br/>Plan: Multi-agent approach

    Abaporu->>DB: create_investigation()
    DB-->>Abaporu: investigation_id

    par Parallel Analysis
        Abaporu->>Zumbi: detect_anomalies(contracts)
        Abaporu->>Anita: analyze_trends(contracts)
    end

    Zumbi->>Redis: check_cache(contract_hash)
    Redis-->>Zumbi: cache_miss

    Note over Zumbi: FFT Analysis:<br/>- Spectral patterns<br/>- Statistical outliers<br/>- Z-score > 2.5

    Zumbi->>Redis: store_results(TTL: 1h)
    Zumbi-->>Abaporu: 47 anomalies (score: 0.87)

    Note over Anita: Statistical Analysis:<br/>- Trend: increasing 12%<br/>- Correlation: 0.73<br/>- Seasonality: Q4 peak

    Anita-->>Abaporu: trend_analysis (confidence: 0.91)

    Abaporu->>Tiradentes: generate_report(results)
    Note over Tiradentes: Report Generation:<br/>- Format: PDF + HTML<br/>- Charts: matplotlib<br/>- Template: Executive

    Tiradentes->>DB: store_report(RPT-001)
    Tiradentes-->>Abaporu: report_ready

    Abaporu->>DB: update_investigation(status: completed)
    Abaporu-->>API: investigation_complete

    API-->>App: SSE stream (progressive updates)
    App-->>User: 📊 Relatório Completo

    Note over User,DB: Total Time: ~3.2s<br/>Agents: 4 (Senna, Abaporu, Zumbi, Anita, Tiradentes)<br/>Anomalies: 47 detected
```

### Estratégia de Cache Multi-Layer

```mermaid
graph LR
    REQ[📥 API Request]

    L1[⚡ L1: Memory Cache<br/>TTL: 5 minutes<br/>Size: 100MB<br/>Hit Rate: ~40%]
    L2[⚡ L2: Redis Cache<br/>TTL: 1 hour<br/>Size: 1GB<br/>Hit Rate: ~35%]
    L3[(⚡ L3: PostgreSQL<br/>TTL: 24 hours<br/>Size: Unlimited<br/>Hit Rate: ~12%)]
    ORIGIN[🌐 External APIs<br/>Portal/IBGE/DataSUS<br/>Hit Rate: ~13%]

    RESP[📤 Response]

    REQ --> L1
    L1 -->|✅ Hit| RESP
    L1 -->|❌ Miss| L2
    L2 -->|✅ Hit| RESP
    L2 -->|❌ Miss| L3
    L3 -->|✅ Hit| RESP
    L3 -->|❌ Miss| ORIGIN
    ORIGIN --> L3
    L3 --> L2
    L2 --> L1
    L1 --> RESP

    style L1 fill:#95e1d3,stroke:#333,stroke-width:2px
    style L2 fill:#61dafb,stroke:#333,stroke-width:2px
    style L3 fill:#457b9d,stroke:#333,stroke-width:2px,color:#fff
    style ORIGIN fill:#e76f51,stroke:#333,stroke-width:2px,color:#fff
```

**Cache Hit Rate Atual**: 87% (target: >80% ✅)

**Benefícios**:
- Redução de 87% nas chamadas externas
- Latência média de 80ms (p50)
- Economia de custos em APIs pagas

---

## 🔒 Segurança e Compliance

### Arquitetura de Segurança em Camadas

```
┌─────────────────────────────────────────────────┐
│         CAMADA 1: Network Security             │
│         - Railway WAF (DDoS Protection)        │
│         - SSL/TLS 1.3 (HTTPS Everywhere)       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 2: API Gateway Security         │
│         - Rate Limiting (100 req/min/user)     │
│         - IP Whitelisting (optional)           │
│         - Request Validation (Pydantic)        │
│         - CORS Configuration                   │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 3: Authentication               │
│         - JWT Tokens (HS256)                   │
│         - API Keys (secure generation)         │
│         - Session Management                   │
│         - Token Refresh (automatic)            │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 4: Authorization                │
│         - RBAC (Role-Based Access Control)     │
│         - Resource-level Permissions           │
│         - Agent-level Access Control           │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 5: Application Security         │
│         - Input Validation (all endpoints)     │
│         - SQL Injection Prevention             │
│         - XSS Protection                       │
│         - CSRF Tokens                          │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 6: Data Security                │
│         - Encryption at Rest (database)        │
│         - Encryption in Transit (TLS 1.3)      │
│         - Data Anonymization (LGPD)            │
│         - PII Detection & Masking              │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         CAMADA 7: Audit & Compliance           │
│         - Immutable Audit Logs                 │
│         - LGPD Compliance (Maria Quitéria)     │
│         - 7-year retention policy              │
│         - Compliance Reports (automated)       │
└─────────────────────────────────────────────────┘
```

### Agente de Segurança: Maria Quitéria 🛡️

Responsabilidades específicas:
- **IDS/IPS**: Intrusion Detection/Prevention System
- **LGPD Officer**: Data protection compliance automation
- **Threat Detection**: Real-time security monitoring
- **Incident Response**: Automated response workflows
- **Security Audits**: Continuous vulnerability scanning

---

## 📈 Observabilidade e Monitoramento

### Stack de Monitoramento

**Prometheus + Grafana** configurados via `make monitoring-up`:

```bash
# Iniciar stack de monitoramento
make monitoring-up

# Acessar:
# - Grafana: http://localhost:3000 (admin/cidadao123)
# - Prometheus: http://localhost:9090
```

### Métricas Principais

```python
# src/middleware/metrics_middleware.py

# 1. HTTP Request Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# 2. Investigation Processing Time
investigation_duration = Histogram(
    'investigation_duration_seconds',
    'Investigation processing time',
    ['agent', 'anomaly_type'],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# 3. Agent Utilization
agent_utilization = Gauge(
    'agent_utilization_ratio',
    'Current agent utilization',
    ['agent_name']
)

# 4. Cache Performance
cache_hit_ratio = Gauge(
    'cache_hit_ratio',
    'Cache hit rate',
    ['layer']  # L1, L2, L3
)
```

### Dashboards Grafana (8 dashboards)

1. **Overview Dashboard**
   - Request rate (req/s)
   - Response time (p50, p95, p99)
   - Error rate (%)
   - Active users

2. **Agent Performance Dashboard**
   - Agent utilization por agente
   - Investigation completion rate
   - Anomaly detection rate
   - Self-reflection iterations

3. **Infrastructure Dashboard**
   - CPU usage (%)
   - Memory usage (GB)
   - Database connections
   - Cache hit rate (%)

4. **API Endpoints Dashboard**
   - Top 10 endpoints by traffic
   - Slowest endpoints
   - Error-prone endpoints

5. **Investigation Analytics Dashboard**
   - Investigations per day
   - Average investigation time
   - Success rate
   - Top anomaly types

6. **Security Dashboard**
   - Failed authentication attempts
   - Rate limit violations
   - Suspicious patterns

7. **Cache Performance Dashboard**
   - Hit rates per layer (L1/L2/L3)
   - Memory usage
   - Eviction rate

8. **Business Metrics Dashboard**
   - Daily active users
   - Investigations created
   - Reports generated
   - API calls per customer

---

## 🔧 Inovações Tecnológicas

### 1. Arquitetura Multi-Agente Distribuída com Identidades Culturais

Implementação **original e única** de 17 agentes especializados com identidades culturais brasileiras:
- Cada agente tem personalidade, expertise e história baseada em figura histórica
- Comunicação assíncrona com protocolos bem definidos
- Self-reflection pattern para garantia de qualidade

### 2. Ensemble de Algoritmos de Detecção

Framework combinando **15+ algoritmos** de machine learning:
- Isolation Forest, LOF, One-Class SVM
- Voting ensemble com calibração probabilística
- Métricas: F1-Score 89.2%, Precision 91%, Recall 87%

### 3. Explainable AI (XAI)

Implementação de **SHAP e LIME** para interpretabilidade completa:
- Essencial para accountability governamental
- Todos os resultados incluem explicações
- Cumprimento de requisitos da LAI (Lei 12.527/2011)

### 4. Self-Reflection Pattern (Quality Threshold: 0.8)

Agentes auto-avaliam resultados com threshold de qualidade 0.8:
- Até 3 iterações de melhoria automática
- Redução de falsos positivos em 34%
- Aumento da confiança média de 0.72 → 0.87

### 5. Lazy Loading de Agentes (367x Performance Gain)

Otimização crítica para cold start:
- Redução de 1460ms → 3.81ms no import time
- Overhead de apenas 0.17ms por agente
- Implementação via `__getattr__` magic method

### 6. Multi-Service Orchestration Railway

Arquitetura com 3 serviços independentes:
- **Web**: API síncrona (FastAPI)
- **Worker**: Processamento assíncrono (Celery)
- **Beat**: Agendamento 24/7 (Celery Beat)

---

## 📚 Próximos Passos

Para entender melhor a arquitetura:

1. [**Multi-Agent System**](./multi-agent-system.md) - Deep dive nos 17 agentes
2. [**Data Pipeline**](./data-pipeline.md) - Fluxo de dados e ETL
3. [**API Reference**](../api/visao-geral.md) - Documentação completa dos 323 endpoints
4. [**Deployment Guide**](../deployment/deployment-guide.md) - Guia de deployment Railway
5. [**Monitoring Setup**](../monitoring/overview.md) - Configuração Grafana + Prometheus

---

## 🔗 Links Úteis

### Produção
- 🚀 **API Backend**: [https://cidadao-api-production.up.railway.app](https://cidadao-api-production.up.railway.app)
- 📚 **Swagger UI**: [https://cidadao-api-production.up.railway.app/docs](https://cidadao-api-production.up.railway.app/docs)
- 📖 **ReDoc**: [https://cidadao-api-production.up.railway.app/redoc](https://cidadao-api-production.up.railway.app/redoc)
- 📊 **Health Check**: [https://cidadao-api-production.up.railway.app/health](https://cidadao-api-production.up.railway.app/health)
- ⚡ **Metrics**: [https://cidadao-api-production.up.railway.app/health/metrics](https://cidadao-api-production.up.railway.app/health/metrics)

### Repositórios GitHub
- 🐙 **Backend**: [anderson-ufrj/cidadao.ai-backend](https://github.com/anderson-ufrj/cidadao.ai-backend)
- ⚛️ **Frontend**: [anderson-ufrj/cidadao.ai-frontend](https://github.com/anderson-ufrj/cidadao.ai-frontend)
- 📚 **Technical Docs**: [anderson-ufrj/cidadao.ai-technical-docs](https://github.com/anderson-ufrj/cidadao.ai-technical-docs)

---

:::tip Sistema em Produção desde 07/10/2025

O Cidadão.AI está em **produção estável** no Railway Platform com **99.9% de uptime**, processando milhares de registros públicos diariamente. Acesse a API ao vivo e teste todas as funcionalidades através do Swagger UI.

**Status Atual**: ✅ 16/17 agentes operacionais (94.1%) | 323 endpoints REST | 76.29% test coverage
:::

---

**Última Atualização**: 22 de Janeiro de 2025
**Versão da Documentação**: 3.0.0
**Status do Sistema**: ✅ PRODUÇÃO ESTÁVEL
