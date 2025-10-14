---
title: "System Design and Architecture"
sidebar_position: 2
description: "Comprehensive architectural documentation of the Cidadão.AI multi-agent system"
---

# System Design and Architecture

## Abstract

This document presents a comprehensive architectural analysis of Cidadão.AI, a distributed multi-agent system designed for automated transparency analysis in Brazilian government data. The system implements a microservices architecture with **17 specialized agents** (8 fully operational = 47%), employing state-of-the-art machine learning algorithms, natural language processing, and statistical anomaly detection techniques. The architecture achieves horizontal scalability, fault tolerance, and maintains sub-180ms response times (p95: 145ms) while processing millions of public records. Currently deployed on **Railway Platform** with 99.9% uptime SLA.

## 1. Architectural Overview

### 1.1 System Boundaries and Context

```mermaid
C4Context
    title System Context Diagram - Cidadão.AI

    Person(citizen, "Brazilian Citizen", "Users seeking transparency")
    Person(analyst, "Government Analyst", "Public sector analysts")
    Person(journalist, "Investigative Journalist", "Media professionals")
    
    System_Boundary(cidadao, "Cidadão.AI Platform") {
        System(backend, "Backend API", "Multi-agent analysis system")
        System(frontend, "Web Interface", "User interaction layer")
    }
    
    System_Ext(portal, "Portal da Transparência", "Government data source")
    System_Ext(tcu, "TCU Systems", "Federal audit data")
    System_Ext(cgu, "CGU Database", "Comptroller general data")
    
    Rel(citizen, frontend, "Accesses", "HTTPS")
    Rel(analyst, frontend, "Analyzes", "HTTPS")
    Rel(journalist, frontend, "Investigates", "HTTPS")
    
    Rel(frontend, backend, "Calls", "REST/WebSocket")
    Rel(backend, portal, "Fetches", "API")
    Rel(backend, tcu, "Queries", "API")
    Rel(backend, cgu, "Retrieves", "API")
```

### 1.2 High-Level Architecture

The system follows a **layered microservices architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│              (Frontend Applications, APIs)               │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                       │
│           (Business Logic, Orchestration)               │
├─────────────────────────────────────────────────────────┤
│                    Domain Layer                          │
│         (Multi-Agent System, Core Entities)             │
├─────────────────────────────────────────────────────────┤
│                Infrastructure Layer                      │
│      (Databases, Message Queues, External APIs)        │
└─────────────────────────────────────────────────────────┘
```

## 2. Component Architecture

### 2.1 Core Components

```mermaid
graph TB
    subgraph "API Gateway"
        GW[FastAPI Gateway]
        Auth[Authentication Service]
        RL[Rate Limiter]
    end
    
    subgraph "Multi-Agent System"
        MA[Master Agent - Abaporu]
        IA[Investigator Agent]
        AA[Analyst Agent]
        RA[Reporter Agent]
        SA[Security Auditor]
        VA[Validator Agent]
        SR[Semantic Router - Senna]
    end
    
    subgraph "ML Pipeline"
        FE[Feature Engineering]
        AD[Anomaly Detection]
        PM[Pattern Matching]
        XAI[Explainability Module]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        RD[(Redis)]
        CD[(ChromaDB)]
        ES[(Elasticsearch)]
    end
    
    GW --> Auth
    GW --> RL
    GW --> MA
    MA --> SR
    SR --> IA
    SR --> AA
    SR --> RA
    IA --> AD
    AA --> PM
    AD --> XAI
    PM --> XAI
```

### 2.2 Agent Architecture

Each agent follows a standardized architecture pattern:

```python
class BaseAgent(ABC):
    """Abstract base class for all agents in the system."""
    
    def __init__(self, name: str, capabilities: List[str]):
        self.name = name
        self.capabilities = capabilities
        self.state = AgentState.IDLE
        self.memory = MemorySystem()
        self.logger = StructuredLogger(agent=name)
    
    @abstractmethod
    async def process(self, message: AgentMessage) -> AgentResponse:
        """Process incoming message and return response."""
        pass
    
    @abstractmethod
    async def reflect(self, result: AgentResponse) -> ReflectionResult:
        """Self-reflection mechanism for continuous improvement."""
        pass
