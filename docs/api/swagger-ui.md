---
title: "Swagger UI - API Interativa"
sidebar_position: 4
description: "Interface interativa da API do Cidadão.AI"
---

# 🔌 Swagger UI - API Interativa

Explore e teste todos os endpoints da API do Cidadão.AI diretamente no navegador.

## 📊 Interface Interativa

A API do Cidadão.AI possui Swagger UI nativo integrado. Acesse a interface interativa completa diretamente no backend:

<div style={{padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #0ea5e9'}}>
  <h3 style={{margin: '0 0 15px 0', color: '#0369a1'}}>🚀 Swagger UI Oficial</h3>
  <p style={{margin: '0 0 15px 0'}}>
    Acesse a interface interativa completa da API em produção:
  </p>
  <a
    href="https://cidadao-api-production.up.railway.app/docs"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-block',
      padding: '12px 24px',
      background: '#0ea5e9',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: 'bold'
    }}
  >
    📖 Abrir Swagger UI Interativo →
  </a>
</div>

:::tip Dica
Na interface Swagger UI, você pode testar diretamente todos os endpoints. Clique em "Try it out" para fazer requisições reais à API em produção.
:::

## 🚀 Links Diretos

- **🌐 Swagger UI (Produção)**: [https://cidadao-api-production.up.railway.app/docs](https://cidadao-api-production.up.railway.app/docs)
- **📋 ReDoc (Produção)**: [https://cidadao-api-production.up.railway.app/redoc](https://cidadao-api-production.up.railway.app/redoc)
- **📄 OpenAPI Spec (JSON)**: [https://cidadao-api-production.up.railway.app/openapi.json](https://cidadao-api-production.up.railway.app/openapi.json)
- **📚 Redoc Externo**: [Documentação Alternativa](https://redocly.github.io/redoc/?url=https://cidadao-api-production.up.railway.app/openapi.json)

## 🔑 Autenticação

Para testar endpoints protegidos:

1. **Obtenha um token JWT** via `/auth/login`
2. **Configure Authorization**: `Bearer <seu-token>`
3. **Teste os endpoints** protegidos

## 📈 Endpoints Principais

### 🔍 Investigações
- `POST /investigations/start` - Iniciar investigação
- `GET /investigations/{id}` - Status da investigação
- `GET /investigations/{id}/results` - Resultados

### 🤖 Agentes
- `GET /agents` - Lista todos os agentes
- `POST /agents/{name}/query` - Consultar agente específico
- `GET /agents/{name}/status` - Status do agente

### 📊 Análises
- `POST /analysis/contracts` - Análise de contratos
- `POST /analysis/expenses` - Análise de despesas
- `GET /analysis/{id}/report` - Relatório da análise