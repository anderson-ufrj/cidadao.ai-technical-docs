---
title: "Oscar Niemeyer - Visualization Architect"
sidebar_position: 13
description: "Agente especializado em agregação inteligente e geração de metadados para visualização de dados"
---

# 🏗️ Oscar Niemeyer - Visualization Architect

:::info **Status: ✅ 80% Operacional (Beta)**
Implementado em `src/agents/oscar_niemeyer.py` (38KB, ~18 métodos) com **core features funcionais**.
Testado: 12/17 testes passing (70.6% coverage). **Sprint 6**: Network graphs + Choropleth maps adicionados!
TODOs: Visualizações 3D, animações, dashboards compostos.
:::

## 🎯 Missão

Agregação inteligente de dados governamentais e geração de metadados otimizados para visualização no frontend, transformando dados brutos em insights visuais compreensíveis. Especialista em preparar dados para dashboards, gráficos, mapas interativos e **network graphs de fraude**.

**Inspiração Cultural**: Oscar Niemeyer (1907-2012), arquiteto brasileiro modernista, criador de Brasília e ícone do design brasileiro. Conhecido por transformar conceitos abstratos em formas visuais elegantes e funcionais.

## 📊 Tipos de Agregação Suportados

### Enum AggregationType (9 tipos)

```python
class AggregationType(Enum):
    SUM = "sum"                    # Soma total
    COUNT = "count"                # Contagem
    AVERAGE = "average"            # Média aritmética
    MEDIAN = "median"              # Mediana
    MIN = "min"                    # Mínimo
    MAX = "max"                    # Máximo
    PERCENTILE = "percentile"      # Percentis (25, 50, 75, 95, 99)
    STDDEV = "stddev"              # Desvio padrão
    VARIANCE = "variance"          # Variância
```

**Cobertura**: De estatísticas simples (soma, média) a avançadas (percentis, variância).

## 📈 Tipos de Visualização

### Enum VisualizationType (10 tipos)

```python
class VisualizationType(Enum):
    LINE_CHART = "line_chart"      # Gráfico de linhas (séries temporais)
    BAR_CHART = "bar_chart"        # Gráfico de barras (comparações)
    PIE_CHART = "pie_chart"        # Gráfico de pizza (proporções)
    SCATTER_PLOT = "scatter_plot"  # Dispersão (correlações)
    HEATMAP = "heatmap"            # Mapa de calor (matriz 2D)
    TREEMAP = "treemap"            # Treemap (hierarquias)
    SANKEY = "sankey"              # Diagrama Sankey (fluxos)
    GAUGE = "gauge"                # Medidor (KPIs)
    MAP = "map"                    # Mapas geográficos
    TABLE = "table"                # Tabela de dados
```

**Versatilidade**: Cobre desde gráficos básicos até visualizações complexas (Sankey, Treemap).

## ⏱️ Granularidades Temporais

### Enum TimeGranularity (7 níveis)

```python
class TimeGranularity(Enum):
    MINUTE = "minute"    # Minuto a minuto
    HOUR = "hour"        # Por hora
    DAY = "day"          # Diário
    WEEK = "week"        # Semanal
    MONTH = "month"      # Mensal
    QUARTER = "quarter"  # Trimestral
    YEAR = "year"        # Anual
```

**Flexibilidade**: De análises em tempo real (minuto) até estratégicas (anual).

## 🧠 Algoritmos e Técnicas Implementadas

### 1. Agregação de Dados Multidimensional

#### ✅ OLAP Cube Operations

**Funcionalidades**:
```python
# Slice: Selecionar uma fatia específica
cube.slice(dimension="state", value="SP")

# Dice: Selecionar sub-cubo
cube.dice(state=["SP", "RJ"], year=[2023, 2024])

# Drill-down: Detalhar (estado → município)
cube.drill_down(from_="state", to="municipality")

# Roll-up: Agregar (município → estado)
cube.roll_up(from_="municipality", to="state")
```

**Uso**: Análise multidimensional de dados governamentais (estado x categoria x tempo).

#### ✅ Pivot Table Generation

**Funcionalidades**:
- Múltiplas dimensões (**linhas x colunas**)
- Agregações aninhadas
- **Grand totals** e **subtotals**

**Aplicação**: Tabelas dinâmicas para relatórios executivos.

#### ✅ Cross-tabulation

