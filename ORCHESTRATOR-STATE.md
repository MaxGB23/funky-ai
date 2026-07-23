# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v3.0.0
- **Rama activa:** `main`
- **Última sesión:** 2026-07-22
- **Estado:** 🟢 Publicada. Post-release: refinamiento de README y prompt handoff vs native execution.

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
- [x] **Feature: refactor-cli-testing:** (Tier 3) Se abstrajo el File System a través de `fs-adapter` para pruebas puras y se integró resiliencia a templates eliminando aserciones de prosa literal. Feature archivada y root spec `cli-testing` generado.

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