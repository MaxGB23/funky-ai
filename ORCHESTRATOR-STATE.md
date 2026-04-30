# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.8.1
- **Rama activa:** `main`
- **Última sesión:** 2026-04-30
- **Estado:** 🟢 Auditoría de incongruencias completada con éxito. Guardrails estructurales implementados.

---

## 📂 Archivos Clave

| Archivo | Rol |
|---------|-----|
| `funky-cli/src/commands/init.js` | Comando `funky init` — copia ecosystem bootstrap |
| `funky-cli/src/commands/phase.js` | Comando `funky phase <nombre>` — inyecta templates SDD |
| `funky-cli/src/templates/bootstrap/` | Templates canónicos v1.4 que `init` copia |
| `funky-cli/src/templates/sdd/` | Templates del ciclo SDD que `phase` inyecta |
| `funky-cli/src/templates/sdd/worker-handoff.md` | Template oficial del patrón Worker Handoff |
| `funky-cli/src/utils/canvas.js` | Función pura `generateCanvasMarkdown(config)` — Motor del Project Canvas |
| `docs/engram/discoveries.md` | Memoria de descubrimientos arquitectónicos |
| `docs/engram/bugfixes.md` | Memoria de bugs y fixes |
| `docs/funky-ai/releases/v1.7.0-release.md` | Release notes oficiales de v1.7 |
| `docs/post-mortem.md` | DEPRECATED — apunta al sharded engram |

---

## ✅ Tareas Completadas (v1.5)

- [x] Fase 1 — Templates SDD enriquecidos y con Doc-Ops
- [x] Fase 2 — CLI README creado
- [x] Fase 3 — Deuda de Release remediada
- [x] Fase 4 — Tag v1.5.0 creado

---

## ✅ Tareas Completadas (v1.6)

- [x] Fase 0 — Feature branch `feat/v1.6-tdd-ci` creada
- [x] Fase 1 — Setup Core TDD (Vitest)
- [x] Fase 2 — Refactor de comandos para testabilidad + 10/10 tests
- [x] Fase 3 — GitHub Actions CI Pipeline
- [x] Fase 4 — Tag v1.6.0 creado, merge a `main`

## ✅ Tareas Completadas (v1.7)

- [x] Fase 0 — Rama `feat/v1.7-project-canvas` creada
- [x] Fase 1 — Motor de Generación `generateCanvasMarkdown` + Unit Tests
- [x] Fase 2 — Refactor `runInit` + Integration Tests contra disco real
- [x] Fase 3 — CLI Interactivo con `@clack/prompts` (flujo dual Headless/Interactivo)
- [x] Fase 4 — Tests 14/14 ✅, README bumped a v1.7.0, Release Notes creadas, Deuda Sistémica saldada

---

## ⏳ Tareas Pendientes