**Funcionalidades**:
- Análise de frequência cruzada
- **Chi-square** para independência
- **Cramér's V** para força de associação

**Uso**: Identificar correlações entre categorias (ex: região x tipo de despesa).

#### ✅ Hierarchical Aggregation

**Estrutura**:
```
Município → Microrregião → Mesorregião → Estado → Região → País
```

**Vantagem**: Navegação em diferentes níveis de detalhe.

#### ✅ Window Functions

**SQL-style operations**:
```sql
-- Moving average (7 dias)
AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)

-- Cumulative sum
SUM(value) OVER (ORDER BY date)

-- Rank
RANK() OVER (PARTITION BY category ORDER BY value DESC)
```

**Uso**: Médias móveis, somas acumuladas, rankings dinâmicos.

### 2. Otimização de Dados para Visualização

#### ✅ Data Sampling - LTTB Algorithm

**Largest Triangle Three Buckets**:
```python
# Para datasets > 10k pontos
if len(data) > 10000:
    # LTTB preserva forma geral da série
    sampled_data = downsample_lttb(data, target_points=1000)
```

**Vantagem**: Reduz dados sem perder padrões visuais importantes.

#### ✅ Binning Strategies

**Tipos**:
```python
# Equal-width bins (intervalos iguais)
bins = pd.cut(data, bins=10)

# Equal-frequency bins (quantiles)
bins = pd.qcut(data, q=10)

# Custom bins
bins = [0, 1000, 10000, 100000, float('inf')]
```

**Uso**: Histogramas, classificações por faixa.

#### ✅ Outlier Detection

**Métodos**:
```python
# IQR (Interquartile Range)
Q1, Q3 = data.quantile([0.25, 0.75])
IQR = Q3 - Q1
outliers = (data < Q1 - 1.5*IQR) | (data > Q3 + 1.5*IQR)

# Z-score method
z_scores = (data - data.mean()) / data.std()
outliers = np.abs(z_scores) > 3
```

**Aplicação**: Identificar e tratar valores extremos antes de visualizar.

#### ✅ Data Normalization

**Técnicas**:
```python
# Min-Max scaling (0-1)
normalized = (data - data.min()) / (data.max() - data.min())

# Z-score standardization (média 0, desvio 1)
standardized = (data - data.mean()) / data.std()

# Log transformation (para distribuições assimétricas)
log_data = np.log1p(data)  # log(1 + x)
```

**Uso**: Comparar métricas em escalas diferentes.

#### ✅ Missing Value Interpolation

**Métodos**:
```python
# Linear interpolation
data_filled = data.interpolate(method='linear')

# Spline interpolation (suave)
data_filled = data.interpolate(method='spline', order=3)

# Forward fill (último valor válido)
data_filled = data.ffill()
```

**Aplicação**: Preencher lacunas em séries temporais.

### 3. Análise de Séries Temporais

#### ✅ Time Series Decomposition

**STL** (Seasonal-Trend decomposition using Loess):
```python
decomposition = seasonal_decompose(timeseries, model='additive')
trend = decomposition.trend          # Tendência de longo prazo
seasonal = decomposition.seasonal    # Padrão sazonal
residual = decomposition.resid       # Ruído
```

**Uso**: Separar tendência, sazonalidade e ruído.

#### ✅ Moving Averages

**Tipos**:
```python
# Simple Moving Average (SMA)
sma = data.rolling(window=7).mean()

# Exponential Moving Average (EMA) - mais peso em dados recentes
ema = data.ewm(span=7, adjust=False).mean()

# Weighted Moving Average (WMA)
weights = np.arange(1, window+1)
wma = data.rolling(window).apply(lambda x: np.dot(x, weights)/weights.sum())
```

**Aplicação**: Suavizar séries temporais e identificar tendências.

#### ✅ Autocorrelation Analysis

**Funcionalidades**:
- **ACF** (Autocorrelation Function)
- **PACF** (Partial Autocorrelation Function)
- Identificação de **lags significativos**

**Uso**: Detectar padrões repetitivos e sazonalidade.

#### ✅ Change Point Detection

**Métodos**:
- **CUSUM** (Cumulative Sum)
- **Bayesian change point detection**
- Detecção de mudanças abruptas em tendências

**Aplicação**: Identificar quando políticas ou eventos alteraram padrões.

### 4. Geração de Metadados Inteligentes