```

## 3. Data Flow Architecture

### 3.1 Request Processing Pipeline

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Router
    participant Agent
    participant ML
    participant DB
    participant Cache
    
    Client->>Gateway: HTTP Request
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: Token Valid
    
    Gateway->>Cache: Check Cache
    Cache-->>Gateway: Cache Miss
    
    Gateway->>Router: Route Request
    Router->>Agent: Assign to Agent
    
    Agent->>ML: Process Data
    ML->>DB: Query Historical Data
    DB-->>ML: Return Data
    
    ML-->>Agent: Analysis Results
    Agent-->>Router: Agent Response
    Router-->>Gateway: Aggregated Response
    
    Gateway->>Cache: Store in Cache
    Gateway-->>Client: HTTP Response
```

### 3.2 Asynchronous Processing

For long-running operations, the system implements an event-driven architecture:

```python
class InvestigationOrchestrator:
    """Orchestrates complex multi-agent investigations."""
    
    async def start_investigation(self, request: InvestigationRequest) -> str:
        # 1. Validate and enqueue
        investigation_id = uuid4()
        await self.queue.enqueue(investigation_id, request)
        
        # 2. Distribute to agents
        tasks = self.create_agent_tasks(request)
        await self.distribute_tasks(tasks)
        
        # 3. Return immediately
        return investigation_id
    
    async def monitor_progress(self, investigation_id: str) -> Progress:
        # Real-time progress tracking
        return await self.state_manager.get_progress(investigation_id)
```

## 4. Scalability Architecture

### 4.1 Horizontal Scaling Strategy

#### Current: Railway Platform

Railway provides automatic scaling based on load:

```yaml
# Procfile - Multi-Service Architecture
# Railway manages resource allocation dynamically

web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 4
worker: celery -A src.infrastructure.queue.celery_app worker --concurrency=4 --queues=critical,high,default,low,background
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info

# Railway Configuration (via Dashboard)
# Each service can be scaled independently:
# - Web: 4 workers (handles ~1000 req/s)
# - Worker: 4 concurrency (processes 4 tasks simultaneously)
# - Beat: 1 instance (scheduler singleton)
```

**Resource Allocation**:
- **Web Service**: 2 vCPU, 4GB RAM
- **Worker Service**: 2 vCPU, 4GB RAM
- **Beat Service**: 1 vCPU, 2GB RAM

**Scaling Limits**:
- **Railway Pro**: Up to 32GB RAM, 32 vCPU per service
- **Auto-restart**: On failure with exponential backoff
- **Zero-downtime**: Rolling deployments

#### Alternative: Kubernetes (Enterprise)

For organizations requiring more control:

```yaml
# Kubernetes Deployment Configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cidadao-ai-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: api
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

### 4.2 Load Distribution

#### Railway Multi-Service Architecture

```mermaid
graph TB
    subgraph "Railway Load Balancer"
        LB[Railway Edge Network<br/>Auto-scaling]
    end

    subgraph "Web Service (4 Uvicorn workers)"
        W1[Worker 1<br/>FastAPI]
        W2[Worker 2<br/>FastAPI]
        W3[Worker 3<br/>FastAPI]
        W4[Worker 4<br/>FastAPI]
    end

    subgraph "Task Queue (Redis)"
        Q1[Critical Queue]
        Q2[High Queue]
        Q3[Default Queue]
        Q4[Low Queue]
        Q5[Background Queue]
    end

    subgraph "Worker Service (4 Celery workers)"
        CW1[Celery Worker 1]
        CW2[Celery Worker 2]
        CW3[Celery Worker 3]
        CW4[Celery Worker 4]
    end

    subgraph "Beat Service"
        Beat[Celery Beat<br/>Scheduler]
    end

    LB --> W1
    LB --> W2
    LB --> W3
    LB --> W4

    W1 --> Q1
    W1 --> Q2
    W1 --> Q3

    Q1 --> CW1
    Q2 --> CW2
    Q3 --> CW3
    Q4 --> CW4
    Q5 --> CW4

    Beat --> Q1
    Beat --> Q2
    Beat --> Q3

    style LB fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px
    style Beat fill:#FF9800,stroke:#E65100,stroke-width:2px
