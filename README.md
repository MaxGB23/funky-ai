# 👻 Funky AI v2.1.0: Índice y Mapa de Navegación

Bienvenido a la matriz documental de **Funky AI**, el protocolo de Inteligencia Artificial que te permite emular redes asíncronas de agentes (SDD) usando recursos manuales y archivos físicos locales sobre el IDE Antigravity.

> **🚀 Estado del Arte (v2.3.0 — Protocolos On-Demand):** Introducción de Protocolos On-Demand. Se habilita al Orquestador a sugerir roles especializados (ej. "Abogado del Diablo") solo para tareas de alto riesgo, protegiendo el prompt global del *Context Dilution*. CLI `funky init` actualizado con selector interactivo de protocolos opt-in.

> **🛡️ CI Status:** ![CI](https://github.com/MaxGB23/funky-ai/actions/workflows/ci.yml/badge.svg)

> **¿Perdido?** Empezá por el **Manifiesto** → leé la **Filosofía** → aplicá la **Team Guide**.

---

## 🏛️ 1. Core Concepts (Teoría Fundamental)
*Leer una sola vez para entender el sistema.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/core-concepts/manifiesto.md`](./docs/funky-ai/core-concepts/manifiesto.md) | Qué es Funky AI y sus 6 Reglas Inviolables |
| [`docs/funky-ai/core-concepts/filosofia.md`](./docs/funky-ai/core-concepts/filosofia.md) | Cómo funciona Gentle AI por dentro y cómo lo adaptamos |
| [`docs/funky-ai/core-concepts/rules-vs-skills.md`](./docs/funky-ai/core-concepts/rules-vs-skills.md) | Cuándo una lógica va en Rule vs en Skill |
| [`docs/funky-ai/core-concepts/testing-landscape.md`](./docs/funky-ai/core-concepts/testing-landscape.md) | Landscape de testing: Vitest, TDD y CI en el ecosistema Funky AI |
| [`docs/funky-ai/core-concepts/enforcement-vs-documentation.md`](./docs/funky-ai/core-concepts/enforcement-vs-documentation.md) | Por qué documentar no es suficiente sin forzar reglas |

---

## ⚡ 2. Manuales Operativos
*Guías prácticas para el trabajo diario.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/guias/funky-ai.md`](./docs/funky-ai/guias/funky-ai.md) | Protocolo completo: Pilares, Tiers, Engram y Return Envelopes |
| [`docs/funky-ai/guias/funky-ai-team-guide.md`](./docs/funky-ai/guias/funky-ai-team-guide.md) | Paso a paso del Router Humano: cómo crear Workers, cuándo matarlos |
| [`docs/funky-ai/workflows/guia-flujo-completo.md`](./docs/funky-ai/workflows/guia-flujo-completo.md) | Guía End-to-End de inicio y SDD con el CLI |
| [`docs/funky-ai/workflows/funky-init-flow.md`](./docs/funky-ai/workflows/funky-init-flow.md) | Flujo detallado de la inicialización y el ecosistema |

---

## 🧠 3. Configuración del Sistema (IDE Setup)
*Archivos a inyectar en Antigravity para activar el protocolo.*

| Archivo | Propósito |
|---|---|
| [`docs/prompts/GEMINI-funky-global.md`](./docs/prompts/GEMINI-funky-global.md) | Perfil Global: Personalidad, Auto-Descubrimiento de Skills, Protocolo MCP |
| [`.agents/rules/engram-protocol.md`](./.agents/rules/engram-protocol.md) | Rule Topológica: Dispara el polling de memoria en carpeta `docs/` |
| [`.agents/rules/secops.md`](./.agents/rules/secops.md) | Rule de Seguridad: Obliga uso de `pnpm`, auditoría de `package.json` |
| [`.agents/rules/sdd-orchestrator.md`](./.agents/rules/sdd-orchestrator.md) | Rule del Orquestador: Aplicar para planificación de proyectos |
| [`.agents/protocols/index.md`](./.agents/protocols/index.md) | Catálogo de Protocolos On-Demand (Roles sugeridos dinámicamente) |

---

## 🛠️ 4. Herramientas CLI (Automatización)
*Automatización del SDD y Bootstrap.*

