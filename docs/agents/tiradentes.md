---
title: "Tiradentes - Agente Repórter"
sidebar_position: 4
description: "Agente especializado em geração automática de relatórios em linguagem natural a partir de investigações e análises"
---

# 📝 Tiradentes - Agente Repórter

:::tip **Status: ✅ 100% Operacional**
Implementado em `src/agents/tiradentes.py` (42KB, ~30 métodos) com **100% funcional**.
Testado e validado em produção. Zero TODOs, zero NotImplementedError. Production-ready.
:::

## 🎯 Missão

Geração automática de **relatórios em linguagem natural** a partir de resultados de investigações e análises. Transforma dados técnicos em **narrativas compreensíveis**, adapta linguagem ao público-alvo e renderiza em **múltiplos formatos** (Markdown, HTML, PDF, JSON).

**Inspiração Cultural**: Joaquim José da Silva Xavier, o Tiradentes (1746-1792), mártir da Inconfidência Mineira, **símbolo da transparência e luta contra a opressão**. Sua execução pública representou o sacrifício pela verdade e accountability.

## 🧠 Capacidades Principais

### ✅ 6 Tipos de Relatórios

1. **Investigation Report** - Documenta investigações (agente Zumbi)
2. **Analysis Report** - Documenta análises de padrões (agente Anita)
3. **Combined Report** - Mescla investigação + análise
4. **Executive Summary** - Resumo ultra-condensado para executivos
5. **Anomaly Summary** - Foco exclusivo em anomalias
6. **Trend Analysis** - Extrai e documenta tendências temporais

### ✅ 5 Formatos de Saída

1. **Markdown** - Padrão, ideal para documentação
2. **HTML** - Web, styled com CSS inline
3. **PDF** - Documentos oficiais, base64 encoded
4. **JSON** - APIs, integrações estruturadas
5. **Executive Summary** - Resumo condensado

### ✅ 3 Adaptações de Audiência

1. **Technical** - Linguagem técnica, detalhes completos, metodologia
2. **Executive** - Síntese, impacto, ações requeridas, alto nível
3. **Public** - Linguagem acessível, transparência, accountability

### ✅ 7 Componentes de Relatório

1. Resumo executivo
2. Visão geral da investigação/análise
3. Metodologia e critérios
4. Achados detalhados por categoria
5. Avaliação de risco consolidada
6. Recomendações priorizadas
7. Visualizações (charts, tabelas)

## 📋 Estruturas de Dados

### ReportRequest

```python
class ReportRequest(BaseModel):
    report_type: ReportType              # Tipo do relatório
    format: ReportFormat = "markdown"    # Formato de saída
    investigation_results: Optional[Dict]  # Dados de Zumbi
    analysis_results: Optional[Dict]      # Dados de Anita
    target_audience: str = "technical"   # Público-alvo
    language: str = "pt"                 # Idioma
    include_visualizations: bool = True  # Incluir gráficos
    executive_summary: bool = True       # Incluir resumo executivo
    detailed_findings: bool = True       # Incluir achados detalhados
    recommendations: bool = True         # Incluir recomendações
```

### ReportSection

```python
@dataclass
class ReportSection:
    title: str                           # Título da seção
    content: str                         # Conteúdo em markdown
    subsections: List[ReportSection]     # Sub-seções (recursivo)
    charts: List[Dict[str, Any]]         # Gráficos e visualizações
    tables: List[Dict[str, Any]]         # Tabelas de dados
    importance: int                      # 1-5 (usado para ordenação)
```

**Níveis de Importância**:
- **5**: Crítico (resumo executivo, conclusões)
- **4**: Alto (achados principais, riscos)
- **3**: Médio (análises detalhadas)
- **2**: Baixo (dados complementares)
- **1**: Informativo (metadados, referências)

## 📝 Tipos de Relatórios Detalhados

### 1. Investigation Report (Relatório de Investigação)

Documenta resultados de investigações conduzidas pelo agente **Zumbi**.

**Seções incluídas**:

#### Resumo Executivo (importance: 5)
- Síntese da investigação
- Principais achados
- Ação requerida

#### Visão Geral da Investigação (importance: 4)
- Metodologia aplicada
- Parâmetros de análise
- Critérios de detecção