```

**Load Distribution Strategy**:
- **Railway Edge**: Distributes requests across Uvicorn workers
- **Worker Pool**: 4 FastAPI workers handle API requests concurrently
- **Task Distribution**: Redis queue distributes tasks to Celery workers
- **Priority Queues**: Critical tasks processed first
- **Beat Scheduler**: Singleton pattern for scheduled tasks

## 5. Security Architecture

### 5.1 Defense in Depth

```
┌─────────────────────────────────────────┐
│          WAF (Web Application Firewall) │
├─────────────────────────────────────────┤
│          SSL/TLS Termination            │
├─────────────────────────────────────────┤
│          API Gateway Security           │
│    - Rate Limiting                      │
│    - DDoS Protection                    │
│    - IP Whitelisting                   │
├─────────────────────────────────────────┤
│        Authentication Layer             │
│    - JWT Validation                     │
│    - OAuth 2.0                         │
│    - MFA Support                       │
├─────────────────────────────────────────┤
│        Authorization Layer              │
│    - RBAC                              │
│    - Resource-level Permissions        │
├─────────────────────────────────────────┤
│         Application Security            │
│    - Input Validation                  │
│    - SQL Injection Prevention          │
│    - XSS Protection                    │
├─────────────────────────────────────────┤
│          Data Security                  │
│    - Encryption at Rest                │
│    - Encryption in Transit             │
│    - Data Anonymization               │
└─────────────────────────────────────────┘
```

### 5.2 Audit Architecture

```python
class AuditSystem:
    """Comprehensive audit logging system."""
    
    def __init__(self):
        self.logger = StructuredLogger("audit")
        self.storage = AuditStorage()
        self.analyzer = AnomalyAnalyzer()
    
    async def log_event(self, event: AuditEvent) -> None:
        # Enrich event with context
        event.timestamp = datetime.utcnow()
        event.correlation_id = get_correlation_id()
        event.user_context = get_user_context()
        
        # Store immutably
        await self.storage.append(event)
        
        # Real-time analysis
        if await self.analyzer.is_suspicious(event):
            await self.alert_security_team(event)
```

## 6. Performance Architecture

### 6.1 Caching Strategy

```python
class MultiLayerCache:
    """Implements L1/L2/L3 caching strategy."""
    
    def __init__(self):
        self.l1_cache = InMemoryCache(max_size=1000)  # Hot data
        self.l2_cache = RedisCache()                   # Warm data
        self.l3_cache = DatabaseCache()                # Cold data
    
    async def get(self, key: str) -> Optional[Any]:
        # Try L1 first
        if value := self.l1_cache.get(key):
            return value
        
        # Try L2
        if value := await self.l2_cache.get(key):
            self.l1_cache.set(key, value)
            return value
        
        # Try L3
        if value := await self.l3_cache.get(key):
            await self.l2_cache.set(key, value)
            self.l1_cache.set(key, value)
            return value
        
        return None