| Comando | Propósito |
|---|---|
| `funky init` | Inyecta reglas, memoria (ecosystem) y genera/consume un `PROJECT-CANVAS.md` (modo interactivo y headless). |
| `funky assess` | Evalúa el `architecture-assessment.md` con 3 reglas determinísticas. Genera un Challenge Pack si detecta riesgos. |
| `funky estimate` | Calcula costo estimado cruzando el Canvas técnico con factores de negocio. Genera `pricing-analysis.md`. |
| `funky feature <name>` | Inicializa el scaffolding SDD estándar (Tier 1–3) en `docs/openspec/changes/<name>/`. |
| `funky gentle <name>` | Inicializa el scaffolding **Tier 4 (Gentle SDD)** en `docs/openspec/gentle/<name>/`. 7 roles aislados para tareas hipercríticas. |
| `funky phase <fase>` | Inyecta templates SDD individuales (explore, proposal, tasks, handoff, report). |
| `funky release <version>` | Genera release notes estandarizados automáticamente. |
| `pnpm test` *(en `funky-cli/`)* | Ejecuta la suite Vitest (TDD). Corre automáticamente en CI vía GitHub Actions. |

---

## 📦 5. Roadmap y Releases
*Estado del proyecto y planificación de versiones.*

| Archivo | Propósito |
|---|---|
| [`v2.1.0-release.md`](./docs/funky-ai/releases/v2.1.0-release.md) | ⭐ **Actual** — Protocolos On-Demand: Protocolos selectivos, selector interactivo en CLI y `devil-advocate.md` |
| [`v2.0.1-release.md`](./docs/funky-ai/releases/v2.0.1-release.md) | Fix Asimetria Operativa: Orquestador → Capa 2, rescate Auto-Tiering (Feature 012), nueva guia `agent-config-architecture.md` |
| [`v2.0.0-release.md`](./docs/funky-ai/releases/v2.0.0-release.md) | Arquitectura de Agentes v2.0.0 (Workflows On-Demand y Fragmentación) |
| [`v1.16.0-release.md`](./docs/funky-ai/releases/v1.16.0-release.md) | Handoff Enforcement: Return Statement G1/G2/G3 + prerequisito `view_file tasks.md` en `/sdd-ff` |
| [`v1.15.0-release.md`](./docs/funky-ai/releases/v1.15.0-release.md) | Enforcement Analysis & Housekeeping (v1.14.0 + v1.15.0) |
| [`v1.13.0-release.md`](./docs/funky-ai/releases/v1.13.0-release.md) | Architecture Readiness v2 (NFRs obligatorios en `funky assess`) |
| [`v1.12.0-release.md`](./docs/funky-ai/releases/v1.12.0-release.md) | Architecture Readiness Gate — nuevo comando `funky assess` |

> 📂 [Ver historial completo de releases](./docs/funky-ai/releases/)


---

## 🧠 6. Falso Engram (Memoria del Proyecto)
*La base de datos del sistema. Consultar al inicio de cada sesión.*

| Archivo | Propósito |
|---|---|
| [`docs/engram/index.md`](./docs/engram/index.md) | Índice liviano para Two-Stage Memory Polling |
| [`docs/engram/`](./docs/engram/) | Memoria persistente sharded: discoveries y bugfixes del proyecto |

---

## 📚 7. Referencia e Investigación
*Material de estudio. No se ejecuta directamente.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/auditoria-gentle-ai/auditoria-claude-md.md`](./docs/funky-ai/auditoria-gentle-ai/auditoria-claude-md.md) | Estrategias portables extraídas de Gentle AI CLAUDE.md |
| [`docs/gentle-ai/`](./docs/gentle-ai/) | Documentación original de Gentle AI (solo referencia) |

---

## 🗺️ 8. Journey y Lecciones (Diario de Madurez)
*Registro de decisiones arquitectónicas y evolución del pensamiento.*

| Archivo | Contenido |
|---|---|
| [`docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md`](./docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md) | Cuándo el Orquestador puede escribir y cuándo debe delegar |
| [`docs/funky-ai/journey/journey.md`](./docs/funky-ai/journey/journey.md) | Bitácora principal del viaje de construcción |
| [`docs/funky-ai/retrospectivas-lecciones/v1.7.0-smoke-test.md`](./docs/funky-ai/retrospectivas-lecciones/v1.7.0-smoke-test.md) | Retrospectiva y smoke test de la versión 1.7.0 |
