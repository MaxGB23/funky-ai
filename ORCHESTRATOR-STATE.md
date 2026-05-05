# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.15.0
- **Rama activa:** `main`
- **Última sesión:** 2026-05-05
- **Estado:** ✅ Estable. Release v1.15.0 completada.

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
| `docs/engram/index.md` | Índice liviano Two-Stage Polling |
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

## ✅ Tareas Completadas (v1.12)

- [x] **001 Architecture Readiness Assessment:** Template de validación pre-desarrollo y motor de reglas CLI (`funky assess`) implementados.
- [x] **Smoke Test v1.12.0:** Ejecutar un flujo real fuera de tests automatizados para validar `funky assess` y la correcta generación/copia del template `architecture-assessment.md` en un directorio virgen.

---

## ✅ Tareas Completadas (v1.13)

- [x] **007 Architecture Readiness v2 (Context Expansion):** Ampliada evaluación arquitectónica con NFRs (Compliance, Data Residency, Hosting Budget) e integración obligatoria de IA en CLI. (v1.13.0)

---

## ✅ Tareas Completadas (v1.14)

- [x] **008 Renombrar Proposals a RFCs:** `002-project-cost-estimator` migrado a `docs/openspec/rfcs/` con header de RFC explícito (warning de draft crudo). `007-gentle-sdd-tier4` archivado en `docs/openspec/archive/`. Links actualizados en `ORCHESTRATOR-STATE.md`. Issue cerrado.

---

## ✅ Tareas Completadas (v1.15)

- [x] **008 Análisis Forense y Enforcement:** Análisis de las 4 fallas de la sesión 007 (enforcement-vs-documentation). Fixes estructurales aplicados a las reglas de orquestación, `tasks.md` (Agent DRY), y descubrimiento agregado al engrama (`[sdd-failure-forensics-007]`).

---

## ⏳ Tareas Pendientes


- [ ] **010 Auditoría de Estructura del Repo (Backlog):** Recorrer el repositorio carpeta por carpeta y producir un documento de mapa estructural con el rol, propósito y estado de cada directorio. El objetivo es detectar "carpetas fantasma" (directorios sin documentar o sin uso activo), validar que la estructura real coincida con lo documentado en el README y otros artefactos vitales, y establecer una línea base para futuros refactors de organización.
- [ ] **006 Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [ ] **003 Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 1](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **009 Base Templates & Customization Guide (Backlog):** Refactorizar el comando `init` para inyectar templates agnósticos (no acoplados a CLIs) y crear una "Guía de Customización". Esta guía dictará cómo mutar plantillas iniciales (como `tasks.md`) basándose en las decisiones del Project Canvas y Arch-Assessment, evitando el antipatrón de usar presets rígidos. → [Ver RFC](./docs/openspec/rfcs/009-project-templates-and-customization.md)
- [ ] **004 Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 2](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **002 Calculadora de Presupuestos (Backlog):** Crear un template o script interactivo (`project-cost-estimator.md`) para calcular el costo/precio a cobrar por un proyecto freelance/agencia, cruzando características solicitadas por el cliente, NFRs, presupuesto de infraestructura y seniority del equipo. → [Ver RFC](./docs/openspec/rfcs/002-project-cost-estimator.md)
- [ ] **005 Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.

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
| v1.9.0 | Agent DRY Pattern: Handoffs refactorizados como punteros estrictos (Lost in the Middle evitado). |
| v1.10.0 | Automatización Fase 0 y Comando funky release. |
| v1.11.0 | Two-Stage Memory Polling con engram index. |
| v1.12.0 | Architecture Readiness Gate: `funky assess` + motor de reglas (3 reglas MVP) + templates. |
| v1.13.0 | Architecture Readiness v2 (Context Expansion) + NFR parsing. |
| v1.14.0 | Housekeeping: Proposals migradas a RFCs con headers explícitos de draft. |
| v1.15.0 | Enforcement Analysis: Fixes estructurales post sesión 007 y fortalecimiento del SDD. |