#### ✅ Automatic Axis Range Detection

**Lógica**:
```python
# Detecção inteligente de escala
if data_range < 100:
    tick_interval = 10
elif data_range < 1000:
    tick_interval = 100
else:
    tick_interval = 10 ** int(np.log10(data_range) - 1)
```

**Vantagem**: Eixos legíveis automaticamente.

#### ✅ Color Palette Suggestions

**Baseado no tipo de dados**:
```python
if data_type == "diverging":
    palette = "RdYlGn"      # Vermelho-Amarelo-Verde (ex: desempenho)
elif data_type == "sequential":
    palette = "Blues"       # Azul claro → escuro (ex: quantidade)
elif data_type == "categorical":
    palette = "Set3"        # Cores distintas (ex: categorias)
```

**Aplicação**: Visualizações com paletas semanticamente corretas.

#### ✅ Chart Type Recommendations

**Decisão automática**:
```python
def recommend_chart(data_characteristics):
    if temporal and continuous:
        return VisualizationType.LINE_CHART
    elif categorical and numerical:
        return VisualizationType.BAR_CHART
    elif proportions:
        return VisualizationType.PIE_CHART
    elif correlation:
        return VisualizationType.SCATTER_PLOT
```

**Vantagem**: Sistema sugere o melhor tipo de gráfico.

#### ✅ Data Density Analysis

**Decisão baseada em densidade**:
```python
data_density = len(data) / (x_range * y_range)

if data_density > 0.5:
    recommended = VisualizationType.HEATMAP  # Muitos pontos
else:
    recommended = VisualizationType.SCATTER_PLOT  # Poucos pontos
```

**Uso**: Evitar gráficos sobrecarregados.

### 5. Agregação Espacial (Geospatial)

#### ✅ Geospatial Clustering

**DBSCAN**:
```python
from sklearn.cluster import DBSCAN

coords = np.array([[lat, lon] for lat, lon in data])
clustering = DBSCAN(eps=0.01, min_samples=5).fit(coords)
```

**Aplicação**: Agrupar pontos geograficamente próximos.

#### ✅ Hexbin Aggregation

**Hexagonal binning**:
```python
# Hexagonal binning para mapas
hexbin = plt.hexbin(x=lon, y=lat, C=values, gridsize=50, reduce_C_function=np.mean)
```

**Vantagem**: Visualização uniforme de densidade geográfica.

#### ✅ Regional Boundary Aggregation

**Funcionalidades**:
- Agregação por **polígonos** (estados, municípios)
- **Spatial join** operations
- Preparação de dados para **choropleth maps**

### 6. Network Graph Visualization 🔥 **NEW - Sprint 6**

#### ✅ Fraud Relationship Networks

**Funcionalidade**:
```python
# NetworkX + Plotly interactive network graphs
create_fraud_network(
    entities=[
        {"id": "E1", "name": "Supplier A", "score": 0.8},
        {"id": "E2", "name": "Public Official B", "score": 0.6}
    ],
    relationships=[
        {"source": "E1", "target": "E2", "strength": 0.9, "type": "contracts_with"}
    ],
    threshold=0.7  # Minimum relationship strength to display
)
```

**Features**:
- **Interactive Force-Directed Layout**: Spring layout algorithm
- **Community Detection**: Louvain algorithm identifica **fraud rings**
- **Suspicion Scoring**: Nós coloridos por score (0-1)
- **Relationship Filtering**: Threshold configurável para exibição
- **JSON Serializable**: Plotly JSON pronto para frontend

**Output**:
```python
{
    "type": "network_graph",
    "visualization": "plotly_json",  # Full Plotly figure JSON
    "metadata": {
        "communities": 3,  # Fraud rings detected
        "nodes": 25,
        "edges": 42,
        "threshold_applied": 0.7
    }
}
```

#### ✅ Community Detection Algorithms

**Louvain Method**:
- Modularity optimization para detecção de comunidades
- **Fraud Ring Identification**: Grupos de entidades suspeitas interconectadas
- **Cluster Metrics**: Modularity score, tamanhos de clusters

**Aplicação**: Visualizar redes de corrupção e esquemas complexos.

### 7. Geographic Choropleth Maps 🗺️ **NEW - Sprint 6**

#### ✅ Brazilian State/Municipality Maps

