---
title: "Configuração OAuth2"
sidebar_position: 2
description: "Guia completo para configurar OAuth2 com múltiplos providers"
---

# 🌐 Configuração OAuth2

## 📋 Providers Suportados

O Cidadão.AI suporta autenticação via OAuth2 com os seguintes providers:

- **Google** - Contas Google/Gmail
- **GitHub** - Desenvolvedores e contribuidores
- **Microsoft** - Azure AD e contas Microsoft
- **Gov.BR** - Login único do governo brasileiro

## 🔧 Configuração por Provider

### Google OAuth2

#### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Ative a API do Google+ ou People API
4. Vá para "Credentials" → "Create Credentials" → "OAuth client ID"

#### 2. Configurar OAuth Consent Screen

```yaml
Application name: Cidadão.AI
Authorized domains: cidadao.ai
Scopes:
  - email
  - profile
  - openid
```

#### 3. Criar Client ID

```yaml
Application type: Web application
Name: Cidadão.AI Production
Authorized JavaScript origins:
  - https://app.cidadao.ai
  - http://localhost:3000 (dev)
Authorized redirect URIs:
  - https://api.cidadao.ai/auth/callback/google
  - http://localhost:7860/auth/callback/google (dev)
```

#### 4. Variáveis de Ambiente

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_REDIRECT_URI="https://api.cidadao.ai/auth/callback/google"
```

### GitHub OAuth2

#### 1. Criar OAuth App

1. Acesse GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"

#### 2. Configurar Aplicação

```yaml
Application name: Cidadão.AI
Homepage URL: https://cidadao.ai
Authorization callback URL: https://api.cidadao.ai/auth/callback/github
```

#### 3. Variáveis de Ambiente

```bash
GITHUB_CLIENT_ID="Iv1.your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
GITHUB_REDIRECT_URI="https://api.cidadao.ai/auth/callback/github"
```

### Microsoft Azure AD

#### 1. Registrar Aplicação

1. Acesse [Azure Portal](https://portal.azure.com)
2. Azure Active Directory → App registrations → New registration

#### 2. Configurar App

```yaml
Name: Cidadão.AI
Supported account types: Multitenant + Personal accounts
Redirect URI: 
  - Type: Web
  - URI: https://api.cidadao.ai/auth/callback/microsoft
```

#### 3. Configurar Permissões

```yaml
API Permissions:
  - Microsoft Graph:
    - User.Read
    - email
    - profile
    - openid
```

#### 4. Variáveis de Ambiente

```bash
MICROSOFT_CLIENT_ID="your-application-id"
MICROSOFT_CLIENT_SECRET="your-client-secret"
MICROSOFT_TENANT_ID="common"  # ou seu tenant específico
MICROSOFT_REDIRECT_URI="https://api.cidadao.ai/auth/callback/microsoft"
```

### Gov.BR (Login Único)

#### 1. Cadastrar Aplicação

1. Acesse [Portal de Serviços](https://www.gov.br/governodigital)
2. Solicite credenciais de produção
3. Aguarde aprovação

#### 2. Configuração

```yaml
Nome do Sistema: Cidadão.AI
Descrição: Plataforma de Transparência Pública
URL de Retorno: https://api.cidadao.ai/auth/callback/govbr
Níveis de Confiança: Selo Prata ou superior
```

#### 3. Variáveis de Ambiente

```bash
GOVBR_CLIENT_ID="your-client-id"
GOVBR_CLIENT_SECRET="your-client-secret"
GOVBR_REDIRECT_URI="https://api.cidadao.ai/auth/callback/govbr"
GOVBR_ENVIRONMENT="production"  # ou "staging"
```

## 🔄 Fluxo de Autenticação OAuth2

### 1. Iniciação do Login

```python
@app.get("/auth/login/{provider}")
async def oauth_login(provider: str):
    """Inicia fluxo OAuth2"""
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(400, "Invalid provider")
    
    oauth_client = OAuth2Client(provider)
    
    # Gerar state para CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Salvar state na sessão
    await redis.setex(f"oauth_state:{state}", 600, provider)
    
    # Gerar URL de autorização
    auth_url = oauth_client.get_authorization_url(
        redirect_uri=f"{API_URL}/auth/callback/{provider}",
        state=state,
        scope=OAUTH_PROVIDERS[provider]["scopes"]
    )
    
    return {"auth_url": auth_url}
```

### 2. Callback Handler

```python
@app.get("/auth/callback/{provider}")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    error: Optional[str] = None
):
    """Processa callback OAuth2"""
    
    # Verificar erro
    if error:
        logger.warning(f"OAuth error: {error}")
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=oauth_failed"
        )
    
    # Validar state (CSRF)
    saved_provider = await redis.get(f"oauth_state:{state}")
    if not saved_provider or saved_provider != provider:
        raise HTTPException(400, "Invalid state")
    
    # Deletar state usado
    await redis.delete(f"oauth_state:{state}")
    
    # Trocar código por token
    oauth_client = OAuth2Client(provider)
    try:
        token_data = await oauth_client.exchange_code(
            code=code,
            redirect_uri=f"{API_URL}/auth/callback/{provider}"
        )
    except Exception as e:
        logger.error(f"Token exchange failed: {e}")
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=token_exchange_failed"
        )
    
    # Obter informações do usuário
    user_info = await oauth_client.get_user_info(
        token_data["access_token"]
    )
    
    # Criar ou atualizar usuário
    user = await process_oauth_user(user_info, provider)
    
    # Gerar JWT
    access_token = auth_manager.create_access_token(
        data={
            "sub": user.email,
            "role": user.role,
            "provider": provider
        }
    )
    
    # Redirecionar com token
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/success?token={access_token}"
    )
