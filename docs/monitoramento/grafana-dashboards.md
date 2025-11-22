---
title: "Dashboards Grafana"
sidebar_position: 2
description: "Guia completo dos dashboards de monitoramento do Cidadão.AI"
---

# 📊 Dashboards Grafana

## 🎯 Visão Geral

O Cidadão.AI fornece 5 dashboards principais no Grafana para monitoramento completo do sistema:

1. **Overview Dashboard** - Visão executiva
2. **Agents Performance** - Performance de agentes
3. **Infrastructure** - Métricas de infraestrutura
4. **API Analytics** - Análise detalhada de APIs
5. **Investigations Insights** - Insights de investigações

## 🖥️ Overview Dashboard

### Painéis Principais

#### 1. **Status Geral do Sistema**
```promql
# Uptime
(time() - process_start_time_seconds{job="cidadao-backend"})

# Health Score (custom)
(1 - rate(cidadao_ai_requests_total{status_code=~"5.."}[5m])) * 100
```

#### 2. **Taxa de Requisições**
```promql
# RPS total
sum(rate(cidadao_ai_requests_total[5m]))

# Por endpoint
sum by (endpoint) (rate(cidadao_ai_requests_total[5m]))
```

#### 3. **Latência de Resposta**
```promql
# P50, P95, P99
histogram_quantile(0.50, rate(cidadao_ai_request_duration_seconds_bucket[5m]))
histogram_quantile(0.95, rate(cidadao_ai_request_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(cidadao_ai_request_duration_seconds_bucket[5m]))
```

#### 4. **Taxa de Erro**
```promql
# Taxa de erro global
sum(rate(cidadao_ai_requests_total{status_code=~"5.."}[5m])) 
/ sum(rate(cidadao_ai_requests_total[5m])) * 100
```

### Layout do Dashboard
```
+------------------------+------------------------+
|    System Health       |    Active Users        |
|    ✅ Operational      |    👥 127             |
+------------------------+------------------------+
|         Request Rate (last 24h)                 |
|    📈 [Graph showing RPS over time]             |
+-------------------------------------------------+
| Latency P95  | Error Rate | Uptime    | Alerts  |
| 145ms       | 0.02%      | 99.98%    | 0 🟢   |
+-------------------------------------------------+
```

## 🤖 Agents Performance Dashboard

### Métricas por Agente

#### 1. **Taxa de Execução**
```promql
# Execuções por agente
sum by (agent_type) (
  rate(cidadao_ai_agent_tasks_total[5m])
)
```

#### 2. **Taxa de Sucesso**
```promql
# Success rate por agente
sum by (agent_type) (
  rate(cidadao_ai_agent_tasks_total{status="success"}[5m])
) / sum by (agent_type) (
  rate(cidadao_ai_agent_tasks_total[5m])
) * 100
```

#### 3. **Tempo de Processamento**
```promql
# P95 por tipo de tarefa
histogram_quantile(0.95,
  sum by (agent_type, task_type, le) (
    rate(cidadao_ai_agent_task_duration_seconds_bucket[5m])
  )
)
```

#### 4. **Heatmap de Performance**
```promql
# Distribuição de latência
sum by (le) (
  increase(cidadao_ai_agent_task_duration_seconds_bucket[1h])
)
```

### Painéis Específicos

#### Zumbi - Anomaly Detector
```
┌─────────────────────────────────┐
│ Anomalias Detectadas (24h)      │
│ 🔍 234 total                    │
│ 🔴 45 críticas                  │
│ 🟡 89 altas                     │
│ 🟢 100 médias                   │
└─────────────────────────────────┘
```

#### Anita - Pattern Analyzer
```
┌─────────────────────────────────┐
│ Padrões Identificados           │
│ 📊 Sobrepreço: 23               │
│ 📊 Direcionamento: 12           │
│ 📊 Fracionamento: 8             │
│ 📊 Cartel: 3                    │
└─────────────────────────────────┘
```

## 🖥️ Infrastructure Dashboard

### System Metrics

#### 1. **CPU Usage**
```promql
# CPU por container
rate(container_cpu_usage_seconds_total[5m]) * 100

# CPU sistema total
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

#### 2. **Memory Usage**
```promql
# Memória por container
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Memória sistema
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

#### 3. **Disk I/O**
```promql
# Read/Write rates
rate(node_disk_read_bytes_total[5m])
rate(node_disk_written_bytes_total[5m])
```

