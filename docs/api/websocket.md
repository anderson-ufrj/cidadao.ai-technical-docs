---
title: "API WebSocket"
sidebar_position: 5
description: "Documentação completa da API WebSocket para comunicação em tempo real"
---

# 🔌 API WebSocket

:::info **Comunicação em Tempo Real**
O Cidadão.AI oferece uma API WebSocket completa para atualizações em tempo real de investigações, análises de agentes e notificações do sistema.
:::

## 🎯 Visão Geral

A API WebSocket permite:
- **Atualizações ao vivo** de investigações em andamento
- **Streaming de análises** dos agentes
- **Notificações push** de eventos importantes
- **Chat interativo** com agentes
- **Monitoramento real-time** de métricas

## 🔗 Endpoints WebSocket

### 1. **Conexão Principal**
```
wss://api.cidadao.ai/ws?token={jwt_token}&connection_type={type}
```

**Parâmetros Query:**
- `token` (obrigatório): JWT token de autenticação
- `connection_type` (opcional): Tipo de conexão
  - `general` (padrão): Conexão geral
  - `investigation`: Foco em investigações
  - `analysis`: Foco em análises
  - `notifications`: Apenas notificações

### 2. **Investigação Específica**
```
wss://api.cidadao.ai/ws/investigations/{investigation_id}?token={jwt_token}
```

Recebe atualizações apenas da investigação especificada.

### 3. **Chat com Agentes**
```
wss://api.cidadao.ai/ws/chat?token={jwt_token}&agent={agent_type}
```

Chat interativo com um agente específico.

## 📨 Formato de Mensagens

### Estrutura Base

```typescript
interface WebSocketMessage {
  type: string;          // Tipo da mensagem
  data: object;          // Dados da mensagem
  timestamp: string;     // ISO 8601 timestamp
  user_id?: string;      // ID do usuário (opcional)
  correlation_id?: string; // ID para correlacionar request/response
}
```

### Tipos de Mensagem

