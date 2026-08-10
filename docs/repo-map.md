# Mapa Estructural del Repositorio

> Última actualización: 2026-08-09
> Propósito: Directorio de navegación del repo. Para el pitch y quick start, ver [`README.md`](../README.md).

---

## 📦 Raíz

| Ruta | Propósito |
|------|-----------|
| [`funky-cli/`](../funky-cli/) | Código fuente del CLI |
| [`docs/`](../docs/) | Documentación del framework y tools |
| `.agents/` | Reglas, skills del workspace agéntico, golden templates |
| `.github/` | Workflows de CI/CD |

---

## 🧩 CLI (`funky-cli/`)

| Ruta | Propósito |
|------|-----------|
| [`bin/funky.js`](../funky-cli/bin/funky.js) | Entrypoint del CLI |
| [`src/commands/`](../funky-cli/src/commands/) | Comandos del CLI |
| [`src/templates/`](../funky-cli/src/templates/) | Templates por comando |
| [`src/utils/`](../funky-cli/src/utils/) | Utilidades compartidas |
| [`src/skills/`](../funky-cli/src/skills/) | Skills base (sdd-release, sdd-docs-sync) con manifest por skill |

### Comandos

| Comando | Dominio | Archivo | Docs |
|---------|---------|---------|------|
| `funky init` | forge | [`src/commands/init.js`](../funky-cli/src/commands/init.js) | [`docs/funky-forge/init.md`](../docs/funky-forge/init.md) |
| `funky sdd install` | funky-ai | [`src/commands/sdd.js`](../funky-cli/src/commands/sdd.js) (delega en [`runScaffoldCommand`](../funky-cli/src/commands/scaffold.js)) | [`docs/funky-ai/sdd.md`](../docs/funky-ai/sdd.md) |
| `funky scaffold` | funky-ai | [`src/commands/scaffold.js`](../funky-cli/src/commands/scaffold.js) (`runAgnosticScaffold`) | [`docs/funky-ai/scaffold.md`](../docs/funky-ai/scaffold.md) |
| `funky assess` | forge | [`src/commands/assess.js`](../funky-cli/src/commands/assess.js) | [`docs/funky-forge/assess.md`](../docs/funky-forge/assess.md) |
| `funky estimate` | forge | [`src/commands/estimate.js`](../funky-cli/src/commands/estimate.js) | [`docs/funky-forge/estimate.md`](../docs/funky-forge/estimate.md) |
| `funky feature` | funky-ai | [`src/commands/feature.js`](../funky-cli/src/commands/feature.js) | [`docs/funky-ai/feature.md`](../docs/funky-ai/feature.md) |
| `funky pipeline` | forge | [`src/commands/pipeline.js`](../funky-cli/src/commands/pipeline.js) | [`docs/funky-forge/pipeline.md`](../docs/funky-forge/pipeline.md) |
| `funky engram add` | funky-ai | [`src/commands/engram.js`](../funky-cli/src/commands/engram.js) | [`docs/funky-ai/engram.md`](../docs/funky-ai/engram.md) |
| `funky skills` | funky-ai | [`src/commands/skills.js`](../funky-cli/src/commands/skills.js) | [`docs/funky-ai/skills.md`](../docs/funky-ai/skills.md) |

---

## 📚 Documentación (`docs/`)

```
docs/
├── funky-ai/          ← Framework agéntico (conceptos, scaffold, feature, engram, skills, prompts)
├── funky-forge/       ← Tools de planeación (init, assess, estimate, pipeline)
├── engram/            ← Memoria persistente del sistema
├── issues/            ← Issue tracker local
├── operaciones/       ← CI/CD, QA governance
├── github-logs/       ← Logs de GitHub Actions
└── repo-map.md        ← Este archivo
```

### funky-ai (Framework SDD)

| Doc | Contenido |
|-----|-----------|
| [`sdd.md`](../docs/funky-ai/sdd.md) | Árbol completo de inyección del ecosistema agéntico (`funky sdd install`) |
| [`scaffold.md`](../docs/funky-ai/scaffold.md) | Scaffold agnóstico OpenSpec/SDD: set de 4 archivos y diferencia con `funky sdd install` |
| [`feature.md`](../docs/funky-ai/feature.md) | Tiers T1/T2/T3, inyección condicional, golden vs fallback |
| [`engram.md`](../docs/funky-ai/engram.md) | Knowledge base: categorías, flags, buenas prácticas |
| [`skills.md`](../docs/funky-ai/skills.md) | Instalador interactivo de skills: selección, autodetección, manifests, docs compartidos |
| [`conceptos/`](../docs/funky-ai/conceptos/) | Conceptos: arquitectura SDD, manual del orquestador, guía de equipo, flujos de templates (golden vs base), estudios |
| [`prompts/`](../docs/funky-ai/prompts/) | Prompts globales del framework y system prompts de cada fase SDD |
| [`operaciones/qa-governance.md`](../docs/funky-ai/operaciones/qa-governance.md) | QA governance |
| [`releases/`](../docs/funky-ai/releases/) | Release notes y retrospectivas |
| [`historico/`](../docs/funky-ai/historico/) | Journey, releases anteriores |

### funky-forge (Project Planning)

| Doc | Contenido |
|-----|-----------|
| [`README.md`](../docs/funky-forge/README.md) | Mapa de navegación de forge |
| [`command-flow.md`](../docs/funky-forge/command-flow.md) | Cuándo usar cada comando forge |
| [`init.md`](../docs/funky-forge/init.md) | Init: canvases, flujo, outputs |
| [`assess.md`](../docs/funky-forge/assess.md) | Assess: architecture review, preguntas dinámicas |
| [`estimate.md`](../docs/funky-forge/estimate.md) | Estimate: pricing guide, decisiones de costos |
| [`pipeline.md`](../docs/funky-forge/pipeline.md) | Pipeline: cuándo usarlo, context.json |
| [`cli-simulations.md`](../docs/funky-forge/cli-simulations.md) | Simulaciones de uso del CLI |
| [`escenarios-de-uso.md`](../docs/funky-forge/escenarios-de-uso.md) | Escenarios de uso del flujo completo |
| [`funky-init-flow.md`](../docs/funky-forge/funky-init-flow.md) | Flujo detallado de init |

### OpenSpec

| Ruta | Propósito | Autor |
|------|-----------|-------|
| [`openspec/rfcs/`](../openspec/rfcs/) | Brain dump — ideas crudas del humano | Humano |
| [`openspec/changes/`](../openspec/changes/) | Proposals formales del ciclo SDD | Orquestador |
| [`openspec/archive/`](../openspec/archive/) | Features completadas archivadas | Sistema |

---

## 🗂️ Templates (`funky-cli/src/templates/`)

| Directorio | Usado por | Propósito |
|-----------|-----------|-----------|
| `init/` | `funky init` | Brief, canvases y guías (brief-funcional.md, PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide-template.md, init-prompt-template.md) |
| `bootstrap/` | `funky sdd install` / `funky scaffold` / `funky skills` | Reglas agénticas, templates SDD, ORCHESTRATOR-STATE, docs compartidos (docs-live-index, índice seccional) |
| `assess/` | `funky assess` | Architecture review templates |
| `estimate/` | `funky estimate` | Pricing guide templates |

