# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v4.7.0
- **Rama activa:** `main`
- **Última sesión:** 2026-08-12
- **Estado:** 🟢 Publicada. Release v4.7.0 (refactor canvas-phase-1): reestructuración profunda en canvas, assess y estimate. El comando `assess` es ahora el juez arquitectónico definitivo, validado contra 4 ejes, eliminando `architecture-review.md`. `canvas` es un recolector pasivo. `estimate` mejoró su DX con manejo avanzado de tópicos, señales de severidad y reglas multiplicativas, sumando tests de dominio. Docs sync post-merge: `assess.md` alineado con CLI. Branch mergeada a main.

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
- [x] **v4.5.0 — Rename scaffold→sdd install + scaffold agnóstico:** `funky sdd install` como nombre canónico del framework completo (namespace `sdd` + subcomando `install`); `funky scaffold` re-creado como comando real agnóstico openspec/sdd que instala solo 4 archivos base (README interpolado `{{project_name}}`, ORCHESTRATOR-STATE hub, `release-notes.md`→`.agents/templates/sdd/`, `000-rfc-template.md`→`openspec/rfcs/`) con 27 tests de scaffold (344 totales). `scaffold.md` re-creado + docs-live-index SSOT + índice seccional; repo-map alineado; template README generalizado (hub = ORCHESTRATOR-STATE). PR #38 mergeado (`b4353ca`). Lanzado 2026-08-09.
- [x] **v4.6.0 — funky secure v1 (doctor/init/check):** el estándar de hardening de dependencias pnpm del RFC `feature-secure.md` pasa de documento a CLI: `funky secure doctor` (diagnóstico conductual solo lectura — `pnpm config list --json`, la única vía para leer claves de workspace YAML), `init` (seed idempotente de `pnpm-workspace.yaml` con 7 claves estándar, bloque AGENTS.md, baseline SHA-256 de dev hooks, `.gitignore` `.funky/`, pin de `packageManager`; postura `fail-silent`/`fail-fast`, sin TTY `--posture` obligatorio), `check` (gate CI-ready exit 0/1, violaciones tipadas). Normalización cross-version pnpm 10.x/11.x (kebab-case vs camelCase) y dedup de shims win32 (`.exe`/`.CMD`). Refactor `funky assess` incluido (architecture-review eliminado). 412 tests / 34 archivos verdes (415 pre-refactor). Docs sync post-merge: `secure.md` + SSOT + README "Novedad". PR #40 mergeado (`d57de04`). Lanzado 2026-08-11.

---

## ⏳ Tareas Pendientes
- [ ] **Feature `testing-modernization` (Deuda Técnica Integral): Refactor de Aserciones y Extracción de Dominios.** Agrupa dos frentes críticos de testing que afectan a todo el proyecto (no solo a `estimate`):
  1. **Migración Anti-Brittle (Snapshots/Structural):** Refactorizar las >190 aserciones frágiles de copy estático (`expect().toContain()` en `templates`, `skills`, `secureYaml`, etc.) hacia `toMatchSnapshot()` o validaciones estructurales/marcadores, cumpliendo la nueva política de la skill de `vitest` "Repo conventions (funky-ai)".
  2. **Extracción de responsabilidades en `estimateDomain.js`:** Resolver la mezcla en `estimateDomain.js` (rutas legacy, inyección de marcadores, constantes). Extraer el mecanismo de incrustación a un módulo propio para sortear el límite de 500 líneas en tests de forma limpia, sin compactar tests a la fuerza. Definir explícitamente en `AGENTS.md` cuándo aplica compactar vs extraer módulos.
---

## 🐛 Bugs Activos


---

## 📋 Historial de Versiones
| Versión | Descripción |
|---------|-------------|
| v4.2.0 | **MINOR** — funky skills v2: instalador interactivo (multiselect "Todas"/cancel, autodetección `src/skills/` por manifest-per-skill); índice seccional 3 niveles; `sdd-release` inyecta `release-notes.md`; regla doc-nuevo en `sdd-docs-sync`; gap docs v4.1.0 cerrado. 284 tests verdes. Lanzado 2026-08-04. |
| v4.3.0 | **MINOR** — brief-funcional-init: `funky init` genera el brief funcional como primer output; `funky estimate` lo auto-detecta (issue #33); docs alineadas con el CLI real (init-flow + README); test real-file R9 en init.test.js; fix de parse de commander en tests (ruido eliminado). 308 tests verdes con vitest 4.1.10. Lanzado 2026-08-05. |
| v4.3.1 | **PATCH** — refactor de organización de tests: `estimate.test.js` partido en 4 archivos por unidad bajo prueba; meta-test `organization.test.js` (cohesión + topes de tamaño, `LEGACY_EXCEPTIONS` vacío); deuda legacy migrada (`pipeline`→`.integration`, `assess` split, `context` trim, `skills` cohesionado); convención en skill `vitest`; `AGENTS.md` recortado a 26 líneas. 311 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-05. |
| v4.3.2 | **PATCH** — fix skills manifests dinámicos: `funky skills` carga manifests por skill (R-SK-8, bug "0 creados" cerrado); `--help` genérico; `discoverSkills` exige SKILL.md + manifest.js exactos (R-SK-7); `select` único (R-SK-6); categoría `.interactive.test.js` documentada + aplicada en `organization.test.js`; test `__all__` dinámico. 312 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-06. |
| v4.4.0 | **MINOR** — refactor estimate M1-M12 (PR #36): flujo de 3 fases estrictas con contexto unificado; tarifas base por rol SIEMPRE en la guía; avisos correctivos; summary con estado por archivo (M10); costo del problema en init (M9); tabla de costo operativo mensual (M12); pricing-guide aditiva (M4). Docs sync post-merge incluido. Lanzado 2026-08-08. |
| v4.5.0 | **MINOR** — rename scaffold→sdd install + scaffold agnóstico (PR #38): `funky sdd install` como nombre canónico del framework completo; `funky scaffold` como comando real agnóstico que instala solo 4 archivos base (README interpolado, ORCHESTRATOR-STATE, release-notes, 000-rfc-template), idempotente y sin deprecación; docs sync post-merge (scaffold.md en SSOT + índice seccional, repo-map). 344 tests / 28 archivos verdes. Lanzado 2026-08-09. |
| v4.6.0 | **MINOR** — funky secure v1 (PR #40): `doctor` (diagnóstico conductual), `init` (seed idempotente de la política pnpm: 7 claves estándar, bloque AGENTS, baseline SHA-256 de hooks, `.gitignore`, pin packageManager; posturas fail-silent/fail-fast), `check` (gate CI-ready exit 0/1); normalización pnpm 10.x/11.x + dedup win32; refactor assess (architecture-review eliminado); docs sync post-merge (secure.md en SSOT, README "Novedad"). 412 tests / 34 archivos verdes. Lanzado 2026-08-11. |
| v4.7.0 | **MINOR** — refactor canvas-phase-1: canvas es recolector pasivo, assess asume rol de juez arquitectónico definitivo validado contra 4 ejes (se elimina architecture-review.md). estimate mejora DX en tópicos, severidad y reglas multiplicativas. 412 tests verdes (más tests de integración/dominio agregados). Docs sync: assess.md alineado al CLI. Lanzado 2026-08-12. |