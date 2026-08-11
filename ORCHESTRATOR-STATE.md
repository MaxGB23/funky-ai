# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v4.6.0
- **Rama activa:** `main`
- **Última sesión:** 2026-08-11
- **Estado:** 🟢 Publicada. Release v4.6.0 (funky-secure v1 + refactor assess, PR #40): `funky secure doctor/init/check` — el estándar de hardening de dependencias pnpm del RFC `feature-secure.md` pasa de documento a CLI operativo (probe conductual, seed idempotente de `pnpm-workspace.yaml`, gate CI-ready). Docs sync post-merge: `secure.md` en SSOT con índice seccional, mención "Novedad" en README raíz, repo-map alineado. Refactor `funky assess` (architecture-review eliminado). PR #40 mergeado (`d57de04`).

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
- [x] **v4.3.0 — brief-funcional-init:** `funky init` genera el brief funcional como primer output y `funky estimate` lo auto-detecta si no se pasa `--brief` (issue #33, PR #34). Contrato de docs R9 protegido con test real-file de `init.md`; docs de init-flow y README alineadas con el CLI real. Fix de tests: 25 llamadas a `parse(['node', 'assess'/'estimate'], {from:'user'})` → `parse([])`/flags (commander 15 interpreta el array como args puros de usuario; el "ruido too many arguments" del verify-report #342 era un bug real de tests, no drift de lockfile). Suite limpia: 308 tests / 22 archivos verdes con vitest 4.1.10. Lanzado 2026-08-05.
- [x] **v4.3.1 — Refactor de organización de tests:** `estimate.test.js` (1,474 líneas) partido en 4 archivos por unidad bajo prueba (`estimateDomain`, `estimateTopics`, `estimateCommand.integration`, `estimateCommand.flags.integration`) con helper compartido `tests/helpers/fsMock.js`. Meta-test `organization.test.js` enforce cohesión (unit ≤ 500, integration ≤ 800, a lo sumo UN módulo de `src/commands/` por unit) y migra la deuda legacy: `pipeline.test.js`→`pipeline.integration.test.js`, `assess` split con `assessFrontmatter.test.js`, `context` trim con `helpers/contextHelpers.js`, `skills.test.js` solo `commands/skills.js`. `LEGACY_EXCEPTIONS` vacío; convención en skill `vitest` (no en `AGENTS.md`); `AGENTS.md` recortado a 26 líneas. Suite: 311 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-05.
- [x] **v4.3.2 — Fix skills manifests dinámicos:** `funky skills` carga `manifest.js` de cada skill seleccionada con import dinámico (R-SK-8) — cierra el bug "0 creados" por el que una skill nueva detectada no se instalaba (lista MANIFESTS hardcodeada vs detección dinámica). `--help` genérico (docs-sync detectó la lista hardcodeada en la descripción); `discoverSkills` exige SKILL.md + manifest.js con nombre exacto (R-SK-7); `select` único sin selección vacía (R-SK-6). Convención: categoría `.interactive.test.js` documentada en skill `vitest` y aplicada en `organization.test.js`; `AGENTS.md` con disparador para cargar la skill al tocar tests. Test `__all__` dinámico (deriva de detección real, no hardcodea bundled). docs-sync ejecutado pre-release. Suite: 312 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-06.
- [x] **v4.4.0 — Refactor estimate M1-M12:** `funky estimate` con flujo de 3 fases estrictas y contexto unificado (sin `--brief` en la tabla de flags; brief auto-detectado desde init). Tabla base de tarifas por rol SIEMPRE en la guía de pricing (`--pricing-team` la enriquece, M5); avisos con comando correctivo cuando no hay brief (M6/M7/M8/M11); summary con estado por archivo (escrito/omitido/pendiente) en init/assess/estimate (M10); pregunta opcional de costo del problema para el cliente en `funky init` (M9); tabla de costo operativo mensual en pricing-decisions (M12). Pricing-guide aditiva con marcadores sin pares vacíos (M4). Docs sync post-merge: funky-forge/SSOT/README-CLI alineados con el CLI real (PR #36, merge `18341fe`). Lanzado 2026-08-08.
- [x] **v4.5.0 — Rename scaffold→sdd install + scaffold agnóstico:** `funky sdd install` como nombre canónico del framework completo (namespace `sdd` + subcomando `install`); `funky scaffold` re-creado como comando real agnóstico openspec/sdd que instala solo 4 archivos base (README interpolado `{{project_name}}`, ORCHESTRATOR-STATE hub, `release-notes.md`→`.agents/templates/sdd/`, `000-rfc-template.md`→`openspec/rfcs/`) con 27 tests de scaffold (344 totales). `scaffold.md` re-creado + docs-live-index SSOT + índice seccional; repo-map alineado; template README generalizado (hub = ORCHESTRATOR-STATE). PR #38 mergeado (`b4353ca`). Lanzado 2026-08-09.
- [x] **v4.6.0 — funky secure v1 (doctor/init/check):** el estándar de hardening de dependencias pnpm del RFC `feature-secure.md` pasa de documento a CLI: `funky secure doctor` (diagnóstico conductual solo lectura — `pnpm config list --json`, la única vía para leer claves de workspace YAML), `init` (seed idempotente de `pnpm-workspace.yaml` con 7 claves estándar, bloque AGENTS.md, baseline SHA-256 de dev hooks, `.gitignore` `.funky/`, pin de `packageManager`; postura `fail-silent`/`fail-fast`, sin TTY `--posture` obligatorio), `check` (gate CI-ready exit 0/1, violaciones tipadas). Normalización cross-version pnpm 10.x/11.x (kebab-case vs camelCase) y dedup de shims win32 (`.exe`/`.CMD`). Refactor `funky assess` incluido (architecture-review eliminado). 412 tests / 34 archivos verdes (415 pre-refactor). Docs sync post-merge: `secure.md` + SSOT + README "Novedad". PR #40 mergeado (`d57de04`). Lanzado 2026-08-11.

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
| v4.3.0 | **MINOR** — brief-funcional-init: `funky init` genera el brief funcional como primer output; `funky estimate` lo auto-detecta (issue #33); docs alineadas con el CLI real (init-flow + README); test real-file R9 en init.test.js; fix de parse de commander en tests (ruido eliminado). 308 tests verdes con vitest 4.1.10. Lanzado 2026-08-05. |
| v4.3.1 | **PATCH** — refactor de organización de tests: `estimate.test.js` partido en 4 archivos por unidad bajo prueba; meta-test `organization.test.js` (cohesión + topes de tamaño, `LEGACY_EXCEPTIONS` vacío); deuda legacy migrada (`pipeline`→`.integration`, `assess` split, `context` trim, `skills` cohesionado); convención en skill `vitest`; `AGENTS.md` recortado a 26 líneas. 311 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-05. |
| v4.3.2 | **PATCH** — fix skills manifests dinámicos: `funky skills` carga manifests por skill (R-SK-8, bug "0 creados" cerrado); `--help` genérico; `discoverSkills` exige SKILL.md + manifest.js exactos (R-SK-7); `select` único (R-SK-6); categoría `.interactive.test.js` documentada + aplicada en `organization.test.js`; test `__all__` dinámico. 312 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-06. |
| v4.4.0 | **MINOR** — refactor estimate M1-M12 (PR #36): flujo de 3 fases estrictas con contexto unificado; tarifas base por rol SIEMPRE en la guía; avisos correctivos; summary con estado por archivo (M10); costo del problema en init (M9); tabla de costo operativo mensual (M12); pricing-guide aditiva (M4). Docs sync post-merge incluido. Lanzado 2026-08-08. |
| v4.5.0 | **MINOR** — rename scaffold→sdd install + scaffold agnóstico (PR #38): `funky sdd install` como nombre canónico del framework completo; `funky scaffold` como comando real agnóstico que instala solo 4 archivos base (README interpolado, ORCHESTRATOR-STATE, release-notes, 000-rfc-template), idempotente y sin deprecación; docs sync post-merge (scaffold.md en SSOT + índice seccional, repo-map). 344 tests / 28 archivos verdes. Lanzado 2026-08-09. |
| v4.6.0 | **MINOR** — funky secure v1 (PR #40): `doctor` (diagnóstico conductual), `init` (seed idempotente de la política pnpm: 7 claves estándar, bloque AGENTS, baseline SHA-256 de hooks, `.gitignore`, pin packageManager; posturas fail-silent/fail-fast), `check` (gate CI-ready exit 0/1); normalización pnpm 10.x/11.x + dedup win32; refactor assess (architecture-review eliminado); docs sync post-merge (secure.md en SSOT, README "Novedad"). 412 tests / 34 archivos verdes. Lanzado 2026-08-11. |