- [x] **Cleanup de Archivos Huérfanos:** Hacer una auditoría y limpieza de archivos generados sueltos (como `report.md` u otros artifacts) en la raíz y en directorios obsoletos, para consolidarlos en el flujo estandarizado de `docs/openspec/changes/`.
- [x] **Inclusión de Planning Guide en Scaffold:** Modificar `funky init` para que al ejecutarse copie automáticamente la guía de planeación (`canvas-planning-guide.md`) a la carpeta `docs/funky-ai/cli/` del nuevo workspace. (Fixeado en fase de pulido).
- [x] **Fix Bug Crítico v1.7.0**: La función `runInit` sobreescribe el archivo `PROJECT-CANVAS.md` cuando se detecta el modo Headless (`canvasConfig.fromHeadless`). (Fixeado + TDD).
- [x] **Auditoría de Inconsistencias**: Revisión exhaustiva completada. Se detectaron y mitigaron 3 vectores de falla destructivos y de UX en `init.js`.
- [x] **Fix Template Sync Drift**: Script `sync-templates.js` creado y atado a `pretest`. Las reglas ahora se sincronizan automáticamente antes de cada test run. ✅
- [x] **Fix Incomplete Scaffolding**: `init.js` ahora copia `plantilla-worker-handoff.md` al nuevo ecosistema. 17/17 tests en verde. ✅
- [x] **Smoke Test v1.7.0 (Reintento Final)**: Ejecutar el flujo out-of-workspace completo luego de aplicar los fixes de scaffolding. (Aprobado en Escenarios v2).
- [ ] **Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [x] **Smoke Test v1.7.0 (Intento 1)**: ❌ CANCELADO. Se detectó bug destructivo en modo Headless mediante análisis de código previo a la ejecución.
- [x] **Deuda Sistémica:** El template `funky-cli/src/templates/sdd/tasks.md` debe reforzar la Fase de Release con checklist explícito de README + release notes. El Orquestador volvió a omitirla en v1.6 a pesar de estar documentada en `[DISCOVERY][release-dod-gap]`.
- [x] **Auditoría de Journey:** Levantar un Worker para actualizar `docs/funky-ai/journey` con los aprendizajes de TDD, arquitectura SDD y repasar los releases anteriores (v1.0 a v1.5) para asentar lecciones aprendidas.
- [x] **v1.7 (Propuesta):** ✅ COMPLETADA — `funky init` genera `PROJECT-CANVAS.md` dinámico con modos interactivo y headless. Listo para merge y tag v1.7.0.
- [x] **v1.7 Testing:** ✅ COMPLETADA — Unit tests + Integration tests implementados. 14/14 tests pasando.
- [ ] **Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 1](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 2](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.
- [ ] **Optimización del Memory Polling:** Comprobar que el agente efectivamente investigue en el engram cuando sea necesario, y auditar si `grep_search` consume demasiados tokens en archivos largos. Evaluar nuevas estrategias de búsqueda indexada o fragmentada (ya que no contamos con SQLite/vectores como Gentle AI) para no agotar la ventana de contexto.
- [x] **Auditoría de Sobrecarga Cognitiva (Worker Handoff):** Revisar si las reglas globales y la documentación de orquestación (`sdd-orchestrator.md`, rules) saturan la ventana de contexto de los agentes. ✅ Completada (v1.8.0).
- [ ] **Agent DRY Pattern (Backlog v1.9.0):** Refactorizar el protocolo de Handoffs para evitar el síndrome del teléfono descompuesto en los LLMs. → Contexto completo en [`docs/openspec/backlog/agent-dry-handoffs.md`](./docs/openspec/backlog/agent-dry-handoffs.md)
- [x] **Auditoría de Incongruencias Documentales:** Realizar un análisis robusto para detectar cualquier archivo legacy (ej. `sdd-proposal.md`), referencias a archivos deprecados (como `post-mortem.md`) e inconsistencias lógicas o choques entre las reglas/docs actuales y las versiones obsoletas del proyecto.
- [x] **Actualización Estructural del README:** Actualizar el README principal para reflejar la nueva estructura de directorios resultante tras las auditorías y la limpieza de archivos huérfanos.

---

## 🐛 Bugs Activos
Ninguno.

---

## 📋 Historial de Versiones

| Versión | Descripción |
|---------|-------------|
| v1.0 | Setup inicial del protocolo Funky AI |
| v1.1 | Reglas SDD en `.agents/rules/` (workspace-scoped) |
| v1.2 | Engram sharding — `docs/engram/discoveries.md` + `bugfixes.md` |
| v1.3 | Protocolo Worker Handoff + Memory Polling canonizado |
| v1.4 | `funky init` + `funky phase` — CLI bootstrapper completo |
| v1.5 | Templates SDD enriquecidos, Doc-Ops jerarquía Tier N y CLI README |
| v1.6 | TDD (Vitest) + CI (GitHub Actions) + Refactor para Testabilidad |
| v1.7 | Project Canvas v2 Dinámico y fixes de legacy pipeline. Tests refactorizados (18/18). |
| v1.8.0 | Cognitive Audit: Token Diet en reglas globales, XML Roles, Action Forcing en templates. |
| v1.8.1 | Auditoría de Documentación: Guardrails estructurales (Tier enforcement, Checkpoints) y limpieza de links legacy. |
