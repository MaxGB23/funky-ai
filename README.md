# 👻 Funky AI v1.9.0: Índice y Mapa de Navegación

Bienvenido a la matriz documental de **Funky AI**, el protocolo de Inteligencia Artificial que te permite emular redes asíncronas de agentes (SDD) usando recursos manuales y archivos físicos locales sobre el IDE Antigravity.

> **🚀 Estado del Arte (V1.9.0):** El núcleo de Funky AI ha evolucionado. Ahora utilizamos la herramienta `funky-cli` para automatizar el Scaffolding de Falsos Engrams, apoyando al Router Humano con *Slash Commands* de contexto y separación de archivos (*Sharding*) para escalabilidad de memoria. Desde v1.9.0, el sistema cuenta con el **Agent DRY Pattern** que convierte los Handoffs en punteros estrictos, erradicando el síndrome de "Teléfono Descompuesto" en la delegación de LLMs. El CLI tiene soporte para modos **Interactivo y Headless** mediante la generación de un `PROJECT-CANVAS.md`, respaldado por **TDD (Vitest)** y un **pipeline de CI (GitHub Actions)**.

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

---

## 🛠️ 4. Herramientas CLI (Automatización)
*Automatización del SDD y Bootstrap.*

| Comando | Propósito |
|---|---|
| `funky init` | Inyecta reglas, memoria (ecosystem) y genera/consume un `PROJECT-CANVAS.md` (modo interactivo y headless). |
| `funky phase <fase>` | Inyecta templates SDD (explore, proposal, tasks, handoff, report). |
| `pnpm test` *(en `funky-cli/`)* | Ejecuta la suite Vitest (TDD, desde v1.6). Corre automáticamente en CI vía GitHub Actions. |

---

## 📦 5. Roadmap y Releases
*Estado del proyecto y planificación de versiones.*

| Archivo | Propósito |
|---|---|
| [`docs/funky-ai/releases/v1.1.0-release.md`](./docs/funky-ai/releases/v1.1.0-release.md) | Release Notes oficiales de la v1.1.0 |
| [`docs/funky-ai/releases/v1.2.0-release.md`](./docs/funky-ai/releases/v1.2.0-release.md) | Release Notes oficiales de la v1.2.0 |
| [`docs/funky-ai/releases/v1.3.0-release.md`](./docs/funky-ai/releases/v1.3.0-release.md) | Release Notes oficiales de la v1.3.0 |
| [`docs/funky-ai/releases/v1.4.0-release.md`](./docs/funky-ai/releases/v1.4.0-release.md) | Release Notes oficiales de la v1.4.0 |
| [`docs/funky-ai/releases/v1.5.0-release.md`](./docs/funky-ai/releases/v1.5.0-release.md) | Release Notes oficiales de la v1.5.0 |
| [`docs/funky-ai/releases/v1.6.0-release.md`](./docs/funky-ai/releases/v1.6.0-release.md) | Release Notes oficiales de la v1.6.0 (TDD + CI) |
| [`docs/funky-ai/releases/v1.7.0-release.md`](./docs/funky-ai/releases/v1.7.0-release.md) | Release Notes oficiales de la v1.7.0 (Project Canvas) |
| [`docs/funky-ai/releases/v1.8.0-release.md`](./docs/funky-ai/releases/v1.8.0-release.md) | Release Notes oficiales de la v1.8.0 (Token Diet & Action Forcing) |
| [`docs/funky-ai/releases/v1.9.0-release.md`](./docs/funky-ai/releases/v1.9.0-release.md) | Release Notes oficiales de la v1.9.0 (Agent DRY Pattern) |

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