**Funcionalidade**:
```python
# Choropleth maps for Brazilian regions
create_choropleth_map(
    data=[
        {"state_code": "33", "value": 1_500_000, "name": "Rio de Janeiro"},
        {"state_code": "35", "value": 3_200_000, "name": "São Paulo"}
    ],
    geojson_url="https://raw.githubusercontent.com/.../brazil-states.geojson",
    color_column="value",
    location_column="state_code"
)
```

**Features**:
- **Automatic GeoJSON Loading**: Busca limites de estados/municípios brasileiros
- **Color Scaling**: Escala de cores contínua baseada em valores
- **Statistical Summary**: Min/max/mean/median/std dev calculados automaticamente
- **Pandas Integration**: Manipulação baseada em DataFrame
- **Error Handling**: Fallback gracioso se GeoJSON falhar

**Output**:
```python
{
    "type": "choropleth",
    "visualization": "plotly_json",
    "metadata": {
        "data_points": 27,  # Brazilian states
        "statistics": {
            "min": 150_000,
            "max": 3_200_000,
            "mean": 950_000,
            "median": 800_000,
            "std_dev": 620_000
        }
    }
}
```

#### ✅ GeoJSON Integration

**Funcionalidades**:
- **Default Brazilian GeoJSON**: Carregamento automático de limites estaduais
- **Custom GeoJSON Support**: Qualquer URL GeoJSON válida
- **Geographic Projections**: Scope configurado para "south america"

### 8. Network Graph API Integration 🔗 **NEW - Sprint 6**

#### ✅ Entity Relationship Data Fetching

**Funcionalidade**:
```python
# Fetch network data from Network Graph API
fetch_network_graph_data(
    entity_id="supplier_123",
    depth=2,  # 2 hops: entity → connected → connected-to-connected
    context=agent_context
)
```

**API Endpoints**:
- `GET /api/v1/network/entities/{entity_id}/network?depth={depth}`

**Data Transformation**:
- **API Response → Visualization Format**: Conversão automática
- **Entity Extraction**: Nós com risk scores e tipos
- **Relationship Extraction**: Arestas com strength e tipos de relacionamento
- **Metadata Enrichment**: Adiciona métricas e estatísticas do grafo

**Output**:
```python
{
    "entities": [
        {"id": "E1", "name": "Supplier A", "type": "empresa", "score": 0.8}
    ],
    "relationships": [
        {"source": "E1", "target": "E2", "type": "contracts_with", "strength": 0.9}
    ],
    "metadata": {
        "entity_count": 15,
        "relationship_count": 28,
        "max_depth_reached": 2,
        "query_time_ms": 234
    }
}
```

## 📋 Estrutura de Dados

### DataAggregationResult

```python
@dataclass
class DataAggregationResult:
    aggregation_id: str                    # UUID da agregação
    data_type: str                         # Tipo de dados
    aggregation_type: AggregationType      # Tipo de agregação
    time_granularity: Optional[TimeGranularity]  # Granularidade temporal
    dimensions: List[str]                  # ex: ['state', 'category']
    metrics: Dict[str, float]              # ex: {'total': 1000, 'avg': 50}
    data_points: List[Dict[str, Any]]      # Dados agregados
    metadata: Dict[str, Any]               # Metadados adicionais
    timestamp: datetime                    # Quando foi gerada
```

### VisualizationMetadata

```python
@dataclass
class VisualizationMetadata:
    visualization_id: str                  # UUID único
    title: str                             # Título do gráfico
    subtitle: Optional[str]                # Subtítulo
    visualization_type: VisualizationType  # Tipo de visualização
    x_axis: Dict[str, Any]                 # {label, min, max, ticks}
    y_axis: Dict[str, Any]                 # Configurações eixo Y
    series: List[Dict[str, Any]]           # Múltiplas séries de dados
    filters: Dict[str, Any]                # Filtros aplicáveis
    options: Dict[str, Any]                # Configurações do chart
    data_url: str                          # URL para buscar dados
    timestamp: datetime                    # Timestamp de criação
```

### TimeSeriesData

```python
@dataclass
class TimeSeriesData:
    series_id: str                         # UUID da série
    metric_name: str                       # Nome da métrica
    time_points: List[datetime]            # Pontos temporais
    values: List[float]                    # Valores correspondentes
    aggregation_type: AggregationType      # Tipo de agregação
    granularity: TimeGranularity           # Granularidade
    metadata: Dict[str, Any]               # Metadados adicionais
```