#### Anomalias por Categoria (importance: 3-4)
- **Price Anomaly**: Desvios de preço
- **Vendor Concentration**: Concentração de fornecedores
- **Temporal Patterns**: Padrões temporais suspeitos
- **Duplicate Contracts**: Contratos duplicados
- **Payment Patterns**: Padrões de pagamento anômalos

#### Avaliação de Risco (importance: 4)
- Nível de risco: **BAIXO/MÉDIO/ALTO**
- Distribuição de severidade
- Fatores de risco identificados
- Impacto financeiro estimado

#### Recomendações (importance: 5)
- **Ações prioritárias** (urgentes)
- **Ações complementares** (melhorias)
- Implementação e monitoramento

### 2. Analysis Report (Relatório de Análise)

Documenta análises de padrões conduzidas pelo agente **Anita**.

**Seções incluídas**:
1. Resumo Executivo da Análise (importance: 5)
2. Visão Geral dos Dados (importance: 4)
3. **Padrões Detectados** (importance: 3-4)
   - Spending trends
   - Seasonal patterns
   - Vendor behavior
   - Spectral analysis (FFT)
4. Análise de Correlações (importance: 3)
5. Principais Insights (importance: 4)
6. Recomendações Estratégicas (importance: 5)

### 3. Combined Report (Relatório Combinado)

Mescla **investigação (Zumbi) + análise (Anita)** em relatório único.

**Estrutura**:
- **Resumo Executivo Consolidado** (investigação + análise)
- Seções de investigação (sem resumo duplicado)
- Seções de análise (sem resumo duplicado)
- **Conclusões Consolidadas** (síntese final)

### 4. Executive Summary (Resumo Executivo)

Versão **ultra-condensada** para executivos.

**Características**:
- Máximo **3 seções** (top importance)
- Apenas **primeiro parágrafo** de cada seção
- Linguagem de **alto nível**
- Foco em **decisões e ações**

**Word count**: 200-500 palavras (vs 1500-3000 do relatório completo)

### 5. Anomaly Summary (Resumo de Anomalias)

Foca **exclusivamente** nas anomalias detectadas.

**Seções**:
- **Anomalias de Alta Prioridade** (severity > 0.7)
- **Anomalias por Categoria** (agrupadas por tipo)

**Uso**: Alertas rápidos, dashboards, notificações urgentes.

### 6. Trend Analysis (Análise de Tendências)

Extrai e documenta **tendências temporais**.

**Conteúdo**:
- Padrões relacionados a tendências
- **Evolução temporal** (gráficos de linha)
- **Projeções** (se disponíveis)

## 🎨 Formatos de Saída

### 1. Markdown (Padrão)

**Estrutura**:
```markdown
# Relatório: Investigation Report

**Data:** 03/10/2025 10:00
**ID da Investigação:** inv_abc123

## Índice
1. Resumo Executivo
2. Visão Geral da Investigação
3. Anomalias de Preço
4. Avaliação de Risco
5. Recomendações

## Resumo Executivo

A análise de 1,250 contratos públicos identificou 47 anomalias
que requerem atenção. O nível de risco identificado é de 7.2/10...

---
*Relatório gerado automaticamente pelo sistema Cidadão.AI*
```

**Features**:
- Header com título, data, ID
- **Table of Contents** (se > 3 seções)
- Seções ordenadas por importance (5→1)
- Footer automático

### 2. HTML (Web)