#### 4. **Network Traffic**
```promql
# In/Out bandwidth
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

### Database Metrics

#### PostgreSQL Performance
```
┌─────────────────────────┬─────────────────────────┐
│ Active Connections      │ Query Performance       │
│ 📊 [Gauge: 45/100]     │ 📈 [Line graph]         │
├─────────────────────────┼─────────────────────────┤
│ Cache Hit Rate         │ Transaction Rate        │
│ 📊 [Gauge: 94%]        │ 📈 [Area chart]         │
└─────────────────────────┴─────────────────────────┘
```

#### Redis Performance
```
┌─────────────────────────┬─────────────────────────┐
│ Operations/sec          │ Hit Rate                │
│ 📈 2.3k ops/s          │ 📊 87%                  │
├─────────────────────────┼─────────────────────────┤
│ Memory Usage           │ Evicted Keys            │
│ 📊 423MB/1GB           │ 📈 0 keys/min           │
└─────────────────────────┴─────────────────────────┘
```

## 📡 API Analytics Dashboard

### Endpoint Analysis

#### 1. **Top Endpoints**
```promql
# Top 10 endpoints por volume
topk(10,
  sum by (endpoint) (
    increase(cidadao_ai_requests_total[1h])
  )
)
```

#### 2. **Slowest Endpoints**
```promql
# Top 5 endpoints mais lentos (P95)
topk(5,
  histogram_quantile(0.95,
    sum by (endpoint, le) (
      rate(cidadao_ai_request_duration_seconds_bucket[5m])
    )
  )
)
```

#### 3. **Error Distribution**
```promql
# Erros por endpoint e status code
sum by (endpoint, status_code) (
  increase(cidadao_ai_requests_total{status_code=~"4..|5.."}[1h])
)
```

### API Usage Patterns
```
┌─────────────────────────────────────────────────┐
│            Hourly Request Distribution          │
│  00h ████                                       │
│  06h ████████                                   │
│  09h ████████████████████                       │
│  12h ████████████████████████                   │
│  15h ████████████████████████████               │
│  18h ████████████████                           │
│  21h ████████                                   │
└─────────────────────────────────────────────────┘
```

## 🔍 Investigations Insights Dashboard

### Investigation Metrics

#### 1. **Volume de Investigações**
```promql
# Total por tipo
sum by (investigation_type) (
  increase(cidadao_ai_investigations_total[24h])
)
```

#### 2. **Tempo de Conclusão**
```promql
# Distribuição de tempo
histogram_quantile(0.5,
  rate(cidadao_ai_investigation_duration_seconds_bucket[24h])
)
```

#### 3. **Findings por Categoria**
```
┌─────────────────────────────────────┐
│     Descobertas por Categoria       │
├─────────────────────────────────────┤
│ 🔴 Sobrepreço         45%  ████████│
│ 🟡 Direcionamento     25%  █████   │
│ 🟠 Fracionamento      20%  ████    │
│ 🟢 Outros             10%  ██      │
└─────────────────────────────────────┘
```

#### 4. **Confidence Score Distribution**
```
┌─────────────────────────────────────┐
│    Distribuição de Confiança        │
├─────────────────────────────────────┤
│ 90-100%  ████████████ 156          │
│ 80-89%   ████████ 98               │
│ 70-79%   ████ 45                   │
│ <70%     ██ 23                     │
└─────────────────────────────────────┘
```

## 🎨 Customização de Dashboards

### Variáveis de Template

```yaml
# Variables configuradas
- datasource: Prometheus
- environment: prod, staging, dev
- agent_type: all, zumbi, anita, tiradentes, etc
- time_range: 5m, 15m, 1h, 6h, 24h, 7d
```

### Anotações

```yaml
# Marcadores de eventos
- Deployments
- Incidents
- Maintenance windows
- Feature releases
```

### Temas e Aparência

```json
{
  "theme": "dark",
  "refresh": "10s",
  "timezone": "America/Sao_Paulo",
  "panels": {
    "transparent": true,
    "grid_threshold": 0.1
  }
}
```

## 🔧 Importar Dashboards

### Via UI
1. Acesse Grafana em http://localhost:3000
2. Click em "+" → "Import"
3. Upload JSON ou cole o ID
4. Configure data source
5. Click "Import"

### Via API
```bash
# Importar dashboard via API
curl -X POST http://admin:cidadao123@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @dashboards/overview.json
```

### Via Provisioning
```yaml
# grafana/provisioning/dashboards/default.yml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Cidadão.AI'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

## 📱 Alertas no Grafana

### Configurar Alertas

```yaml
# Exemplo: Alta latência
- alert: HighAPILatency
  expr: |
    histogram_quantile(0.95,
      rate(cidadao_ai_request_duration_seconds_bucket[5m])
    ) > 1
  for: 5m
  annotations:
    summary: "API latency P95 > 1s"
    runbook_url: "https://docs.cidadao.ai/runbooks/high-latency"
```

### Canais de Notificação
- Email
- Slack
- PagerDuty
- Webhook
- Microsoft Teams

## 🚀 Best Practices

### 1. **Organização**
- Use folders para agrupar dashboards
- Nomeação consistente
- Tags descritivas
- Versioning de dashboards

### 2. **Performance**
- Limite time ranges
- Use recording rules
- Cache queries repetitivas
- Optimize panel refresh rates

### 3. **Usabilidade**
- Drill-down navigation
- Contextual links
- Tooltips informativos
- Responsive layouts

---

**Anterior:** [Overview de Monitoramento](./overview.md)  
**Próximo:** [Configuração de Alertas →](./alerts.md)