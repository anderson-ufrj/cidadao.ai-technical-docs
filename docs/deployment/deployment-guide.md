---
title: "Guia de Deploy"
sidebar_position: 2
description: "Guia completo para deploy do Cidadão.AI em diferentes ambientes"
---

# 🚀 Guia de Deploy

:::info **Opções de Deploy**
O Cidadão.AI pode ser implantado em várias plataformas: **Railway** (produção atual), Docker local, AWS/GCP/Azure, ou servidores próprios. Este guia cobre todas as opções.
:::

## 📋 Pré-requisitos

### Requisitos Mínimos

```yaml
CPU: 2 vCPUs
RAM: 4GB (8GB recomendado)
Storage: 20GB SSD
OS: Ubuntu 20.04+ ou equivalente
```

### Dependências

```bash
# Sistema
- Python 3.10+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (opcional)
- Git

# Python packages
- FastAPI
- SQLAlchemy
- Celery
- Prometheus Client
```

## 🐳 Deploy com Docker

### 1. Build da Imagem

```bash
# Clone o repositório
git clone https://github.com/anderson-ufrj/cidadao.ai-backend.git
cd cidadao.ai-backend

# Build da imagem
docker build -t cidadao-ai-backend:latest .

# Ou use o Makefile
make docker-build
```

### 2. Docker Compose - Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: cidadao-ai-backend:latest
    ports:
      - "7860:7860"
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/cidadao_ai
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src  # Hot reload

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=cidadao_ai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. Docker Compose - Produção

```bash
# Usar compose de produção com monitoramento
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
```