```

### 6.2 Query Optimization

```sql
-- Optimized query with proper indexing
CREATE INDEX CONCURRENTLY idx_investigations_user_status_created 
ON investigations(user_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- Materialized view for expensive aggregations
CREATE MATERIALIZED VIEW mv_anomaly_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    anomaly_type,
    severity,
    COUNT(*) as count,
    AVG(confidence_score) as avg_confidence
FROM anomalies
GROUP BY 1, 2, 3
WITH DATA;

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_anomaly_statistics;
```

## 7. Resilience Patterns

### 7.1 Circuit Breaker Pattern

```python
class CircuitBreaker:
    """Prevents cascading failures in distributed system."""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise CircuitOpenError("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
```

### 7.2 Retry with Exponential Backoff

```python
class RetryPolicy:
    """Implements intelligent retry logic."""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
    
    async def execute(self, func: Callable) -> Any:
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                return await func()
            except RetryableError as e:
                last_exception = e
                delay = self.base_delay * (2 ** attempt)
                await asyncio.sleep(delay + random.uniform(0, 0.1))
        
        raise MaxRetriesExceeded(f"Failed after {self.max_retries} attempts") from last_exception
```

## 8. Observability Architecture

### 8.1 Metrics Collection

```python
# Prometheus metrics
investigation_duration = Histogram(
    'investigation_duration_seconds',
    'Time spent processing investigations',
    labelnames=['agent', 'anomaly_type']
)

anomalies_detected = Counter(
    'anomalies_detected_total',
    'Total number of anomalies detected',
    labelnames=['type', 'severity']
)

agent_utilization = Gauge(
    'agent_utilization_ratio',
    'Current agent utilization',
    labelnames=['agent_name']
)
```

### 8.2 Distributed Tracing

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class TracedAgent(BaseAgent):
    """Agent with distributed tracing capabilities."""
    
    async def process(self, message: AgentMessage) -> AgentResponse:
        with tracer.start_as_current_span(
            f"{self.name}.process",
            attributes={
                "agent.name": self.name,
                "message.type": message.type,
                "message.id": message.id
            }
        ) as span:
            try:
                result = await self._process_internal(message)
                span.set_status(Status(StatusCode.OK))
                return result
            except Exception as e:
                span.record_exception(e)
                span.set_status(Status(StatusCode.ERROR))
                raise
```

## 9. Deployment Architecture

### 9.1 Container Orchestration

```yaml
# Docker Compose for Development
version: '3.8'
services:
  api:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cidadao
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
      - elasticsearch
    
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    
  elasticsearch:
    image: elasticsearch:8.11.3
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
```

### 9.2 Production Deployment (Railway Platform)

:::tip **Current Production Architecture**
Cidadão.AI runs on **Railway** since October 2024, achieving **99.9% uptime** with multi-service orchestration.

**🔗 Production**: [https://cidadao-api-production.up.railway.app](https://cidadao-api-production.up.railway.app)
:::

```mermaid
graph TB
    subgraph "Internet"
        Users[🌐 Users<br/>Citizens, Analysts, Journalists]
    end

    subgraph "Railway Platform"
        subgraph "Web Service"
            API[FastAPI + Uvicorn<br/>4 workers<br/>PORT: 8000]
        end

        subgraph "Worker Service"
            Worker[Celery Worker<br/>4 concurrency<br/>5 queues]
        end

        subgraph "Beat Service"
            Beat[Celery Beat<br/>Scheduler 6h<br/>24/7 Monitoring]
        end

        subgraph "Managed Databases"
            PG[(PostgreSQL<br/>Supabase<br/>10GB)]
            RD[(Redis<br/>Railway<br/>1GB)]
        end
    end

    subgraph "External Services"
        Portal[Portal da<br/>Transparência]
        Groq[Groq API<br/>LLM]
    end

    Users --> API
    API --> Worker
    Beat --> Worker
    API --> PG
    API --> RD
    Worker --> PG
    Worker --> RD
    Worker --> Portal
    Worker --> Groq

    style API fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style Worker fill:#2196F3,stroke:#1565C0,stroke-width:3px
    style Beat fill:#FF9800,stroke:#E65100,stroke-width:3px
    style PG fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px
    style RD fill:#F44336,stroke:#C62828,stroke-width:2px
```

**Production Specifications**:
- **Platform**: Railway Pro ($20/mês)
- **Services**: 3 (web, worker, beat) via Procfile
- **Database**: Supabase PostgreSQL (10GB)
- **Cache**: Railway Redis (1GB)
- **Monitoring**: Railway built-in + Prometheus metrics
- **CI/CD**: Automatic deployment on push to main
- **Cost**: ~$30/mês total
- **SLA**: 99.9% uptime

### 9.3 Alternative: Kubernetes (Future Consideration)

For organizations requiring more control, Kubernetes deployment is available:

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress"
            NG[NGINX Ingress]
        end

        subgraph "Services"
            API[API Pods]
            WS[WebSocket Pods]
            WK[Worker Pods]
        end

        subgraph "Data"
            PG[PostgreSQL]
            RD[Redis]
            ES[Elasticsearch]
        end
    end

    Internet[Internet] --> NG
    NG --> API
    NG --> WS
    API --> WK
    API --> PG
    API --> RD
    WK --> ES
```

## 10. Future Architecture Considerations

### 10.1 Microservices Migration Path

1. **Phase 1**: Extract authentication service
2. **Phase 2**: Separate agent orchestration
3. **Phase 3**: Independent ML pipeline service
4. **Phase 4**: Dedicated reporting service

### 10.2 Technology Evolution

- **GraphQL Gateway**: For flexible client queries
- **gRPC**: For inter-service communication
- **Apache Kafka**: For event streaming
- **Kubernetes Operators**: For automated management

---

This architectural documentation serves as the authoritative reference for system design decisions, implementation patterns, and future evolution of the Cidadão.AI platform.