#### 1. **connection_established**
```json
{
  "type": "connection_established",
  "data": {
    "message": "WebSocket connection established",
    "user_id": "user_123",
    "connection_type": "general",
    "server_time": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. **investigation_update**
```json
{
  "type": "investigation_update",
  "data": {
    "investigation_id": "inv_789",
    "status": "processing",
    "progress": 45,
    "current_agent": "zumbi",
    "message": "Analisando anomalias em contratos..."
  },
  "timestamp": "2024-01-15T10:31:00Z"
}
```

#### 3. **agent_analysis**
```json
{
  "type": "agent_analysis",
  "data": {
    "agent": "anita",
    "analysis_type": "pattern_detection",
    "findings": [
      {
        "pattern": "price_manipulation",
        "confidence": 0.87,
        "evidence_count": 12
      }
    ],
    "status": "completed"
  },
  "timestamp": "2024-01-15T10:32:00Z"
}
```

#### 4. **error**
```json
{
  "type": "error",
  "data": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: investigation_id",
    "details": {
      "field": "investigation_id",
      "required": true
    }
  },
  "timestamp": "2024-01-15T10:33:00Z"
}
```

## 🔄 Fluxo de Comunicação

### Cliente → Servidor

#### 1. **Iniciar Investigação**
```json
{
  "type": "start_investigation",
  "data": {
    "query": "Contratos emergenciais COVID-19 2020",
    "filters": {
      "date_range": "2020-01-01/2020-12-31",
      "min_value": 1000000
    },
    "agents": ["zumbi", "anita", "tiradentes"]
  }
}
```

#### 2. **Subscrever a Eventos**
```json
{
  "type": "subscribe",
  "data": {
    "events": ["investigation_update", "agent_analysis"],
    "investigation_ids": ["inv_123", "inv_456"]
  }
}
```

#### 3. **Chat com Agente**
```json
{
  "type": "agent_chat",
  "data": {
    "agent": "abaporu",
    "message": "Quais são os principais riscos encontrados?",
    "context": {
      "investigation_id": "inv_789"
    }
  }
}
```

### Servidor → Cliente

#### 1. **Progress Update**
```json
{
  "type": "progress_update",
  "data": {
    "investigation_id": "inv_789",
    "overall_progress": 65,
    "stages": {
      "data_collection": 100,
      "anomaly_detection": 80,
      "pattern_analysis": 60,
      "report_generation": 0
    }
  }
}
```

#### 2. **Real-time Metrics**
```json
{
  "type": "metrics_update",
  "data": {
    "active_investigations": 42,
    "agents_busy": 8,
    "avg_response_time": 2.3,
    "queue_size": 15
  }
}
```

## 💻 Implementação Cliente

### JavaScript/TypeScript

```typescript
class CidadaoWebSocket {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private token: string) {}
  
  connect(connectionType: string = 'general') {
    const wsUrl = `wss://api.cidadao.ai/ws?token=${this.token}&connection_type=${connectionType}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.setupHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.handleDisconnect();
    };
  }
  
  send(type: string, data: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
        correlation_id: this.generateCorrelationId()
      };
      this.ws.send(JSON.stringify(message));
    }
  }
  
  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'investigation_update':
        this.onInvestigationUpdate(message.data);
        break;
      case 'agent_analysis':
        this.onAgentAnalysis(message.data);
        break;
      case 'error':
        this.onError(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  private setupHeartbeat() {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // 30 seconds
  }
  
  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }
  
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Event handlers
  onInvestigationUpdate(data: any) {
    // Override in implementation
  }
  
  onAgentAnalysis(data: any) {
    // Override in implementation
  }
  
  onError(data: any) {
    // Override in implementation
  }
}

// Uso
const ws = new CidadaoWebSocket(authToken);
ws.connect('investigation');

ws.onInvestigationUpdate = (data) => {
  console.log('Investigation update:', data);
  updateUI(data);
};

// Enviar mensagem
ws.send('start_investigation', {
  query: 'Contratos suspeitos 2024'
});
```

### Python

```python
import asyncio
import json
import websockets
from datetime import datetime
from typing import Optional, Callable, Dict, Any

class CidadaoWebSocketClient:
    def __init__(self, token: str, base_url: str = "wss://api.cidadao.ai"):
        self.token = token
        self.base_url = base_url
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.running = False
        self.handlers: Dict[str, Callable] = {}
        
    async def connect(self, connection_type: str = "general"):
        """Estabelece conexão WebSocket"""
        url = f"{self.base_url}/ws?token={self.token}&connection_type={connection_type}"
        
        try:
            self.ws = await websockets.connect(url)
            self.running = True
            
            # Tarefas concorrentes
            await asyncio.gather(
                self._receive_messages(),
                self._heartbeat()
            )
            
        except Exception as e:
            print(f"Erro de conexão: {e}")
            await self._reconnect()
    
    async def send(self, message_type: str, data: Dict[str, Any]):
        """Envia mensagem para o servidor"""
        if self.ws and not self.ws.closed:
            message = {
                "type": message_type,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.ws.send(json.dumps(message))
    
    async def _receive_messages(self):
        """Recebe e processa mensagens"""
        async for message in self.ws:
            try:
                data = json.loads(message)
                await self._handle_message(data)
            except json.JSONDecodeError:
                print(f"Mensagem inválida: {message}")
    
    async def _handle_message(self, message: Dict[str, Any]):
        """Processa mensagem recebida"""
        msg_type = message.get("type")
        handler = self.handlers.get(msg_type)
        
        if handler:
            await handler(message.get("data", {}))
        else:
            print(f"Tipo de mensagem não tratado: {msg_type}")
    
    async def _heartbeat(self):
        """Mantém conexão ativa"""
        while self.running:
            await asyncio.sleep(30)
            await self.send("ping", {})
    
    def on(self, message_type: str, handler: Callable):
        """Registra handler para tipo de mensagem"""
        self.handlers[message_type] = handler
    
    async def start_investigation(self, query: str, **kwargs):
        """Inicia nova investigação"""
        await self.send("start_investigation", {
            "query": query,
            **kwargs
        })
    
    async def subscribe_to_investigation(self, investigation_id: str):
        """Subscreve a atualizações de investigação"""
        await self.send("subscribe", {
            "events": ["investigation_update"],
            "investigation_ids": [investigation_id]
        })

# Exemplo de uso
async def main():
    client = CidadaoWebSocketClient(token="your_jwt_token")
    
    # Registrar handlers
    client.on("investigation_update", lambda data: print(f"Update: {data}"))
    client.on("agent_analysis", lambda data: print(f"Analysis: {data}"))
    
    # Conectar
    await client.connect("investigation")
    
    # Iniciar investigação
    await client.start_investigation(
        query="Contratos emergenciais 2024",
        filters={"min_value": 1000000}
    )

if __name__ == "__main__":
    asyncio.run(main())
```

## 🔐 Segurança

### Autenticação

1. **JWT Token Required**
   - Token deve ser válido e não expirado
   - Incluído como query parameter na URL
   - Validado antes de aceitar conexão

2. **Reconexão com Novo Token**
   ```javascript
   // Quando token expira
   ws.close();
   const newToken = await refreshToken();
   ws = new WebSocket(`wss://api.cidadao.ai/ws?token=${newToken}`);
   ```

### Rate Limiting

```yaml
WebSocket Limits:
  - Conexões por usuário: 5
  - Mensagens por minuto: 100
  - Tamanho máximo mensagem: 64KB
  - Timeout inatividade: 5 minutos
```

### Validação de Mensagens

```python
# Servidor valida todas mensagens
def validate_message(message: dict) -> bool:
    # Verificar estrutura
    if not all(k in message for k in ["type", "data"]):
        return False
    
    # Verificar tamanho
    if len(json.dumps(message)) > 65536:  # 64KB
        return False
    
    # Verificar tipo válido
    if message["type"] not in VALID_MESSAGE_TYPES:
        return False
    
    return True
```

## 📊 Monitoramento

### Métricas WebSocket

```promql
# Conexões ativas
cidadao_ai_websocket_connections_active

# Mensagens por segundo
rate(cidadao_ai_websocket_messages_total[1m])

# Erros de WebSocket
rate(cidadao_ai_websocket_errors_total[5m])

# Latência de mensagens
histogram_quantile(0.95, cidadao_ai_websocket_message_duration_seconds)
```

### Logs de Debug

```python
# Ativar logs detalhados
import logging
logging.getLogger('websockets').setLevel(logging.DEBUG)
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. **Conexão Recusada (1008)**
```yaml
Erro: "WebSocket closed: 1008 Authentication required"
Solução: 
  - Verificar token JWT válido
  - Token não expirado
  - Token incluído na URL
```

#### 2. **Timeout de Conexão**
```yaml
Erro: "WebSocket connection timeout"
Solução:
  - Implementar heartbeat/ping
  - Verificar firewall/proxy
  - Aumentar timeout do cliente
```

#### 3. **Mensagens Perdidas**
```yaml
Problema: Mensagens não chegam ao cliente
Solução:
  - Implementar acknowledgment
  - Usar correlation_id
  - Buffer de mensagens no servidor
```

### Códigos de Fechamento

| Código | Significado | Ação Recomendada |
|--------|------------|------------------|
| 1000 | Normal closure | Nenhuma |
| 1001 | Going away | Reconectar |
| 1006 | Abnormal closure | Reconectar com backoff |
| 1008 | Policy violation | Verificar autenticação |
| 1011 | Internal error | Reportar bug |
| 1013 | Try again later | Reconectar após delay |

## 🚀 Best Practices

### 1. **Reconexão Automática**
- Implementar backoff exponencial
- Limitar tentativas de reconexão
- Preservar estado durante reconexão

### 2. **Gestão de Estado**
- Manter fila de mensagens pendentes
- Sincronizar estado após reconexão
- Implementar deduplicação

### 3. **Performance**
- Comprimir mensagens grandes
- Batching de atualizações
- Throttling no cliente

### 4. **Error Handling**
- Sempre tratar erros de conexão
- Fallback para polling se necessário
- Notificar usuário de problemas

---

**Anterior:** [API Reference](./api-reference.md)  
**Próximo:** [Variáveis de Ambiente →](../deployment/environment-variables.md)