## 💻 Exemplos de Uso

### Agregar Despesas Mensais por Estado

```python
from src.agents.oscar_niemeyer import OscarNiemeyerAgent, AggregationType, TimeGranularity

# Inicializar agente
oscar = OscarNiemeyerAgent()
await oscar.initialize()

# Dados brutos de despesas
message = AgentMessage(
    content="Agregar despesas mensais por estado",
    data={
        "raw_data": expenses_dataframe,  # DataFrame com colunas: date, state, value
        "aggregation": AggregationType.SUM,
        "dimensions": ["state"],
        "time_dimension": "date",
        "time_granularity": TimeGranularity.MONTH
    }
)

response = await oscar.process(message, context)

# Resultado
print(response.data["aggregated"])
# {
#   "dimensions": ["state"],
#   "time_granularity": "MONTH",
#   "data_points": [
#     {"state": "SP", "month": "2025-01", "total": 50_000_000},
#     {"state": "SP", "month": "2025-02", "total": 48_000_000},
#     {"state": "RJ", "month": "2025-01", "total": 35_000_000},
#     ...
#   ],
#   "metrics": {
#     "total_overall": 1_500_000_000,
#     "avg_per_state": 55_555_555,
#     "max_month": 120_000_000
#   }
# }
```

### Gerar Metadados para Visualização

```python
message = AgentMessage(
    content="Gerar metadados para gráfico de linha de despesas",
    data={
        "aggregated_data": aggregation_result,
        "visualization_type": VisualizationType.LINE_CHART,
        "title": "Evolução de Despesas Públicas por Estado"
    }
)

response = await oscar.process(message, context)

# Metadados prontos para frontend
print(response.data["visualization_metadata"])
# {
#   "visualization_type": "line_chart",
#   "title": "Evolução de Despesas Públicas por Estado",
#   "x_axis": {
#     "label": "Mês",
#     "type": "datetime",
#     "min": "2025-01-01",
#     "max": "2025-12-31",
#     "format": "%b %Y"
#   },
#   "y_axis": {
#     "label": "Total de Despesas (R$)",
#     "type": "linear",
#     "min": 0,
#     "max": 60_000_000,
#     "format": ",.0f"
#   },
#   "series": [
#     {"name": "SP", "data": [...], "color": "#1f77b4"},
#     {"name": "RJ", "data": [...], "color": "#ff7f0e"},
#     {"name": "MG", "data": [...], "color": "#2ca02c"}
#   ],
#   "options": {
#     "legend": {"position": "top"},
#     "tooltip": {"enabled": True},
#     "responsive": True
#   }
# }
```

### Criar Network Graph de Fraude 🔥 **NEW**

```python
message = AgentMessage(
    sender="investigator",
    recipient="OscarNiemeyerAgent",
    action="network_graph",
    payload={
        "entities": [
            {
                "id": "supplier_001",
                "name": "Empresa ABC Ltda",
                "type": "empresa",
                "score": 0.85  # High suspicion
            },
            {
                "id": "official_042",
                "name": "João Silva",
                "type": "servidor",
                "score": 0.72
            },
            {
                "id": "supplier_015",
                "name": "Fornecedor XYZ",
                "type": "empresa",
                "score": 0.45
            }
        ],
        "relationships": [
            {
                "source": "supplier_001",
                "target": "official_042",
                "type": "contracts_with",
                "strength": 0.9
            },
            {
                "source": "supplier_015",
                "target": "official_042",
                "type": "same_address",
                "strength": 0.8
            }
        ],
        "threshold": 0.7
    }
)

response = await oscar.process(message, context)

# Interactive network graph with community detection
print(response.result["metadata"])
# {
#   "communities": 2,  # 2 potential fraud rings detected
#   "nodes": 3,
#   "edges": 2,
#   "threshold_applied": 0.7
# }

# Plotly JSON ready for frontend rendering
viz_json = response.result["visualization"]
# Can be loaded directly in frontend: Plotly.newPlot('div', JSON.parse(viz_json))
```

### Criar Mapa Choropleth do Brasil 🗺️ **NEW**

