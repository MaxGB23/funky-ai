# Mapa Estructural del Repositorio

> Última actualización: 2026-07-30
> Propósito: Directorio de navegación del repo. Para el pitch y quick start, ver [`README.md`](../README.md).

---

## 📦 Raíz

| Ruta | Propósito |
|------|-----------|
| [`funky-cli/`](../funky-cli/) | Código fuente del CLI |
| [`docs/`](../docs/) | Documentación del framework y tools |
| [`init-observaciones/`](../init-observaciones/) | Histórico de refactors y exploraciones |
| `.agents/` | Reglas y skills del workspace agéntico |
| `.github/` | Workflows de CI/CD |

---

## 🧩 CLI (`funky-cli/`)

| Ruta | Propósito |
|------|-----------|
| [`bin/funky.js`](../funky-cli/bin/funky.js) | Entrypoint del CLI |
| [`src/commands/`](../funky-cli/src/commands/) | Comandos del CLI |
| [`src/templates/`](../funky-cli/src/templates/) | Templates por comando |
| [`src/utils/`](../funky-cli/src/utils/) | Utilidades compartidas |
| [`scripts/`](../funky-cli/scripts/) | Scripts internos (sync-templates) |

### Comandos

| Comando | Dominio | Archivo | Docs |
|---------|---------|---------|------|
| `funky init` | forge | [`src/commands/init.js`](../funky-cli/src/commands/init.js) | [`docs/funky-forge/init.md`](../docs/funky-forge/init.md) |
| `funky scaffold` | funky-ai | [`src/commands/scaffold.js`](../funky-cli/src/commands/scaffold.js) | [`docs/funky-ai/scaffold.md`](../docs/funky-ai/scaffold.md) |
| `funky assess` | forge | [`src/commands/assess.js`](../funky-cli/src/commands/assess.js) | [`docs/funky-forge/assess.md`](../docs/funky-forge/assess.md) |
| `funky estimate` | forge | [`src/commands/estimate.js`](../funky-cli/src/commands/estimate.js) | [`docs/funky-forge/estimate.md`](../docs/funky-forge/estimate.md) |
| `funky feature` | funky-ai | [`src/commands/feature.js`](../funky-cli/src/commands/feature.js) | [`docs/funky-ai/feature.md`](../docs/funky-ai/feature.md) |
| `funky pipeline` | forge | [`src/commands/pipeline.js`](../funky-cli/src/commands/pipeline.js) | [`docs/funky-forge/pipeline.md`](../docs/funky-forge/pipeline.md) |
| `funky engram add` | funky-ai | [`src/commands/engram.js`](../funky-cli/src/commands/engram.js) | [`docs/funky-ai/engram.md`](../docs/funky-ai/engram.md) |

---

## 📚 Documentación (`docs/`)

```
docs/
├── funky-ai/          ← Framework agéntico (conceptos, scaffold, feature, engram)
├── funky-forge/       ← Tools de planeación (init, assess, estimate, pipeline)
├── engram/            ← Memoria persistente del sistema
├── openspec/          ← RFCs humanos + cambios SDD formales
├── issues/            ← Issue tracker local
├── operaciones/       ← CI/CD, QA governance
├── prompts/           ← Globales del agente
├── references/        ← (reservado)
├── github-logs/       ← Logs de GitHub Actions
└── repo-map.md        ← Este archivo
```

### funky-ai (Framework)

| Doc | Contenido |
|-----|-----------|
| [`scaffold.md`](../docs/funky-ai/scaffold.md) | Árbol completo de inyección del ecosistema agéntico |
| [`feature.md`](../docs/funky-ai/feature.md) | Tiers T1/T2/T3, inyección condicional, golden vs fallback |
| [`engram.md`](../docs/funky-ai/engram.md) | Knowledge base: categorías, flags, buenas prácticas |
| [`conceptos/`](../docs/funky-ai/conceptos/) | Conceptos fundamentales del protocolo |
| [`guias/`](../docs/funky-ai/guias/) | Guías de equipo, SDD survival guide, testing |
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
| [`guia-flujo-completo.md`](../docs/funky-forge/guia-flujo-completo.md) | Guía de testing del ciclo completo |
| [`cli-simulations.md`](../docs/funky-forge/cli-simulations.md) | Simulaciones de uso del CLI |
| [`escenarios-de-uso.md`](../docs/funky-forge/escenarios-de-uso.md) | Escenarios de uso del flujo completo |
| [`funky-init-flow.md`](../docs/funky-forge/funky-init-flow.md) | Flujo detallado de init |
| [`comando-vs-archivos.md`](../docs/funky-forge/comando-vs-archivos.md) | Matriz de qué archivos genera cada comando |

### OpenSpec

| Ruta | Propósito | Autor |
|------|-----------|-------|
| [`openspec/rfcs/`](../docs/openspec/rfcs/) | Brain dump — ideas crudas del humano | Humano |
| [`openspec/changes/`](../docs/openspec/changes/) | Proposals formales del ciclo SDD | Orquestador |
| [`openspec/archive/`](../docs/openspec/archive/) | Features completadas archivadas | Sistema |

---

## 🗂️ Templates (`funky-cli/src/templates/`)

| Directorio | Usado por | Propósito |
|-----------|-----------|-----------|
| `init/` | `funky init` | Canvases (PROJECT-CANVAS.md, INFRA-CANVAS.md) |
| `bootstrap/` | `funky scaffold` | Reglas agénticas, templates SDD, ORCHESTRATOR-STATE |
| `assess/` | `funky assess` | Architecture review templates |
| `estimate/` | `funky estimate` | Pricing guide templates |

---

## 📜 Histórico de Refactors (`init-observaciones/`)

| Ruta | Contenido |
|------|-----------|
| [`refactor-tree/`](../init-observaciones/refactor-tree/) | Puntos 1-6 del refactor de templates (2026-07) |
| [`roadmap/`](../init-observaciones/roadmap/) | Roadmap y diagramas del refactor |
| [`consolidacion/`](../init-observaciones/consolidacion/) | Propuesta de consolidación forge vs framework |
