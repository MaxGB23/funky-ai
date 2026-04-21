# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.6.0
- **Rama activa:** `main`
- **Última sesión:** 2026-04-20
- **Estado:** 🟢 Release. v1.6 consolidada (TDD & CI).

---

## 📂 Archivos Clave

| Archivo | Rol |
|---------|-----|
| `funky-cli/src/commands/init.js` | Comando `funky init` — copia ecosystem bootstrap |
| `funky-cli/src/commands/phase.js` | Comando `funky phase <nombre>` — inyecta templates SDD |
| `funky-cli/src/templates/bootstrap/` | Templates canónicos v1.4 que `init` copia |
| `funky-cli/src/templates/sdd/` | Templates del ciclo SDD que `phase` inyecta |
| `funky-cli/src/templates/sdd/worker-handoff.md` | Template oficial del patrón Worker Handoff |
| `docs/engram/discoveries.md` | Memoria de descubrimientos arquitectónicos |
| `docs/engram/bugfixes.md` | Memoria de bugs y fixes |
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

---

## ⏳ Tareas Pendientes

- [x] **Deuda Sistémica:** El template `funky-cli/src/templates/sdd/tasks.md` debe reforzar la Fase de Release con checklist explícito de README + release notes. El Orquestador volvió a omitirla en v1.6 a pesar de estar documentada en `[DISCOVERY][release-dod-gap]`.
- [x] **Auditoría de Journey:** Levantar un Worker para actualizar `docs/funky-ai/journey` con los aprendizajes de TDD, arquitectura SDD y repasar los releases anteriores (v1.0 a v1.5) para asentar lecciones aprendidas.
- [ ] **v1.7 (Propuesta):** Mejorar `funky init` para que genere un `PROJECT-CANVAS.md` dinámico interactivo. → [Ver Diseño y Arquitectura](./openspec/changes/v1.7-project-canvas/proposal.md)
- [ ] **v1.7 Testing:** Agregar (1) Unit tests para la nueva lógica del `PROJECT-CANVAS.md` en `runInit()`, (2) primer Integration Test contra carpeta `tmp/` real para verificar creación en disco. Los tests de v1.6 se mantienen como regresión.
- [ ] **Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 1](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/mierdilla/midudev.md` — Pendiente 2](./docs/funky-ai/mierdilla/midudev.md)
- [ ] **Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.
- [ ] **Optimización del Memory Polling:** Comprobar que el agente efectivamente investigue en el engram cuando sea necesario, y auditar si `grep_search` consume demasiados tokens en archivos largos. Evaluar nuevas estrategias de búsqueda indexada o fragmentada (ya que no contamos con SQLite/vectores como Gentle AI) para no agotar la ventana de contexto.


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