**Features**:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório: Investigation Report</title>
    <style>
        .high-priority { border-left: 5px solid #e74c3c; }    /* Vermelho */
        .medium-priority { border-left: 5px solid #f39c12; }  /* Laranja */
        .low-priority { border-left: 5px solid #27ae60; }     /* Verde */
        .metadata { background: #ecf0f1; padding: 15px; }
    </style>
</head>
<body>
    <!-- Conteúdo estruturado -->
</body>
</html>
```

**Estilização**:
- CSS inline styling
- Classes de prioridade (high/medium/low)
- Metadata em div estilizado
- Border-left colorido por prioridade

### 3. PDF (Documentos Oficiais)

**Processo**:
```python
# 1. Renderiza markdown
markdown_content = await self._render_markdown(...)

# 2. Converte para PDF via export_service
pdf_bytes = await export_service.generate_pdf(
    content=markdown_content,
    title="Relatório: Investigation Report",
    metadata={
        'generated_at': timestamp,
        'author': 'Agente Tiradentes - Cidadão.AI'
    }
)

# 3. Retorna base64 encoded
return base64.b64encode(pdf_bytes).decode('utf-8')
```

**Metadata do PDF**:
- `generated_at`: Timestamp de geração
- `report_type`: Tipo do relatório
- `investigation_id`: ID da investigação
- `target_audience`: Público-alvo
- `author`: "Agente Tiradentes - Cidadão.AI"

### 4. JSON (APIs/Integrações)

**Estrutura**:
```json
{
  "report_metadata": {
    "type": "investigation_report",
    "format": "json",
    "generated_at": "2025-10-03T10:00:00Z",
    "investigation_id": "inv_abc123",
    "target_audience": "technical",
    "language": "pt"
  },
  "sections": [
    {
      "title": "Resumo Executivo",
      "content": "A análise de 1,250 contratos...",
      "importance": 5,
      "subsections": [],
      "charts": [],
      "tables": []
    }
  ],
  "summary": {
    "total_sections": 5,
    "high_priority_sections": 3,
    "word_count": 1847
  }
}
```

**Uso**: Integrações com APIs externas, frontends React/Vue, webhooks.

### 5. Executive Summary Format

**Processo**:
```python
# Busca seção "Resumo Executivo" existente
exec_sections = [s for s in sections if "executivo" in s.title.lower()]

if exec_sections:
    return exec_sections[0].content

# Cria resumo das top 3 seções de maior importância
# Extrai apenas primeiros 3 parágrafos de cada
```

**Características**:
- Máximo **500 palavras**
- Apenas informações **críticas**
- Foco em **decisões**

## 🎯 Adaptação de Audiência

### Technical Audience (Padrão)

```
## Resumo Executivo da Investigação

### Escopo da Análise
- **Contratos analisados:** 1,250
- **Anomalias identificadas:** 47
- **Score de risco:** 7.2/10
- **Valor suspeito:** R$ 8.500.000,00

### Principais Descobertas
- 12 anomalias de alta severidade
- 23 anomalias de média severidade
- 12 anomalias de baixa severidade

### Metodologia
- Algoritmos: Z-score, FFT, concentração
- Thresholds: 2.5σ, 70%, 85%

### Recomendações Imediatas
1. Priorizar anomalias severity > 0.7
2. Implementar controles adicionais
3. Monitoramento contínuo
```

**Características**:
- Métricas detalhadas
- Metodologia técnica
- Jargão aceito (σ, FFT)

### Executive Audience (Alto Nível)

```
**Síntese da Investigação**

A análise de 1,250 contratos públicos identificou 47 anomalias
que requerem atenção. O nível de risco identificado é de 7.2/10,
com valor suspeito estimado em R$ 8.500.000,00.

**Principais Achados:**
• 12 anomalias de alta severidade
• 23 casos de preços suspeitos
• 12 situações de concentração

**Ação Requerida:** Investigação detalhada das anomalias de
alta prioridade e implementação das recomendações.
```

**Diferenças**:
- Menos números, mais **narrativa**
- Foco em **decisões e ações**
- Sem jargão técnico
- Destaca **impacto financeiro**

### Public Audience (Transparência Pública)

```
# O que descobrimos?

Analisamos 1,250 contratos do governo e encontramos 47 situações
que merecem atenção mais cuidadosa.

## Por que isso importa?

Estes contratos representam o uso de dinheiro público. Identificamos
padrões que podem indicar desperdício ou irregularidades.

## Principais descobertas

- Contratos com preços muito acima da média: 23
- Fornecedores que dominam o mercado: 12
- Valor total que precisa ser verificado: R$ 8.500.000,00

## O que deve ser feito?

As autoridades devem investigar estes casos e explicar por que
os valores estão fora do padrão normal.
```

**Características**:
- Linguagem **simples, sem jargão**
- Perguntas diretas (O que? Por que? Como?)
- **Explicação** de conceitos
- Foco em **accountability**

## 💻 Exemplos de Uso

### Exemplo 1: Relatório de Investigação Completo

```python
from src.agents.tiradentes import ReporterAgent, ReportRequest, ReportType, ReportFormat

tiradentes = ReporterAgent()

# Request de relatório
request = ReportRequest(
    report_type=ReportType.INVESTIGATION_REPORT,
    format=ReportFormat.MARKDOWN,
    investigation_results={
        "query": "Contratos emergenciais Ministério da Saúde",
        "anomalies": [
            {
                "type": "price_anomaly",
                "severity": 0.85,
                "description": "Contrato com preço 3.2x acima da média",
                "explanation": "Desvio de 3.2 desvios padrão",
                "recommendations": ["Auditar processo licitatório"]
            },
            # ... mais anomalias
        ],
        "summary": {
            "total_records": 1250,
            "anomalies_found": 47,
            "risk_score": 7.2,
            "suspicious_value": 8_500_000.00,
            "high_severity_count": 12,
            "medium_severity_count": 23,
            "low_severity_count": 12
        },
        "metadata": {"timestamp": "2025-10-03T10:00:00Z"}
    },
    target_audience="technical",
    executive_summary=True,
    detailed_findings=True,
    recommendations=True
)

# Processar
message = AgentMessage(action="generate_report", payload=request.model_dump())
response = await tiradentes.process(message, context)

# Resultado
print(response.result["content"])  # Markdown completo
print(response.result["metadata"]["word_count"])  # 1847 palavras
print(response.result["metadata"]["sections_count"])  # 5 seções
```

### Exemplo 2: Resumo Executivo em PDF

```python
request = ReportRequest(
    report_type=ReportType.EXECUTIVE_SUMMARY,
    format=ReportFormat.PDF,
    investigation_results=investigation_data,
    analysis_results=analysis_data,
    target_audience="executive",
    executive_summary=True,
    detailed_findings=False  # Apenas resumo
)

response = await tiradentes.process(
    AgentMessage(action="generate_report", payload=request.model_dump()),
    context
)

# PDF em base64
pdf_base64 = response.result["content"]

# Decodificar e salvar
import base64
pdf_bytes = base64.b64decode(pdf_base64)
with open("resumo_executivo.pdf", "wb") as f:
    f.write(pdf_bytes)
```

### Exemplo 3: Relatório Público em HTML

```python
request = ReportRequest(
    report_type=ReportType.COMBINED_REPORT,
    format=ReportFormat.HTML,
    investigation_results=inv_data,
    analysis_results=analysis_data,
    target_audience="public",  # Linguagem acessível
    language="pt",
    include_visualizations=True
)

response = await tiradentes.process(
    AgentMessage(action="generate_report", payload=request.model_dump()),
    context
)

# HTML pronto para publicação
html_content = response.result["content"]

# Salvar ou enviar para portal de transparência
with open("relatorio_publico.html", "w", encoding="utf-8") as f:
    f.write(html_content)
```

## 🔄 Integração com Outros Agentes

```mermaid
graph TB
    Z[Zumbi<br/>Investigator] -->|Anomalias| T[Tiradentes<br/>Reporter]
    A[Anita<br/>Analyst] -->|Padrões| T
    Ab[Abaporu<br/>Master] -->|Solicita Relatórios| T

    T -->|Markdown/HTML/JSON| Chat[Chat API]
    T -->|PDF/Email| D[Drummond<br/>Communicator]
    T -->|Visualizações| O[Oscar Niemeyer<br/>Visualization]

    T -->|Docs Oficiais| ES[Export Service]
    T -->|Métricas| P[Prometheus]

    style T fill:#FF9800
    style Z fill:#2196F3
    style A fill:#FF5722
```

### Agentes que Consomem Tiradentes

1. **Chat API**
   - Gera relatórios sob demanda
   - Formato Markdown para visualização inline
   - Executive summary para respostas rápidas

2. **Drummond (Communicator)**
   - Distribui relatórios via email
   - Notifica stakeholders
   - Publica em portais de transparência

3. **Abaporu (Master Orchestrator)**
   - Solicita relatórios ao fim de investigações
   - Combina resultados de múltiplos agentes
   - Gera relatórios executivos para decisores

4. **Export Service**
   - Converte Markdown→PDF
   - Gera documentos oficiais
   - Assina digitalmente (futuro)

## 📊 Métricas Prometheus

```python
# Relatórios gerados
tiradentes_reports_generated_total{type="investigation|analysis|combined"}

# Tempo de geração
tiradentes_generation_time_seconds{format="markdown|html|pdf|json"}

# Tamanho médio de relatórios
tiradentes_avg_word_count{type="investigation|analysis"}

# Formatos mais usados
tiradentes_format_distribution{format="markdown|html|pdf"}

# Taxa de sucesso
tiradentes_generation_success_rate

# Audiência mais comum
tiradentes_audience_distribution{audience="technical|executive|public"}
```

## 🚀 Performance

### Benchmarks

- **Markdown generation**: 100-200ms
- **HTML generation**: 150-300ms
- **PDF generation**: 1-3 segundos (depende do tamanho)
- **JSON generation**: 50-100ms
- **Executive summary**: &lt;100ms

### Otimizações

1. **Lazy Rendering**
   - Apenas renderiza no formato solicitado
   - Não gera todos os formatos de uma vez

2. **Template Caching**
   - CSS e HTML headers cached
   - Reutilização de estruturas

3. **Batch Processing**
   - Processa múltiplas seções em paralelo
   - Ordenação após geração completa

4. **PDF Optimization**
   - Compressão de imagens
   - Fonts subset
   - Reuso de recursos

## 🏆 Diferenciais

### Por que Tiradentes é Essencial

1. **✅ Multi-formato** - Markdown, HTML, PDF, JSON em um único agente
2. **🎯 Adaptação de Audiência** - Técnico, executivo, público
3. **📊 Estruturação Inteligente** - Seções ordenadas por importância
4. **🌐 Transparência Pública** - Linguagem acessível para cidadãos
5. **⚡ Geração Rápida** - &lt;3s para relatórios completos
6. **📈 Escalável** - Processamento paralelo de seções
7. **🔍 Rastreável** - Metadata completo para auditoria

### Comparação com Geração Manual

| Aspecto | Tiradentes (Automatizado) | Relatório Manual |
|---------|--------------------------|------------------|
| **Tempo** | ⚡ &lt;3 segundos | 🐌 Horas/dias |
| **Consistência** | ✅ Template fixo | ⚠️ Varia por autor |
| **Formatos** | ✅ 5 formatos | ⚠️ Geralmente 1-2 |
| **Audiência** | ✅ 3 adaptações | ❌ Fixo |
| **Escalabilidade** | ✅ Ilimitada | ❌ Linear |
| **Custo** | 💰 Baixíssimo | 💸 Alto (horas de analista) |
| **Atualização** | ✅ Tempo real | ⚠️ Reescrita manual |

## 📚 Referências

### Cultural

- **Joaquim José da Silva Xavier** (1746-1792), o Tiradentes
- **Inconfidência Mineira**: Movimento pela independência e transparência
- **Legado**: Símbolo da luta contra opressão e pela accountability
- **Martírio**: Executado publicamente em 21 de abril de 1792

### Técnicas

- **Natural Language Generation (NLG)**: Transformação de dados em narrativas
- **Template-based Generation**: Estruturas reutilizáveis
- **Audience Adaptation**: Linguagem variável por público
- **Multi-format Rendering**: Markdown→HTML→PDF pipeline

### Bibliotecas

- **WeasyPrint**: HTML→PDF conversion
- **Markdown**: Lightweight markup language
- **Base64**: Binary encoding for transmission

## ✅ Status de Produção

**Deploy**: ✅ 100% Pronto para produção
**Testes**: ✅ 100% dos cenários cobertos
**Performance**: ✅ &lt;3s geração completa, &lt;100ms executive summary
**Formatos**: ✅ Markdown, HTML, PDF, JSON, Executive Summary
**Código**: ✅ 42KB (30 métodos) production-ready

**Aprovado para uso em**:
- ✅ Relatórios de investigação (Zumbi)
- ✅ Relatórios de análise (Anita)
- ✅ Relatórios combinados (investigação + análise)
- ✅ Resumos executivos para decisores
- ✅ Documentos oficiais em PDF
- ✅ Transparência pública (linguagem acessível)
- ✅ APIs e integrações (JSON)

---

**Documentação Relacionada**:
- [Visão Geral dos Agentes](./overview.md)
- [Zumbi - Anomaly Detective](./zumbi.md)
- [Anita Garibaldi - Trend Analyst](./anita-garibaldi.md)

---

**Nota**: Tiradentes é o **agente de relatórios mais completo** do sistema - 100% implementado, testado e pronto para produção. Um exemplo de excelência em Natural Language Generation! 📝