### 4. Configuração Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.cidadao.ai;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cidadao.ai;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.cidadao.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cidadao.ai/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Proxy to backend
    location / {
        proxy_pass http://localhost:7860;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:7860;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🚂 Deploy no Railway (Produção Atual)

:::tip **Plataforma de Produção**
O Cidadão.AI roda em produção no **Railway** desde outubro de 2024, com 99.9% de uptime e suporte completo a Celery + Beat para monitoramento 24/7.

**🔗 API de Produção**: [https://cidadao-api-production.up.railway.app](https://cidadao-api-production.up.railway.app)
:::

### 1. Arquitetura Multi-Serviço

O Railway executa **3 serviços** simultâneos via Procfile:

```mermaid
graph LR
    subgraph "Railway Project"
        Web[Web Service<br/>FastAPI + Uvicorn<br/>PORT dinâmico]
        Worker[Worker Service<br/>Celery Worker<br/>4 concurrency]
        Beat[Beat Service<br/>Celery Beat<br/>Schedule 6h]

        PG[(PostgreSQL<br/>Supabase)]
        RD[(Redis<br/>Railway)]
    end

    Internet --> Web
    Web --> Worker
    Beat --> Worker
    Web --> PG
    Web --> RD
    Worker --> PG

    style Web fill:#4CAF50
    style Worker fill:#2196F3
    style Beat fill:#FF9800
```

### 2. Procfile (Estratégia de Deploy)

O Railway usa **Procfile** como prioridade máxima:

```procfile
# Main API server - usa $PORT do Railway
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT

# Celery worker para tasks em background
worker: celery -A src.infrastructure.queue.celery_app worker --loglevel=info --queues=critical,high,default,low,background --concurrency=4

# Celery beat para investigações 24/7
beat: celery -A src.infrastructure.queue.celery_app beat --loglevel=info
```

:::warning **Porta Dinâmica**
Railway **injeta automaticamente** a variável `$PORT` (geralmente 8000). **NUNCA** hardcode a porta como 7860 (porta do HuggingFace).
:::

### 3. Variáveis de Ambiente

Configure no **Railway Dashboard** → **Settings** → **Variables**:

#### Obrigatórias

```bash
# Database (Supabase)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Security Keys (gerar com: python3 -c "import secrets; print(secrets.token_urlsafe(64))")
JWT_SECRET_KEY=ZreYJKfHts0RU3EU...
SECRET_KEY=gm_vrQ054CziyUEWbV...

# Environment
ENVIRONMENT=production
APP_ENV=production
```

#### Opcionais

```bash
# APIs Externas
TRANSPARENCY_API_KEY=e24f842355f72...
DADOS_GOV_API_KEY=eyJhbGciOiJIUzI...
GROQ_API_KEY=gsk_...

# Redis (auto-provisionado se adicionar serviço Redis)
REDIS_URL=redis://default:password@host:port
```

#### Auto-Provisionadas pelo Railway

```bash
PORT=8000  # Railway injeta automaticamente
RAILWAY_ENVIRONMENT=production
```

### 4. Deploy via Railway CLI

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link ao projeto
railway link

# 4. Deploy
git push origin main
# Railway detecta push → Build → Deploy → Healthcheck automático
```

### 5. Criar Múltiplos Serviços

Railway inicialmente cria apenas o serviço **web**. Para adicionar **worker** e **beat**:

#### Via Dashboard

1. **New Service** → "Create service from GitHub repo"
2. Selecione o repositório `cidadao.ai-backend`
3. **Settings** → **Deploy** → **Procfile Process**: selecione `worker` ou `beat`
4. Configure as **mesmas variáveis de ambiente** do serviço web

#### Via Railway CLI

```bash
# Criar serviço worker
railway service create --name cidadao-worker

# Criar serviço beat
railway service create --name cidadao-beat
```

### 6. Adicionar PostgreSQL e Redis

```bash
# Via Dashboard
# 1. New → Database → Add PostgreSQL
# 2. New → Database → Add Redis
# Railway auto-copia as connection strings para env vars

# Via CLI
railway add postgresql
railway add redis
```

### 7. Healthcheck e Logs

```bash
# Verificar saúde da API
curl https://cidadao-api-production.up.railway.app/health

# Resposta esperada
{
  "status": "healthy",
  "timestamp": "2024-10-15T12:00:00Z",
  "version": "2.1.0",
  "services": {
    "database": "ok",
    "redis": "ok",
    "agents": "ok"
  }
}

# Ver logs em tempo real (via CLI)
railway logs

# Ver logs no Dashboard
# Dashboard → Service → Logs → Live logs
```

### 8. Monitoramento

```bash
# Métricas disponíveis no Railway Dashboard
# - CPU usage
# - Memory usage
# - Network bandwidth
# - Request rate
# - Response time (p50, p95, p99)

# Acesse: Railway Dashboard → Metrics
```

### 9. Custos Estimados

| Plano | Preço | Recursos | Recomendado para |
|-------|-------|----------|------------------|
| **Hobby** | $5/mês | 500h execução + $5 créditos | Desenvolvimento/Testes |
| **Pro** | $20/mês | Execução ilimitada | **Produção** (atual) |

**Custos adicionais**:
- **PostgreSQL** (Supabase): Gratuito até 500MB
- **Redis** (Railway): $10/mês (1GB)

**Total estimado produção**: ~$30/mês

### 10. CI/CD Automático

Railway faz **deploy automático** em cada push:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automaticamente:
# 1. Detecta push no GitHub
# 2. Build da aplicação
# 3. Deploy dos 3 serviços
# 4. Healthcheck
# 5. Rollback automático se falhar
```

### 11. Troubleshooting Comum

#### Problema: App roda na porta 7860 (porta do HuggingFace)

**Causa**: Arquivos de configuração conflitantes (railway.toml, railway.json, nixpacks.toml)

**Solução**:
```bash
# Remover TODOS os arquivos de config exceto Procfile
rm railway.toml railway.json nixpacks.toml

git commit -m "fix(deploy): force Railway to use Procfile"
git push origin main
```

#### Problema: Worker não inicia

**Causa**: `REDIS_URL` não configurado

**Solução**: Adicione serviço Redis no Railway Dashboard

#### Problema: Deploy falha com "Invalid PORT"

**Causa**: PORT hardcoded no código

**Solução**: Use `$PORT` no Procfile e `os.getenv("PORT", 8000)` no código

### 12. Links Úteis

- 📚 [Railway Docs](https://docs.railway.app)
- 🚂 [Procfile Reference](https://docs.railway.app/deploy/deployments#procfile)
- 🔧 [Railway CLI](https://docs.railway.app/develop/cli)
- 📖 [Guia Completo Railway](./railway-deployment.md) (documentação detalhada)

---

## ☁️ Deploy em Cloud Providers

### AWS EC2 + RDS

#### 1. Terraform Setup

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "cidadao-ai-vpc"
  }
}

# EC2 Instance
resource "aws_instance" "backend" {
  ami           = "ami-0c55b159cbfafe1f0"  # Ubuntu 20.04
  instance_type = "t3.large"
  
  vpc_security_group_ids = [aws_security_group.backend.id]
  
  user_data = <<-EOF
    #!/bin/bash
    apt update
    apt install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
  EOF
  
  tags = {
    Name = "cidadao-ai-backend"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "cidadao-ai-db"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.medium"
  
  allocated_storage = 100
  storage_encrypted = true
  
  db_name  = "cidadao_ai"
  username = "cidadao"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  
  tags = {
    Name = "cidadao-ai-database"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "cidadao-ai-cache"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379
  
  tags = {
    Name = "cidadao-ai-redis"
  }
}
```

#### 2. Deploy Script

```bash
#!/bin/bash
# deploy-aws.sh

# Variáveis
REGION="us-east-1"
ECR_REPO="cidadao-ai-backend"
ECS_CLUSTER="cidadao-cluster"
ECS_SERVICE="cidadao-service"

# Build e push para ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL
docker build -t $ECR_REPO .
docker tag $ECR_REPO:latest $ECR_URL/$ECR_REPO:latest
docker push $ECR_URL/$ECR_REPO:latest

# Update ECS service
aws ecs update-service \
  --region $REGION \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment

echo "Deploy iniciado! Acompanhe em: https://console.aws.amazon.com/ecs"
```

### Google Cloud Platform

#### Cloud Run Deploy

```bash
# 1. Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/cidadao-ai-backend

# 2. Deploy to Cloud Run
gcloud run deploy cidadao-ai-backend \
  --image gcr.io/PROJECT_ID/cidadao-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="APP_ENV=production" \
  --set-env-vars="DATABASE_URL=$DATABASE_URL" \
  --set-env-vars="REDIS_URL=$REDIS_URL" \
  --min-instances=1 \
  --max-instances=10 \
  --memory=2Gi \
  --cpu=2
```

### Azure Container Instances

```bash
# Deploy com Azure CLI
az container create \
  --resource-group cidadao-ai-rg \
  --name cidadao-ai-backend \
  --image cidadaoai.azurecr.io/backend:latest \
  --cpu 2 \
  --memory 4 \
  --ports 7860 \
  --environment-variables \
    APP_ENV=production \
    DATABASE_URL=$DATABASE_URL \
    REDIS_URL=$REDIS_URL \
  --dns-name-label cidadao-ai-api
```

## 🖥️ Deploy em Servidor Próprio

### 1. Setup Inicial

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y \
  python3.10 \
  python3.10-venv \
  python3-pip \
  postgresql-14 \
  redis-server \
  nginx \
  supervisor \
  git

# Criar usuário para aplicação
sudo useradd -m -s /bin/bash cidadao
sudo usermod -aG sudo cidadao
```

### 2. Configurar Aplicação

```bash
# Como usuário cidadao
su - cidadao

# Clone repositório
git clone https://github.com/anderson-ufrj/cidadao.ai-backend.git
cd cidadao.ai-backend

# Criar virtualenv
python3.10 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações
alembic upgrade head

# Coletar static files (se aplicável)
python manage.py collectstatic --no-input
```

### 3. Supervisor Configuration

```ini
# /etc/supervisor/conf.d/cidadao-ai.conf
[program:cidadao-ai]
command=/home/cidadao/cidadao.ai-backend/venv/bin/python -m src.main
directory=/home/cidadao/cidadao.ai-backend
user=cidadao
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/cidadao-ai/app.log
environment=PATH="/home/cidadao/cidadao.ai-backend/venv/bin",APP_ENV="production"

[program:cidadao-ai-worker]
command=/home/cidadao/cidadao.ai-backend/venv/bin/celery -A src.tasks worker --loglevel=info
directory=/home/cidadao/cidadao.ai-backend
user=cidadao
numprocs=2
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/cidadao-ai/worker.log
```

### 4. Systemd Service (Alternativa)

```ini
# /etc/systemd/system/cidadao-ai.service
[Unit]
Description=Cidadão.AI Backend
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=cidadao
Group=cidadao
WorkingDirectory=/home/cidadao/cidadao.ai-backend
Environment="PATH=/home/cidadao/cidadao.ai-backend/venv/bin"
Environment="APP_ENV=production"
ExecStart=/home/cidadao/cidadao.ai-backend/venv/bin/python -m src.main
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 📊 Monitoramento Pós-Deploy

### Health Checks

```bash
# Verificar health endpoint
curl https://api.cidadao.ai/health

# Response esperado:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "agents": "ok"
  }
}
```

### Logs

```bash
# Docker
docker logs -f cidadao-ai-backend

# Systemd
journalctl -u cidadao-ai -f

# Supervisor
tail -f /var/log/cidadao-ai/app.log
```

### Métricas

```bash
# Prometheus metrics
curl https://api.cidadao.ai/metrics

# Grafana dashboards
# Acesse: https://grafana.cidadao.ai
```

## 🔧 Scripts de Deploy

### deploy.sh

```bash
#!/bin/bash
set -e

# Configurações
APP_DIR="/home/cidadao/cidadao.ai-backend"
BRANCH="main"
BACKUP_DIR="/backup/cidadao-ai"

echo "🚀 Iniciando deploy do Cidadão.AI..."

# 1. Backup do banco
echo "📦 Fazendo backup do banco..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Pull código atualizado
echo "📥 Atualizando código..."
cd $APP_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 3. Instalar dependências
echo "📚 Instalando dependências..."
source venv/bin/activate
pip install -r requirements.txt

# 4. Executar migrações
echo "🗄️ Executando migrações..."
alembic upgrade head

# 5. Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --no-input || true

# 6. Reiniciar serviços
echo "🔄 Reiniciando serviços..."
sudo supervisorctl restart cidadao-ai:*

# 7. Verificar saúde
echo "🏥 Verificando saúde..."
sleep 10
curl -f http://localhost:7860/health || exit 1

echo "✅ Deploy concluído com sucesso!"
```

### rollback.sh

```bash
#!/bin/bash
# Script de rollback em caso de problemas

PREVIOUS_VERSION=$1
if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Uso: ./rollback.sh <versão>"
  exit 1
fi

echo "🔙 Fazendo rollback para versão $PREVIOUS_VERSION..."

cd /home/cidadao/cidadao.ai-backend
git checkout $PREVIOUS_VERSION

source venv/bin/activate
pip install -r requirements.txt

alembic downgrade -1
sudo supervisorctl restart cidadao-ai:*

echo "✅ Rollback concluído!"
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Port already in use**
   ```bash
   # Encontrar processo usando porta
   sudo lsof -i :7860
   # Matar processo
   sudo kill -9 <PID>
   ```

2. **Database connection errors**
   ```bash
   # Verificar PostgreSQL
   sudo systemctl status postgresql
   # Testar conexão
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Out of memory**
   ```bash
   # Verificar memória
   free -h
   # Ajustar workers
   WEB_CONCURRENCY=2  # Reduzir workers
   ```

4. **Permission denied**
   ```bash
   # Corrigir permissões
   sudo chown -R cidadao:cidadao /home/cidadao/cidadao.ai-backend
   chmod +x deploy.sh
   ```

---

**Anterior:** [Variáveis de Ambiente](./environment-variables.md)  
**Próximo:** [Docker Configuration →](./docker-configuration.md)