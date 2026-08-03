# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v4.0.0
- **Rama activa:** `main`
- **Última sesión:** 2026-08-03
- **Estado:** 🟢 Publicada. Release v4.0.0 (Movimiento 2): pipeline real state — schema v2 de `context.json`, máquina de estados con resume, salida JSON determinista y result objects.

---

## 📂 Archivos Clave

### Invariantes (siempre en memoria)
| Archivo | Rol |
|---------|-----|
| `.agents/rules/sdd-orchestrator.md` | Reglas del orquestador (invariantes globales, Route A) |
| `.agents/rules/sdd-preflight.md` | Guardrail anti-router prematuro, control de modo y cacheo de sesión |
| `.agents/rules/engram-protocol.md` | Protocolo de memoria persistente |
| `.agents/templates/sdd/` | Templates "golden" — referencia para este workspace |
| `funky-cli/src/commands/` | Lógica core del CLI |

### Contextuales (cargar bajo demanda)
| Categoría | Dónde |
|-----------|-------|
| Tier routers (1/2/3) + escalation matrix | `.agents/rules/tier*-router.md`, `sdd-escalation-matrix.md` |
| Tier 2 delegation templates | `.agents/rules/tier2-delegation/` |
| CLI base templates (distribución) | `funky-cli/src/templates/sdd/` — **no usar para features de este repo** |
| System prompts globales | `docs/prompts/globals/` |
| Prompts SDD por fase | `docs/prompts/sdd/` |
| Living Specs + RFCs + Changes | `openspec/specs/`, `openspec/rfcs/`, `openspec/changes/` |
| Release notes | `docs/funky-ai/releases/` |

---

## ✅ Tareas Completadas
- [x] **v3.0.0 — Subagentes Nativos + JIT Context Loading:** Rediseño arquitectónico completo. Orquestador arranca liviano con solo invariantes globales. Routers JIT por Tier (1/2/3) cargan reglas dinámicamente. Integración de `invoke_subagent` para research sin contaminar contexto. Subagentes con estado Idle para iterar sin re-inicialización. Lanzado 2026-07-21.
- [x] **Post-release v3.0.0:** Refactor radical de README (eliminación de clutter legacy). Prompt de handoff vs native execution agregado a reglas SDD. Wording español neutralizado.
- [x] **v3.5.0 — Pipeline funky-forge:** Orquestador `funky pipeline` (assess/estimate/all/status) con estado compartido vía `context.json`. `funky scaffold` como comando independiente e idempotente. `funky assess` y `funky estimate` reescritos como facilitadores de sesión (guías de discusión, no templates adversariales). Canvases estáticos en `funky init`. Comandos `phase`, `gentle` y `release` eliminados. Guards de escritura (`existsSync`) y manejo amigable de EACCES. `funky --version` lee de `package.json`. Documentación reorganizada (funky-ai vs funky-forge) con docs-live-index y 14 índices seccionales. Smoke test manual end-to-end archivado. Lanzado 2026-07-31.
- [x] **v4.0.0 — Pipeline Real State (Movimiento 2):** `context.json` a schema v2 (estado por fase, `currentPhase`, migración v1→v2 in-place, versiones desconocidas rechazadas sin escritura). `funky pipeline` como máquina de estados con reanudación de corridas interrumpidas y detención si `assess` falla. Salida JSON determinista (`status --json`/`all --json`: un objeto en stdout, texto humano a stderr). Result objects en assess/estimate persistidos vía `updatePhaseState`; `--context` metadata-only con `surfacedPatterns` (renombrado de `dynamicQuestions`). Deltas de spec R-P8..R-P12 aplicados (R-P5 removida). 248 tests / 14 archivos verdes. Lanzado 2026-08-03.

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** PENDIENTE

---

## 🐛 Bugs Activos


---

## 📋 Historial de Versiones
| Versión | Descripción |
|---------|-------------|
| v1.18.0 | `funky feature <name>` + arquitectura modular de scaffolding SDD. |
| v1.18.1 | Doc-patch: fix `--template`, nuevo `escenarios-de-uso.md`, `funky-init-flow.md` actualizado, `OPTIONAL_DOC_UPDATE` en tasks template, engram `[doc-update-index-manual-drift]`. |
| v1.19.0 | Comando `funky estimate` interactivo, generación de `pricing-analysis.md` y Value-Based Pricing. |
| v2.0.0 | Arquitectura de 3 Capas (Global, Workspace Rules, Workflows On-Demand). Migración de flujos SDD a Antigravity Workflows para prevenir el Context Dilution. |
| v2.5.0 | Engram Sharding y comando `funky engram add`. Reemplazo de historial monolítico por indexación semántica distribuida. |
| 2026-06-30 | Feature 024-living-specs completada: Transición a Living Specs en `openspec/specs/`. Flujo de deltas validado con checksums y merge por LLM. |
| v3.0.0 | **MAJOR** — Subagentes Nativos + JIT Context Loading. Routers por Tier (1/2/3). Subagentes con estado Idle. Memory Polling vía Engram. 99 archivos, +3763/-685 líneas. |
| v3.5.0 | **MINOR** — Pipeline funky-forge: `funky pipeline` con `context.json`, `scaffold` independiente e idempotente, `assess`/`estimate` reescritos como facilitadores de sesión, canvases estáticos, guards de escritura, versión desde `package.json`, docs reorganizados con 14 índices seccionales. Lanzado 2026-07-31. |
| v4.0.0 | **MAJOR** — Pipeline Real State (Movimiento 2): schema v2 de `context.json` con estado por fase y migración v1→v2 in-place, máquina de estados con resume, salida JSON determinista (`--json` un objeto en stdout), result objects en assess/estimate, `--context` metadata-only con `surfacedPatterns`. Deltas de spec R-P8..R-P12 (R-P5 removida). 248 tests verdes. Lanzado 2026-08-03. |