# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v4.2.0
- **Rama activa:** `main`
- **Última sesión:** 2026-08-04
- **Estado:** 🟢 Publicada. Release v4.2.0 (funky skills v2): instalador interactivo de skills (multiselect "Todas", autodetección `src/skills/` vía manifests, cancel limpio); índice seccional a 3 niveles; `sdd-release` inyecta `release-notes.md` desde template; regla doc-nuevo en `sdd-docs-sync`; gap de docs v4.1.0 cerrado.

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
- [x] **v4.1.0 — Movimiento Final (Skills gentle-ai):** `funky skills` inyecta las bases de gentle-ai (`sdd-release`, `sdd-docs-sync`) en `.agents/skills/` del destino y bootstrapa los docs compartidos de SDD (`docs-live-index.md` + índice seccional) con formato canónico — idempotente, no sobrescribe goldens. `--help` enriquecido con data viva de docs (degradación graciosa sin doc). Docs compartidos extraídos a templates base (`bootstrap/sdd/`) con paridad de bytes scaffold ↔ skills. Bases autoradas en `templates/gentle/skills/`. Ciclo SDD completo con 272 tests / 17 archivos verdes (7/7 requisitos, 12/12 escenarios). Lanzado 2026-08-03.
- [x] **v4.2.0 — funky skills v2 (Instalador Interactivo):** `funky skills` descubre las skills en `src/skills/` (manifest-per-skill con bin/docs) y las instala con multiselect interactivo ("Todas", cancel limpio, selección parcial) — sin copiar a ciegas. Índice seccional a 3 niveles (`_indice-seccional-template.md` renombrado, paridad scaffold ↔ skills). `sdd-release` inyecta `release-notes.md` desde el template si falta; `sdd-docs-sync` con regla doc-nuevo → doc nuevo (golden + base). Gap de docs v4.1.0 cerrado: `docs/funky-ai/skills.md` + repo-map alineados. Ciclo SDD completo con 284 tests / 17 archivos verdes (12/12 requisitos, 17/17 escenarios). Lanzado 2026-08-04.

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
| v4.1.0 | **MINOR** — Movimiento Final: `funky skills` inyecta bases gentle-ai (sdd-release, sdd-docs-sync) + bootstrap de docs compartidos SDD, idempotente; `--help` enriquecido con data viva de docs; docs compartidos como templates base compartidos con scaffold (paridad de bytes). Bases autoradas en `templates/gentle/skills/`. 272 tests verdes. Lanzado 2026-08-03. |
| v4.2.0 | **MINOR** — funky skills v2: instalador interactivo (multiselect "Todas"/cancel, autodetección `src/skills/` por manifest-per-skill); índice seccional 3 niveles; `sdd-release` inyecta `release-notes.md`; regla doc-nuevo en `sdd-docs-sync`; gap docs v4.1.0 cerrado. 284 tests verdes. Lanzado 2026-08-04. |