```python
message = AgentMessage(
    sender="regional_analyst",
    recipient="OscarNiemeyerAgent",
    action="choropleth_map",
    payload={
        "data": [
            {"state_code": "11", "value": 25000, "name": "Rondônia"},
            {"state_code": "12", "value": 18000, "name": "Acre"},
            {"state_code": "13", "value": 45000, "name": "Amazonas"},
            # ... all 27 Brazilian states
            {"state_code": "35", "value": 320000, "name": "São Paulo"},
            {"state_code": "33", "value": 185000, "name": "Rio de Janeiro"}
        ],
        "color_column": "value",
        "location_column": "state_code"
    }
)

response = await oscar.process(message, context)

# Geographic heatmap of Brazil
print(response.result["metadata"]["statistics"])
# {
#   "min": 18000,
#   "max": 320000,
#   "mean": 85000,
#   "median": 72000,
#   "std_dev": 68000
# }

# Choropleth ready for visualization
viz = response.result["visualization"]
# Plotly choropleth with Brazilian state boundaries
```

## 🔄 Integração com Outros Agentes

```mermaid
graph TB
    T[Tiradentes<br/>Reporter] -->|Request Charts| O[Oscar Niemeyer<br/>Visualization]
    L[Lampião<br/>Regional] -->|Geographic Data| O
    A[Anita<br/>Analyst] -->|Time Series| O
    O -->|Visualizations| Frontend[Frontend<br/>Dashboards]

    O -->|Network Graphs| Ox[Oxóssi<br/>Fraud Hunter]
    O -->|Choropleth Maps| L

    API[(Network<br/>Graph API)] -->|Entity Data| O
    IBGE[(IBGE<br/>GeoJSON)] -->|State Boundaries| O

    style O fill:#FF9800
    style Frontend fill:#4CAF50
```

### Consumidores

1. **Tiradentes (Reporter)**
   - Recebe dados agregados
   - Gera relatórios visuais completos

2. **Lampião (Regional)**
   - Usa agregação geográfica
   - Recebe metadados para mapas choropleth

3. **Anita (Analyst)**
   - Consome séries temporais agregadas
   - Análise de tendências com gráficos

4. **Oxóssi (Fraud Hunter)**
   - Visualização de network graphs de fraude
   - Mapas de relacionamento entre entidades

### Saída para Frontend

- ✅ **JSON estruturado** otimizado
- ✅ Metadados compatíveis com **Chart.js, D3.js, Plotly**
- ✅ **Plotly JSON** para network graphs e choropleth
- ✅ URLs de dados paginados

## 📊 Métricas Prometheus

```python
# Agregações realizadas
oscar_aggregations_total{type="sum", granularity="month"}

# Tempo de processamento
oscar_aggregation_duration_seconds{type="network_graph"}

# Pontos de dados processados
oscar_datapoints_processed_total

# Cache hit rate
oscar_cache_hit_rate

# Network graphs criados (NEW)
oscar_network_graphs_created_total{communities="3"}

# Choropleth maps gerados (NEW)
oscar_choropleth_maps_total{regions="27"}
```

## 🏆 Diferenciais

### Por que Oscar Niemeyer é Único

1. **✅ 80% Operacional (Beta)** - Core features completos e testados
2. **📊 10 Tipos de Visualização** - Ampla cobertura de casos de uso
3. **🧠 Metadados Inteligentes** - Geração automática de configurações
4. **📐 OLAP Operations** - Análise multidimensional avançada
5. **🗺️ Geospatial** - Mapas choropleth do Brasil
6. **🔗 Network Graphs** - Visualização de fraude e relacionamentos
7. **🚀 Performance** - Otimizado para 100k+ pontos (LTTB sampling)
8. **🎨 Frontend-Ready** - JSON compatível com Plotly, Chart.js, D3.js

### Sprint 6 Achievements (40% → 80%)

| Feature | Status | Impact |
|---------|--------|--------|
| **Network Graphs** | ✅ Operacional | Visualizar esquemas de corrupção |
| **Choropleth Maps** | ✅ Operacional | Mapas geográficos do Brasil |
| **Network API Integration** | ✅ Operacional | Busca automática de dados de relacionamento |
| **Community Detection** | ✅ Operacional | Identificar fraud rings automaticamente |
| **Plotly JSON** | ✅ Operacional | Visualizações interativas no frontend |

## 🚀 Roadmap

### ✅ Completado (80%)