```

### 3. Processamento de Usuário

```python
async def process_oauth_user(
    user_info: Dict[str, Any],
    provider: str
) -> User:
    """Cria ou atualiza usuário OAuth"""
    
    # Extrair email (varia por provider)
    email = extract_email(user_info, provider)
    if not email:
        raise HTTPException(400, "Email not provided")
    
    # Verificar se usuário existe
    existing_user = await get_user_by_email(email)
    
    if existing_user:
        # Atualizar informações
        existing_user.last_login = datetime.utcnow()
        existing_user.oauth_providers.add(provider)
        await update_user(existing_user)
        
        # Log evento
        await audit_logger.log({
            "event": "oauth_login",
            "user_id": existing_user.id,
            "provider": provider
        })
        
        return existing_user
    
    # Criar novo usuário
    new_user = User(
        id=generate_user_id(),
        email=email,
        name=extract_name(user_info, provider),
        role="user",  # Role padrão
        oauth_providers={provider},
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow()
    )
    
    await create_user(new_user)
    
    # Log evento
    await audit_logger.log({
        "event": "oauth_signup",
        "user_id": new_user.id,
        "provider": provider
    })
    
    return new_user
```

## 🔐 Segurança OAuth2

### 1. State Parameter (CSRF Protection)

```python
def generate_oauth_state() -> str:
    """Gera state único para prevenir CSRF"""
    return secrets.token_urlsafe(32)

def validate_oauth_state(
    received_state: str,
    expected_state: str
) -> bool:
    """Valida state para prevenir CSRF"""
    return secrets.compare_digest(
        received_state,
        expected_state
    )
```

### 2. PKCE (Proof Key for Code Exchange)

```python
def generate_pkce_pair() -> Tuple[str, str]:
    """Gera PKCE verifier e challenge"""
    verifier = base64.urlsafe_b64encode(
        os.urandom(32)
    ).decode('utf-8').rstrip('=')
    
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).decode('utf-8').rstrip('=')
    
    return verifier, challenge
```

### 3. Token Validation

```python
async def validate_oauth_token(
    token: str,
    provider: str
) -> bool:
    """Valida token com provider"""
    oauth_client = OAuth2Client(provider)
    
    try:
        # Verificar com provider
        is_valid = await oauth_client.verify_token(token)
        
        if not is_valid:
            # Log tentativa suspeita
            await security_audit.log_event(
                "oauth_token_invalid",
                severity="HIGH",
                details={"provider": provider}
            )
            
        return is_valid
        
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return False
```

## 📊 Mapeamento de Claims

### Extração de Dados do Usuário

```python
USER_INFO_MAPPING = {
    "google": {
        "email": "email",
        "name": "name",
        "picture": "picture",
        "locale": "locale"
    },
    "github": {
        "email": "email",
        "name": "name",
        "picture": "avatar_url",
        "username": "login"
    },
    "microsoft": {
        "email": "mail",
        "name": "displayName",
        "picture": "photo",
        "id": "id"
    },
    "govbr": {
        "email": "emailPrincipal",
        "name": "nome",
        "cpf": "cpf",
        "phone": "telefone",
        "trust_level": "nivelConfianca"
    }
}

def extract_user_info(
    raw_data: Dict,
    provider: str
) -> Dict[str, Any]:
    """Extrai informações padronizadas"""
    mapping = USER_INFO_MAPPING[provider]
    user_info = {}
    
    for standard_key, provider_key in mapping.items():
        value = raw_data.get(provider_key)
        if value:
            user_info[standard_key] = value
    
    # Adicionar metadados
    user_info["provider"] = provider
    user_info["raw_data"] = raw_data
    
    return user_info
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. **Redirect URI Mismatch**
```yaml
Erro: "redirect_uri_mismatch"
Solução: 
  - Verifique se a URI está exatamente igual no provider
  - Inclua protocolo (http/https)
  - Verifique trailing slashes
```

#### 2. **Invalid Client**
```yaml
Erro: "invalid_client"
Solução:
  - Verifique client_id e client_secret
  - Confirme que as credenciais são do ambiente correto
  - Verifique se o app está ativo no provider
```

#### 3. **Access Denied**
```yaml
Erro: "access_denied"
Solução:
  - Usuário negou permissão
  - Verifique scopes solicitados
  - Implemente fluxo de retry
```

### Debug Mode

```python
# Ativar logs detalhados
OAUTH_DEBUG = True

if OAUTH_DEBUG:
    logger.debug(f"Auth URL: {auth_url}")
    logger.debug(f"Token response: {token_response}")
    logger.debug(f"User info: {user_info}")
```

## 🚀 Best Practices

### 1. **Segurança**
- Sempre use HTTPS em produção
- Valide state parameter
- Implemente PKCE quando possível
- Rotacione secrets regularmente

### 2. **UX**
- Forneça opções múltiplas de login
- Mostre erros claros
- Implemente "Remember me"
- Permita linking de contas

### 3. **Compliance**
- Respeite LGPD/GDPR
- Solicite apenas scopes necessários
- Permita revogação de acesso
- Mantenha logs de consentimento

---

**Anterior:** [Overview de Segurança](./overview.md)  
**Próximo:** [Rate Limiting →](./rate-limiting.md)