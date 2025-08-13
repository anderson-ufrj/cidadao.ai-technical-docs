# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Cidadão.AI Technical Documentation** project - a Docusaurus v3 site that provides comprehensive technical documentation for the Cidadão.AI Backend system. The project documents a multi-agent AI system for Brazilian government transparency analysis.

## Development Commands

### Common Commands
```bash
# Install dependencies
npm install

# Development server (hot reload at http://localhost:3000)
npm start

# Production build
npm run build

# Serve production build locally
npm run serve

# Clear Docusaurus cache (use when having build issues)
npm run clear

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Internationalization Commands
```bash
# Generate translation files for English
npm run write-translations -- --locale en-US

# Start development server in specific locale
npm start -- --locale en-US

# Build includes all locales automatically
npm run build
```

## Architecture and Structure

### Technology Stack
- **Framework**: Docusaurus v3.6.3 with TypeScript
- **Math**: KaTeX/LaTeX support via remark-math and rehype-katex
- **Diagrams**: Mermaid.js integration for flowcharts and sequence diagrams
- **Styling**: Custom CSS with Brazilian cultural theming
- **i18n**: Native Docusaurus internationalization (pt-BR, en-US)

### Key Configuration Files
- `docusaurus.config.ts` - Main configuration with themes, plugins, navbar/footer
- `sidebars.ts` - Documentation navigation structure (also `sidebars-full.ts`, `sidebars-minimal.ts`)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with Docusaurus presets

### Content Structure
```
docs/
├── intro.md                    # Main introduction
├── getting-started.md          # Quick start guide
├── architecture/               # System architecture docs
│   ├── overview.md            # Core system architecture
│   ├── multi-agent-system.md  # Multi-agent patterns
│   └── data-pipeline.md       # ETL and data processing
├── agents/                     # Multi-agent system documentation
│   ├── overview.md            # Agent system overview
│   ├── abaporu-master.md      # Master agent (orchestrator)
│   ├── zumbi.md              # Investigator agent
│   └── [other-agents].md     # 15+ specialized agents
├── api/                       # API documentation
│   ├── overview.md           # API overview
│   ├── endpoints/            # Detailed endpoint docs
│   └── authentication.md     # JWT auth patterns
├── math/                      # Mathematical foundations
│   ├── algorithms.md         # ML algorithms
│   └── theoretical-foundations.md
└── ml/                       # ML pipeline docs
    └── pipeline-overview.md   # MLOps pipeline
```

## Key Development Patterns

### Documentation Writing Standards
- Use Brazilian cultural theming and emoji prefixes (🎯, 🤖, 📊, etc.)
- Support bilingual content (pt-BR default, en-US translations)
- Include mathematical formulas using KaTeX syntax: `$inline$` or `$$display$$`
- Use Mermaid diagrams for system architecture visualization
- Follow Docusaurus admonitions: `:::tip`, `:::info`, `:::warning`, `:::danger`

### Content Organization
- Each major section has an `overview.md` file
- Agent documentation follows naming pattern: `[historical-figure].md`
- API endpoints documented in structured `/endpoints/` subdirectory
- Mathematical content includes LaTeX formulas and proofs
- Architecture docs include both system-level and component-level views

### Styling and Theming
- Custom CSS in `src/css/custom.css` with Brazilian color scheme
- Dark/light mode support with automatic detection
- Mobile-responsive design with touch-friendly navigation
- Custom fonts: Inter (body), JetBrains Mono (code)

## Special Features

### Mathematical Documentation
- Full KaTeX support for LaTeX math rendering
- Custom theorem and proof environments using admonitions
- Inline math: `$H(X) = -\sum P(x_i) \log P(x_i)$`
- Display math blocks for complex formulas

### Multi-Agent System Documentation
- Documents 17 specialized AI agents with Brazilian historical names
- Covers agent communication patterns, BDI architecture, and coordination
- Includes system diagrams showing agent interactions and hierarchies

### Brazilian Cultural Identity
- Agent names based on Brazilian historical figures (Zumbi, Tiradentes, Abaporu, etc.)
- Portuguese-first documentation with English translations
- Cultural theming throughout UI and content

## Troubleshooting

### Common Issues
- **Build failures**: Run `npm run clear` to clear Docusaurus cache
- **Math not rendering**: Ensure KaTeX stylesheets are loaded in `docusaurus.config.ts`
- **Translation issues**: Check `i18n/` folder structure and locale configurations
- **Mermaid diagrams not showing**: Verify `@docusaurus/theme-mermaid` plugin is enabled

### Performance Considerations
- Large documentation site - builds may take 2-3 minutes
- Math rendering adds build time - consider selective KaTeX loading for production
- Mermaid diagrams render client-side - ensure JavaScript is enabled

## Deployment

The site is configured for GitHub Pages deployment with:
- Base URL: `/cidadao.ai-backend/`
- Organization: `anderson-ufrj`
- Deployment branch: `gh-pages`
- Automated builds via GitHub Actions (configured in main repo)

## Content Guidelines

When editing documentation:
- Maintain consistency with Brazilian cultural theming
- Include practical code examples for API endpoints
- Use mathematical notation for algorithm descriptions
- Create Mermaid diagrams for complex system interactions
- Ensure all content works in both Portuguese and English
- Test mathematical formulas render correctly in both themes