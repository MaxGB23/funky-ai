# 🦭 Funky AI v1.6.0: Índice y Mapa de Navegación

Bienvenido a la matriz documental de **Funky AI**, el protocolo de Inteligencia Artificial que te permite emular redes asíncronas de agentes (SDD) usando recursos manuales y archivos físicos locales sobre el IDE Antigravity.

> **🚀 Estado del Arte (V1.6.0):** El núcleo de Funky AI ha evolucionado. Ahora utilizamos la herramienta `funky-cli` para automatizar el Scaffolding de Falsos Engrams, apoyando al Router Humano con *Slash Commands* de contexto y separación de archivos (*Sharding*) para escalabilidad de memoria. Desde v1.6, el CLI cuenta con **TDD (Vitest)** y un **pipeline de CI (GitHub Actions)** que garantizan calidad automática en cada push.

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

---

## ⚡ 2. Manuales Operativos
*Guías prácticas para el trabajo diario.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/funky-ai.md`](./docs/funky-ai/funky-ai.md) | Protocolo completo: Pilares, Tiers, Engram y Return Envelopes |
| [`docs/funky-ai/funky-ai-team-guide.md`](./docs/funky-ai/funky-ai-team-guide.md) | Paso a paso del Router Humano: cómo crear Workers, cuándo matarlos |
| [`docs/funky-ai/funky-ai-tutorial-app.md`](./docs/funky-ai/funky-ai-tutorial-app.md) | Simulación End-to-End de un proyecto real |
| [`docs/funky-ai/guia-flujo-completo.md`](./docs/funky-ai/guia-flujo-completo.md) | Guía End-to-End de inicio y SDD con el CLI |

---

## 🧠 3. Configuración del Sistema (IDE Setup)
*Archivos a inyectar en Antigravity para activar el protocolo.*

| Archivo | Propósito |
|---|---|
| [`docs/prompts/GEMINI-funky-global.md`](./docs/prompts/GEMINI-funky-global.md) | Perfil Global: Personalidad, Auto-Descubrimiento de Skills, Protocolo MCP |
| [`.agents/rules/engram-protocol.md`](./.agents/rules/engram-protocol.md) | Rule Topológica: Dispara el polling de memoria en carpeta `docs/` |
| [`.agents/rules/secops.md`](./.agents/rules/secops.md) | Rule de Seguridad: Obliga uso de `pnpm`, auditoría de `package.json` |

---

## 🛠️ 4. Herramientas CLI (Automatización)
*Automatización del SDD y Bootstrap.*

| Comando | Propósito |
|---|---|
| `funky init` | Inyecta las reglas globales y memoria (ecosystem) en un proyecto nuevo. |
| `funky phase <fase>` | Inyecta templates SDD (explore, proposal, tasks, handoff, report). |
| `pnpm test` *(en `funky-cli/`)* | Ejecuta la suite Vitest (TDD, desde v1.6). Corre automáticamente en CI vía GitHub Actions. |

---

## 📦 5. Roadmap y Propuestas
*Estado del proyecto y planificación de versiones futuras.*

| Archivo | Propósito |
|---|---|
| [`docs/BACKLOG.md`](./docs/BACKLOG.md) | ⭐ Backlog Maestro: TODO pendiente, en progreso y completado |
| [`docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md`](./docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md) | Diseño de la v1.2: `funky-cli`, Slash Commands, Doc-Ops |
| [`docs/funky-ai/releases/v1.1.0-release.md`](./docs/funky-ai/releases/v1.1.0-release.md) | Release Notes oficiales de la v1.1.0 |
| [`docs/funky-ai/releases/v1.2.0-release.md`](./docs/funky-ai/releases/v1.2.0-release.md) | Release Notes oficiales de la v1.2.0 |
| [`docs/funky-ai/releases/v1.3.0-release.md`](./docs/funky-ai/releases/v1.3.0-release.md) | Release Notes oficiales de la v1.3.0 |
| [`docs/funky-ai/releases/v1.4.0-release.md`](./docs/funky-ai/releases/v1.4.0-release.md) | Release Notes oficiales de la v1.4.0 |
| [`docs/funky-ai/releases/v1.5.0-release.md`](./docs/funky-ai/releases/v1.5.0-release.md) | Release Notes oficiales de la v1.5.0 |
| [`docs/funky-ai/releases/v1.6.0-release.md`](./docs/funky-ai/releases/v1.6.0-release.md) | Release Notes oficiales de la v1.6.0 (TDD + CI) |

---

## 🧠 6. Falso Engram (Memoria del Proyecto)
*La base de datos del sistema. Consultar al inicio de cada sesión.*

| Archivo | Propósito |
|---|---|
| [`docs/engram/`](./docs/engram/) | Memoria persistente sharded: discoveries y bugfixes del proyecto |

---

## 📚 7. Referencia e Investigación
*Material de estudio. No se ejecuta directamente.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/refactor/auditoria-claude-md.md`](./docs/funky-ai/refactor/auditoria-claude-md.md) | Estrategias portables extraídas de Gentle AI CLAUDE.md |
| [`docs/gentle-ai/`](./docs/gentle-ai/) | Documentación original de Gentle AI (solo referencia) |

---

## 🗺️ 8. Journey (Diario de Madurez)
*Registro de decisiones arquitectónicas y evolución del pensamiento.*

| Archivo | Contenido |
|---|---|
| [`docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md`](./docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md) | Cuándo el Orquestador puede escribir y cuándo debe delegar |
