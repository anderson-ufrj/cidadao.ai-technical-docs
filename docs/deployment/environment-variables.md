---
title: "Variáveis de Ambiente"
sidebar_position: 1
description: "Guia completo de configuração das variáveis de ambiente do Cidadão.AI"
---

# 🔧 Variáveis de Ambiente

:::warning **Segurança em Primeiro Lugar**
Nunca commite arquivos `.env` com valores reais. Use sempre `.env.example` como template e mantenha secrets seguros em ferramentas como HashiCorp Vault ou AWS Secrets Manager.
:::

## 📋 Visão Geral

O Cidadão.AI utiliza variáveis de ambiente para configuração, seguindo o princípio [12-Factor App](https://12factor.net/). Todas as configurações sensíveis e específicas do ambiente devem ser definidas através de variáveis de ambiente.

## 🏗️ Estrutura de Configuração

```
projeto/
├── .env                 # Arquivo local (nunca comitar!)
├── .env.example         # Template com valores de exemplo
├── .env.development     # Configurações de desenvolvimento
├── .env.staging        # Configurações de staging
├── .env.production     # Configurações de produção
└── .gitignore          # Deve incluir .env*
```

## 🔐 Segurança e Autenticação

### JWT e Secrets

```bash
# JWT Configuration (OBRIGATÓRIO)
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
# Exemplo: JWT_SECRET_KEY=$(openssl rand -hex 32)

# General Secret Key (OBRIGATÓRIO)
SECRET_KEY=your-general-secret-key-here
# Usado para CSRF, sessões, etc.

# API Secret Key (OBRIGATÓRIO)
API_SECRET_KEY=your-api-secret-key-here
# Para autenticação de API interna
```

### Tokens e Sessões

```bash
# Duração do token de acesso (minutos)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Duração do token de refresh (dias)
REFRESH_TOKEN_EXPIRE_DAYS=7

# Configurações de sessão
SESSION_COOKIE_SECURE=true  # HTTPS only em produção
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict
```

### OAuth2 Providers

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# GitHub OAuth2
GITHUB_CLIENT_ID=Iv1.your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Microsoft Azure AD
MICROSOFT_CLIENT_ID=your-application-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common

# Gov.BR Login Único
GOVBR_CLIENT_ID=your-client-id
GOVBR_CLIENT_SECRET=your-client-secret
GOVBR_ENVIRONMENT=production  # ou staging
```

## 🌐 APIs Externas

### Portal da Transparência

```bash
# API do Portal da Transparência (OBRIGATÓRIO)
TRANSPARENCY_API_KEY=your-transparency-api-key
TRANSPARENCY_API_URL=https://api.portaldatransparencia.gov.br/v2
TRANSPARENCY_API_TIMEOUT=30
TRANSPARENCY_API_RETRY_COUNT=3
```

### Providers de IA/LLM

```bash
# Groq (Recomendado - Fast inference)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=mixtral-8x7b-32768

# OpenAI (Alternativa)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=4000

# Anthropic Claude (Opcional)
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-opus-20240229

# HuggingFace (Para modelos locais)
HUGGINGFACE_API_TOKEN=your-hf-token
HUGGINGFACE_MODEL_ID=neuralthinker/cidadao-ai-llm
```

## 💾 Banco de Dados

### PostgreSQL

```bash
# URL completa de conexão (OBRIGATÓRIO)
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname

# Ou componentes separados
POSTGRES_USER=cidadao_ai
POSTGRES_PASSWORD=your-secure-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cidadao_ai

# Pool de conexões
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### Redis

```bash
# URL de conexão (OBRIGATÓRIO para cache)
REDIS_URL=redis://localhost:6379/0

# Ou componentes separados
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your-redis-password  # Opcional

# Configurações de cache
CACHE_TTL=3600  # 1 hora
CACHE_KEY_PREFIX=cidadao:
```

### Vector Database

```bash
# ChromaDB (para embeddings)
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
CHROMADB_COLLECTION=cidadao_embeddings

# Ou Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=cidadao_vectors
```

## 🚀 Configuração da Aplicação

### Ambiente e Debug

```bash
# Ambiente (OBRIGATÓRIO)
APP_ENV=development  # development, staging, production

# Debug mode (NUNCA true em produção!)
DEBUG=true  # development only

# Nome da aplicação
APP_NAME="Cidadão.AI"
APP_VERSION=1.0.0
```

### Servidor

```bash
# Configuração do servidor
HOST=0.0.0.0
PORT=7860  # Padrão HuggingFace Spaces

# Workers (produção)
WEB_CONCURRENCY=4
WORKERS_PER_CORE=2
MAX_WORKERS=8

# Timeouts
REQUEST_TIMEOUT=60
GRACEFUL_TIMEOUT=30
```

### CORS

```bash
# Origins permitidas (separadas por vírgula)
ALLOWED_ORIGINS=http://localhost:3000,https://app.cidadao.ai

# Headers permitidos
ALLOWED_HEADERS=Content-Type,Authorization,X-Request-ID

# Métodos permitidos
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Credenciais
ALLOW_CREDENTIALS=true
```

## 📊 Monitoramento e Logs

### Métricas

```bash
# Prometheus metrics
ENABLE_METRICS=true
METRICS_PORT=9090
METRICS_PATH=/metrics

# OpenTelemetry
OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:14268/api/traces
OTEL_SERVICE_NAME=cidadao-ai-backend
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling
```

### Logging

```bash
# Nível de log
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL

# Formato de log
LOG_FORMAT=json  # json ou plain
STRUCTURED_LOGGING=true

# Arquivo de log (opcional)
LOG_FILE=/var/log/cidadao-ai/app.log
LOG_FILE_MAX_SIZE=100MB
LOG_FILE_BACKUP_COUNT=5

# Sentry (error tracking)
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## ☁️ Deploy e Cloud

### HuggingFace Spaces

```bash
# Configurações específicas do HF Spaces
SPACE_ID=neural-thinker/cidadao-ai-backend
HF_HOME=/data
GRADIO_SERVER_NAME=0.0.0.0
GRADIO_SERVER_PORT=7860
```

### Docker

```bash
# Nome do projeto Docker Compose
COMPOSE_PROJECT_NAME=cidadao-ai

# Registry
DOCKER_REGISTRY=ghcr.io
DOCKER_IMAGE=ghcr.io/anderson-ufrj/cidadao-ai-backend
```

### AWS

```bash
# S3 para storage
STORAGE_TYPE=s3
S3_BUCKET=cidadao-ai-storage
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT_URL=https://s3.amazonaws.com  # Ou MinIO

# CloudWatch logs
CLOUDWATCH_LOG_GROUP=/aws/ecs/cidadao-ai
CLOUDWATCH_LOG_STREAM=backend
```

## 🔧 Features Opcionais

### Background Tasks

```bash
# Celery configuration
ENABLE_BACKGROUND_TASKS=true
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CELERY_TASK_SERIALIZER=json
CELERY_ACCEPT_CONTENT=json
CELERY_TIMEZONE=America/Sao_Paulo
```

### Email

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@cidadao.ai
SMTP_PASSWORD=your-app-specific-password
SMTP_USE_TLS=true
EMAIL_FROM=Cidadão.AI <no-reply@cidadao.ai>
```

### Feature Flags

```bash
# Funcionalidades experimentais
ENABLE_WEBSOCKET=true
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOG=true
ENABLE_MULTI_AGENT_V2=false
ENABLE_ML_PIPELINE=true
```

## 🧪 Desenvolvimento

### Banco de Dados de Teste

```bash
# Banco separado para testes
TEST_DATABASE_URL=postgresql+asyncpg://test:test@localhost:5432/cidadao_test
TEST_REDIS_URL=redis://localhost:6379/15
```

### Ferramentas de Dev

```bash
# Hot reload
HOT_RELOAD=true
RELOAD_DIRS=src,tests

# Auto migrations
AUTO_MIGRATE=true

# Debug tools
ENABLE_DEBUG_TOOLBAR=true
ENABLE_SQL_ECHO=false  # Log todas as queries SQL
```

## 📝 Validação de Configuração

### Script de Validação

```python
# scripts/validate_env.py
import os
import sys

REQUIRED_VARS = [
    "JWT_SECRET_KEY",
    "DATABASE_URL",
    "REDIS_URL",
    "TRANSPARENCY_API_KEY",
    "GROQ_API_KEY"
]

PRODUCTION_REQUIRED = [
    "SENTRY_DSN",
    "ENABLE_METRICS",
    "LOG_LEVEL"
]

def validate_env():
    missing = []
    
    # Verificar variáveis obrigatórias
    for var in REQUIRED_VARS:
        if not os.getenv(var):
            missing.append(var)
    
    # Em produção, verificar extras
    if os.getenv("APP_ENV") == "production":
        for var in PRODUCTION_REQUIRED:
            if not os.getenv(var):
                missing.append(var)
        
        # Verificar segurança
        if os.getenv("DEBUG") == "true":
            print("❌ DEBUG não pode ser true em produção!")
            sys.exit(1)
    
    if missing:
        print(f"❌ Variáveis faltando: {', '.join(missing)}")
        sys.exit(1)
    
    print("✅ Configuração válida!")

if __name__ == "__main__":
    validate_env()
```

## 🔒 Segurança de Secrets

### HashiCorp Vault

```bash
# Vault integration
VAULT_ENABLED=true
VAULT_URL=http://localhost:8200
VAULT_TOKEN=your-vault-token
VAULT_PATH=secret/cidadao-ai
VAULT_MOUNT_POINT=secret
```

### AWS Secrets Manager

```bash
# AWS Secrets Manager
SECRETS_MANAGER_ENABLED=true
AWS_DEFAULT_REGION=us-east-1
SECRETS_PREFIX=cidadao-ai/
```

### Rotação de Secrets

```bash
# Rotação automática
SECRET_ROTATION_ENABLED=true
SECRET_ROTATION_DAYS=90
SECRET_ROTATION_WEBHOOK=https://api.cidadao.ai/internal/rotate-secrets
```

## 🚀 Exemplos por Ambiente

### Development (.env.development)

```bash
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql+asyncpg://dev:dev@localhost:5432/cidadao_dev
REDIS_URL=redis://localhost:6379/0
HOT_RELOAD=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:7860
```

### Staging (.env.staging)

```bash
APP_ENV=staging
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql+asyncpg://user:pass@staging-db.aws.com:5432/cidadao_staging
REDIS_URL=redis://staging-redis.aws.com:6379/0
ENABLE_METRICS=true
SENTRY_DSN=https://key@sentry.io/staging-project
```

### Production (.env.production)

```bash
APP_ENV=production
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db.aws.com:5432/cidadao_prod
REDIS_URL=redis://prod-redis.aws.com:6379/0
ENABLE_METRICS=true
SENTRY_DSN=https://key@sentry.io/prod-project
WEB_CONCURRENCY=8
SECRET_ROTATION_ENABLED=true
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **KeyError: 'JWT_SECRET_KEY'**
   - Certifique-se de que o arquivo `.env` existe
   - Verifique se a variável está definida
   - Use `python -m scripts.validate_env`

2. **Database connection refused**
   - Verifique se PostgreSQL está rodando
   - Confirme host/porta/credenciais
   - Teste com `psql $DATABASE_URL`

3. **Redis connection error**
   - Verifique se Redis está rodando
   - Teste com `redis-cli ping`
   - Confirme senha se configurada

---

**Próximo:** [Guia de Deploy →](./deployment-guide.md)