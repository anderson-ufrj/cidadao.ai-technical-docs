import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: '🏗️ Arquitetura',
      collapsible: true,
      collapsed: true,
      items: [
        'architecture/overview',
        'architecture/design-sistema',
        'architecture/system-architecture',
        'architecture/multi-agent-system',
        'architecture/data-pipeline',
        'architecture/literature-review',
        'architecture/theoretical-foundations',
      ],
    },
    {
      type: 'category',
      label: '🤖 Agentes Especializados (17)',
      collapsible: true,
      collapsed: false,
      items: [
        'agents/overview',
        'agents/multi-agent-overview',
        {
          type: 'category',
          label: '🎯 Coordenação',
          items: [
            'agents/senna',
            'agents/abaporu',
          ],
        },
        {
          type: 'category',
          label: '🔍 Investigação',
          items: [
            'agents/zumbi',
            'agents/oxossi',
            'agents/obaluaie',
          ],
        },
        {
          type: 'category',
          label: '📊 Análise',
          items: [
            'agents/anita-garibaldi',
            'agents/lampiao',
            'agents/bonifacio',
            'agents/ceuci',
          ],
        },
        {
          type: 'category',
          label: '📝 Processamento',
          items: [
            'agents/machado',
            'agents/dandara',
            'agents/maria-quiteria',
          ],
        },
        {
          type: 'category',
          label: '📢 Comunicação',
          items: [
            'agents/tiradentes',
            'agents/drummond',
            'agents/niemeyer',
          ],
        },
        {
          type: 'category',
          label: '🧠 Suporte',
          items: [
            'agents/nana',
            'agents/deodoro',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🔌 API & Integração',
      collapsible: true,
      collapsed: true,
      items: [
        'api/visao-geral',
        'api/overview',
        'api/autenticacao',
        'api/streaming-sse',
        'api/apis-governamentais',
        {
          type: 'category',
          label: 'Endpoints',
          items: [
            'api/endpoints/visao-geral',
            'api/endpoints/investigacoes',
          ],
        },
        'api/api-reference',
        'api/websocket',
        'api/datasets',
        'api/code-examples',
        'api/swagger-ui',
      ],
    },
    {
      type: 'category',
      label: '📊 Monitoramento & Observabilidade',
      collapsible: true,
      collapsed: true,
      items: [
        'monitoring/overview',
        'monitoring/grafana-prometheus',
        'monitoring/grafana-dashboards',
      ],
    },
    {
      type: 'category',
      label: '🔐 Segurança & Autenticação',
      collapsible: true,
      collapsed: true,
      items: [
        'security/overview',
        'security/oauth-configuration',
      ],
    },
    {
      type: 'category',
      label: '🚀 Deploy & Configuração',
      collapsible: true,
      collapsed: true,
      items: [
        'deployment/railway',
        'deployment/variaveis-ambiente',
        'deployment/docker',
        'deployment/environment-variables',
        'deployment/deployment-guide',
      ],
    },
    {
      type: 'category',
      label: '🧪 Testing',
      collapsible: true,
      collapsed: true,
      items: [
        'testing/overview',
      ],
    },
    {
      type: 'category',
      label: '🎨 Frontend',
      collapsible: true,
      collapsed: true,
      items: [
        'frontend/overview',
      ],
    },
    {
      type: 'category',
      label: '🤖 Machine Learning',
      collapsible: true,
      collapsed: true,
      items: [
        'ml/visao-geral-pipeline',
      ],
    },
    {
      type: 'category',
      label: '🧮 Matemática & Algoritmos',
      collapsible: true,
      collapsed: true,
      items: [
        'math/overview',
        'math/fundamentos-teoricos',
        'math/math-foundations',
        'math/algorithms',
        'math/mathematical-proofs',
        'math/xai-algorithms',
      ],
    },
  ],
};

export default sidebars;