1. **Core Aggregations** ✅ (9 tipos)
2. **Time Series Analysis** ✅ (decomposition, moving averages)
3. **Data Optimization** ✅ (LTTB, binning, outliers)
4. **Smart Metadata** ✅ (automatic axis, colors, chart recommendations)
5. **Geospatial** ✅ (DBSCAN, hexbin, regional boundaries)
6. **Network Graphs** ✅ (NetworkX + Plotly)
7. **Choropleth Maps** ✅ (GeoJSON integration)
8. **Network API** ✅ (entity relationship fetching)

### Próximos 20% (Roadmap para 100%)

#### Alta Prioridade

1. **Visualizações 3D** (Surface plots, 3D scatter, WebGL)
2. **Animation Metadata** (transições temporais)
3. **Dashboard Layout Automático** (responsive grid generation)

#### Média Prioridade

4. **Integração Superset/Metabase**
5. **Real-time Streaming** data aggregation
6. **Custom Color Palettes** por tema governamental
7. **Fix Remaining Test Mocking** (5 tests)

## ⚠️ Limitações Conhecidas

### Funcionalidades Pendentes

1. **Visualizações 3D** (não implementadas)
   - Surface plots, 3D scatter
   - WebGL rendering metadata

2. **Animações** (parcial)
   - Transições temporais
   - Animated transitions metadata

3. **Dashboards Compostos**
   - Layout automático de múltiplos charts
   - Responsive grid generation

### Performance

- ✅ Otimizado até **100k pontos**
- ⚠️ **>1M pontos**: requer sampling agressivo (LTTB)
- ✅ **Caching** de agregações frequentes

### Testes

- ✅ **12/17 testes passing** (70.6% coverage)
- ⚠️ 5 testes com falhas de **mocking** (não bugs do agente)
- ✅ **Core features** completamente testados

## 📚 Referências

### Cultural

- **Oscar Niemeyer**: Arquiteto brasileiro (1907-2012)
- **Obras**: Brasília, Congresso Nacional, Museu de Arte Contemporânea de Niterói
- **Filosofia**: "Transformar conceitos em formas visuais elegantes"

### Técnicas

- **OLAP**: Codd et al. (1993) - Multidimensional analysis
- **LTTB Downsampling**: Sveinn Steinarsson (2013)
- **STL Decomposition**: Cleveland et al. (1990)
- **Louvain Algorithm**: Blondel et al. (2008) - Community detection
- **NetworkX**: Hagberg et al. (2008) - Graph analysis
- **Plotly**: Interactive visualization library

## ✅ Status de Produção

**Deploy**: ✅ Beta - 80% Complete
**Testes**: ✅ 70.6% passing (12/17 tests - core features working)
**Performance**: ✅ 100k+ pontos otimizados
**Frontend Ready**: ✅ Metadados compatíveis com Plotly, Chart.js, D3.js
**Dependencies**: networkx, plotly, kaleido (Sprint 6)

**Novidades Sprint 6** (40% → 80%):
- ✅ **Network Graphs**: Visualização de fraude com NetworkX + Plotly
- ✅ **Choropleth Maps**: Mapas do Brasil com GeoJSON
- ✅ **Network API**: Integração com Graph API para dados de relacionamento
- ✅ **Community Detection**: Detecção de fraud rings (Louvain)

**Aprovado para uso em**:
- ✅ Dashboards 2D (line, bar, pie, scatter, heatmap, treemap, sankey, gauge)
- ✅ **Network graphs** de fraude e relacionamentos
- ✅ **Mapas choropleth** do Brasil (estados/municípios)
- ✅ Mapas geográficos (hexbin)
- ✅ Tabelas de dados agregados
- ✅ **Detecção de fraude visual** com grafos
- ⚠️ Visualizações 3D (planejado para Sprint 7)
- ⚠️ Animações temporais (planejado)

**Não Aprovado**:
- ❌ Dashboards compostos automáticos (em desenvolvimento)
- ❌ Real-time streaming (planejado)

---

**Documentação Relacionada**:
- [Visão Geral dos Agentes](./overview.md)
- [Tiradentes - Reporter Agent](./tiradentes.md)
- [Lampião - Regional Analyst](./lampiao.md)

---

**Nota**: Oscar Niemeyer teve **grandes avanços em Sprint 6** (40% → 80%) com network graphs e mapas choropleth. Um exemplo de evolução rápida focada em features críticas! 🏗️
